package com.reviva.api.config;

import org.bson.Document;

import java.util.HashMap;
import java.util.Map;

/**
 * Cache de documentos referenciados por @DBRef válido só durante uma requisição HTTP.
 * Sem ele, cada referência (item, doador, receptor...) vira uma ida separada ao MongoDB,
 * e a mesma solicitação ou usuário é buscado dezenas de vezes numa única listagem.
 */
public final class DbRefCache {

    private static final Document AUSENTE = new Document();
    private static final ThreadLocal<Map<String, Document>> CACHE = new ThreadLocal<>();

    private DbRefCache() {}

    public static void iniciar() {
        CACHE.set(new HashMap<>());
    }

    public static void encerrar() {
        CACHE.remove();
    }

    /** Chamado após qualquer escrita, para nunca devolver um documento desatualizado. */
    public static void limpar() {
        Map<String, Document> mapa = CACHE.get();
        if (mapa != null) mapa.clear();
    }

    static boolean ativo() {
        return CACHE.get() != null;
    }

    static String chave(String colecao, Object id) {
        return colecao + ":" + id;
    }

    static boolean contem(String chave) {
        Map<String, Document> mapa = CACHE.get();
        return mapa != null && mapa.containsKey(chave);
    }

    static Document obter(String chave) {
        Document doc = CACHE.get().get(chave);
        return doc == AUSENTE ? null : doc;
    }

    static void guardar(String chave, Document doc) {
        Map<String, Document> mapa = CACHE.get();
        if (mapa != null) mapa.put(chave, doc == null ? AUSENTE : doc);
    }
}
