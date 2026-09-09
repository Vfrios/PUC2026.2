package com.reviva.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * Usuário da plataforma. Um mesmo usuário pode alternar entre os perfis
 * Doador e Receptor a qualquer momento (ver ChooseProfile / Perfil no app).
 */
@Document("usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    private String id;

    private String nome;

    @Indexed(unique = true)
    private String email;

    // A unicidade e garantida pelo indice unico do MongoDB e validada no cadastro.
    @Indexed(name = "cpf_unique", unique = true, sparse = true)
    private String cpf;

    @JsonIgnore // nunca devolver o hash da senha nas respostas da API
    private String senhaHash;

    private String telefone;
    private String fotoUrl;
    private String cep;
    private String numero;
    private String complemento;

    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Integer raioBuscaKm = 5;

    @Builder.Default
    private Boolean emailVerificado = false;

    @Builder.Default
    private Boolean telefoneVerificado = false;

    @Builder.Default
    private Double reputacaoScore = 0.0;

    @Builder.Default
    private Integer itensDoados = 0;

    @Builder.Default
    private Double kgResiduoEvitado = 0.0;

    // Pontuação de gamificação: soma de pontos ganhos ao concluir doações,
    // recebimentos e receber boas avaliações. É o que determina o seloAtual
    // (ver PontuacaoService), diferente de reputacaoScore, que é a média de
    // estrelas (1-5) recebida nas avaliações.
    @Builder.Default
    private Integer pontos = 0;

    @Builder.Default
    private SeloTier seloAtual = SeloTier.BRONZE;

    // @JsonIgnore: evita a recursão infinita Usuario -> Item.doador -> Usuario ao
    // serializar em JSON. Use GET /api/itens/meus para listar os itens do usuário.
    // @ToString.Exclude/@EqualsAndHashCode.Exclude: sem isso o Lombok gera
    // toString()/equals()/hashCode() que percorrem Item -> doador -> Item -> ...
    // (loop infinito -> StackOverflowError no meio da resposta HTTP, que o
    // navegador reporta como ERR_INCOMPLETE_CHUNKED_ENCODING).
    @Builder.Default
    @DBRef(lazy = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Item> itensPublicados = new HashSet<>();

    @Builder.Default
    private Instant criadoEm = Instant.now();

    public enum SeloTier { BRONZE, PRATA, OURO, ESMERALDA }
}
