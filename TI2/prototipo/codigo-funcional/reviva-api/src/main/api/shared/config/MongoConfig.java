package com.reviva.api.config;

import com.reviva.api.model.Usuario;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class MongoConfig {

    /** O Jackson não participa da leitura do Mongo; este converter aplica o mesmo fallback tolerante. */
    @ReadingConverter
    enum SeloTierReadConverter implements Converter<String, Usuario.SeloTier> {
        INSTANCE;

        @Override
        public Usuario.SeloTier convert(String source) {
            return Usuario.SeloTier.fromValue(source);
        }
    }

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return MongoCustomConversions.create(adapter ->
                adapter.registerConverter(SeloTierReadConverter.INSTANCE));
    }

    @Bean
    public PlatformTransactionManager transactionManager(MongoDatabaseFactory databaseFactory) {
        return new MongoTransactionManager(databaseFactory);
    }
}
