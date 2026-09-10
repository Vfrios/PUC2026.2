package com.reviva.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Document("itens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    private String id;

    @DBRef(lazy = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario doador;

    private String titulo;

    private String descricao;

    private Categoria categoria;

    private EstadoConservacao estadoConservacao;

    private TipoPublicacao tipoPublicacao;

    @Builder.Default
    private StatusItem status = StatusItem.ATIVO;

    private Double latitude;
    private Double longitude;
    private String cep;
    private String numero;
    private String complemento;
    private String bairro;
    private String cidade;
    private String uf;

    /** Estimativa de kg de resíduo evitado ao reaproveitar este item. */
    private Double impactoCo2Kg;

    /** Peso aproximado do item, usado como medida principal de material reutilizado. */
    private Double pesoKg;

    // As fotos são armazenadas como data URLs em base64 no documento MongoDB.
    @Builder.Default
    private List<String> fotosUrls = new ArrayList<>();

    /** Gerado quando um agendamento é confirmado; escaneado na retirada. */
    private String qrCodeToken;

    @Builder.Default
    private Instant publicadoEm = Instant.now();

    /** Prazo de validade do anúncio (padrão de 60 dias, igual à OLX). Ao editar
     *  o item o prazo é renovado — ver ItemService.editar. Anúncios vencidos
     *  saem da busca pública mas continuam visíveis em "Meus itens". */
    @Builder.Default
    private Instant expiraEm = Instant.now().plus(60, ChronoUnit.DAYS);

    public enum Categoria { ROUPAS, LIVROS, MOVEIS, INFANTIL, ELETRONICOS, COZINHA, OUTROS }
    public enum EstadoConservacao { NOVO, SEMINOVO, USADO }
    public enum TipoPublicacao { DOAR, TROCAR }
    public enum StatusItem { ATIVO, EM_NEGOCIACAO, DOADO, REMOVIDO }
}
