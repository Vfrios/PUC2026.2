package com.reviva.api.config;

import com.mongodb.DBRef;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Carrega listas de entidades com @DBRef em poucas idas ao MongoDB.
 * Busca os documentos brutos, junta as referências de todos eles e traz cada coleção
 * referenciada numa única consulta ($in), nível a nível (ex.: solicitação → item → doador).
 * Os documentos ficam no {@link DbRefCache}, e a conversão para a entidade não consulta de novo.
 */
@Component
public class CarregadorEmLote {

    private static final int PROFUNDIDADE_MAXIMA = 3;

    private final MongoTemplate mongoTemplate;

    public CarregadorEmLote(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    /** O filtro deve usar valores brutos (Strings, ObjectIds, nomes de enum). */
    public <T> List<T> buscar(Document filtro, Document ordenacao, int limite, Class<T> tipo) {
        var cursor = mongoTemplate.getCollection(mongoTemplate.getCollectionName(tipo)).find(filtro);
        if (ordenacao != null) cursor = cursor.sort(ordenacao);
        if (limite > 0) cursor = cursor.limit(limite);
        List<Document> docs = cursor.into(new ArrayList<>());
        return converter(docs, tipo);
    }

    public <T> List<T> buscar(Document filtro, Class<T> tipo) {
        return buscar(filtro, null, 0, tipo);
    }

    private <T> List<T> converter(List<Document> docs, Class<T> tipo) {
        if (!DbRefCache.ativo()) {
            // Fora de uma requisição HTTP (ex.: tarefas agendadas) o cache não existe.
            DbRefCache.iniciar();
            try {
                return preCarregarEConverter(docs, tipo);
            } finally {
                DbRefCache.encerrar();
            }
        }
        return preCarregarEConverter(docs, tipo);
    }

    private <T> List<T> preCarregarEConverter(List<Document> docs, Class<T> tipo) {
        List<Document> nivel = docs;
        for (int i = 0; i < PROFUNDIDADE_MAXIMA && !nivel.isEmpty(); i++) {
            nivel = preCarregar(nivel);
        }
        List<T> resultado = new ArrayList<>(docs.size());
        for (Document doc : docs) {
            resultado.add(mongoTemplate.getConverter().read(tipo, doc));
        }
        return resultado;
    }

    /** Busca as referências ainda não carregadas e devolve os documentos novos (próximo nível). */
    private List<Document> preCarregar(List<Document> docs) {
        Map<String, Set<Object>> idsPorColecao = new HashMap<>();
        for (Document doc : docs) {
            for (Object valor : doc.values()) {
                coletar(valor, idsPorColecao);
            }
        }
        List<Document> novos = new ArrayList<>();
        idsPorColecao.forEach((colecao, ids) -> {
            List<Object> filtroIds = new ArrayList<>();
            for (Object id : ids) {
                filtroIds.add(id);
                if (id instanceof String s && ObjectId.isValid(s)) filtroIds.add(new ObjectId(s));
                if (id instanceof ObjectId o) filtroIds.add(o.toHexString());
            }
            Map<String, Document> encontrados = new HashMap<>();
            for (Document d : mongoTemplate.getCollection(colecao).find(new Document("_id", new Document("$in", filtroIds)))) {
                encontrados.put(String.valueOf(d.get("_id")), d);
            }
            for (Object id : ids) {
                Document d = encontrados.get(String.valueOf(id));
                DbRefCache.guardar(DbRefCache.chave(colecao, id), d);
                if (d != null) novos.add(d);
            }
        });
        return novos;
    }

    private void coletar(Object valor, Map<String, Set<Object>> idsPorColecao) {
        String colecao = null;
        Object id = null;
        if (valor instanceof DBRef ref) {
            colecao = ref.getCollectionName();
            id = ref.getId();
        } else if (valor instanceof Document d && d.get("$ref") instanceof String ref && d.get("$id") != null) {
            colecao = ref;
            id = d.get("$id");
        } else if (valor instanceof List<?> lista) {
            lista.forEach(v -> coletar(v, idsPorColecao));
            return;
        }
        if (colecao == null || DbRefCache.contem(DbRefCache.chave(colecao, id))) return;
        idsPorColecao.computeIfAbsent(colecao, c -> new LinkedHashSet<>()).add(id);
    }
}
