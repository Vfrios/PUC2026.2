package com.reviva.api.model;

import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import jakarta.persistence.*;
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

@Entity
@Table(name = "itens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doador_id")
    @NotFound(action = NotFoundAction.IGNORE)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario doador;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 2000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    private Categoria categoria;

    @Enumerated(EnumType.STRING)
    private EstadoConservacao estadoConservacao;

    @Enumerated(EnumType.STRING)
    private TipoPublicacao tipoPublicacao;

    @Enumerated(EnumType.STRING)
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

    // fetch = EAGER: por padrão @ElementCollection é LAZY. Com
    // spring.jpa.open-in-view=false a sessão do Hibernate fecha antes do
    // Jackson serializar a resposta, e tentar ler essa lista lazy fora da
    // sessão derruba a conexão no meio do JSON (ERR_INCOMPLETE_CHUNKED_ENCODING).
    // columnDefinition = TEXT: cada foto é salva como data URL em base64 (ver
    // CadastroItem/comprimirImagem no frontend); sem isso o Hibernate usa
    // VARCHAR(255) por padrão e o base64 (várias dezenas de KB) seria truncado.
    @ElementCollection(fetch = FetchType.EAGER)
    @Column(name = "foto_url", columnDefinition = "TEXT")
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
