package com.reviva.api.config;

import com.mongodb.DBRef;
import org.bson.Document;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.convert.DefaultDbRefResolver;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Resolve @DBRef consultando antes o {@link DbRefCache} da requisição atual. */
public class CachingDbRefResolver extends DefaultDbRefResolver {

    public CachingDbRefResolver(MongoDatabaseFactory mongoDbFactory) {
        super(mongoDbFactory);
    }

    @Override
    public Document fetch(DBRef dbRef) {
        if (!DbRefCache.ativo()) return super.fetch(dbRef);
        String chave = DbRefCache.chave(dbRef.getCollectionName(), dbRef.getId());
        if (DbRefCache.contem(chave)) return DbRefCache.obter(chave);
        Document doc = super.fetch(dbRef);
        DbRefCache.guardar(chave, doc);
        return doc;
    }

    @Override
    public List<Document> bulkFetch(List<DBRef> refs) {
        if (!DbRefCache.ativo() || refs.isEmpty()) return super.bulkFetch(refs);
        List<DBRef> faltando = new ArrayList<>();
        for (DBRef ref : refs) {
            if (!DbRefCache.contem(DbRefCache.chave(ref.getCollectionName(), ref.getId()))) faltando.add(ref);
        }
        if (!faltando.isEmpty()) {
            Map<String, Document> buscados = new HashMap<>();
            for (Document doc : super.bulkFetch(faltando)) {
                buscados.put(String.valueOf(doc.get("_id")), doc);
            }
            for (DBRef ref : faltando) {
                DbRefCache.guardar(DbRefCache.chave(ref.getCollectionName(), ref.getId()), buscados.get(String.valueOf(ref.getId())));
            }
        }
        List<Document> resultado = new ArrayList<>();
        for (DBRef ref : refs) {
            Document doc = DbRefCache.obter(DbRefCache.chave(ref.getCollectionName(), ref.getId()));
            if (doc != null) resultado.add(doc);
        }
        return resultado;
    }
}
