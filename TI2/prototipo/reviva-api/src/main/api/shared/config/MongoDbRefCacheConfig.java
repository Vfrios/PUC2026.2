package com.reviva.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.AfterDeleteEvent;
import org.springframework.data.mongodb.core.mapping.event.AfterSaveEvent;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/** Liga o {@link DbRefCache}: conversor com o resolvedor em cache e escopo por requisição. */
@Configuration
public class MongoDbRefCacheConfig {

    @Bean
    public MappingMongoConverter mappingMongoConverter(MongoDatabaseFactory factory, MongoMappingContext context,
                                                       MongoCustomConversions conversions) {
        MappingMongoConverter converter = new MappingMongoConverter(new CachingDbRefResolver(factory), context);
        converter.setCustomConversions(conversions);
        return converter;
    }

    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> dbRefCacheFilter() {
        OncePerRequestFilter filtro = new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                                            @NonNull FilterChain chain) throws ServletException, IOException {
                DbRefCache.iniciar();
                try {
                    chain.doFilter(request, response);
                } finally {
                    DbRefCache.encerrar();
                }
            }
        };
        FilterRegistrationBean<OncePerRequestFilter> registro = new FilterRegistrationBean<>(filtro);
        registro.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registro;
    }

    @Bean
    public AbstractMongoEventListener<Object> dbRefCacheInvalidator() {
        return new AbstractMongoEventListener<>() {
            @Override
            public void onAfterSave(@NonNull AfterSaveEvent<Object> event) {
                DbRefCache.limpar();
            }

            @Override
            public void onAfterDelete(@NonNull AfterDeleteEvent<Object> event) {
                DbRefCache.limpar();
            }
        };
    }
}
