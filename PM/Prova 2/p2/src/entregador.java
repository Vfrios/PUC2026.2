public class Entregador {
    private String nome;
    private TipoVeiculo veiculo; // Atributo do tipo enum

    public Entregador(String nome, TipoVeiculo veiculo) {
        if (nome == null || nome.trim().isEmpty())
            throw new IllegalArgumentException("Nome vazio");
        this.nome = nome;
        this.veiculo = veiculo;
    }

    public double calcularTaxaEntrega(double distancia) {
        if (distancia <= 0)
            throw new IllegalArgumentException("Distância inválida");
        return veiculo.calcularTaxa(distancia); // Chama o método do enum
    }
}


public enum TipoVeiculo {
    BICICLETA(5.0, 0.0),
    MOTO(0.0, 1.5),
    CARRO(10.0, 2.5);

    private final double taxaFixa;
    private final double taxaPKM;

    TipoVeiculo(double taxaFixa, double taxaPKM) {
        this.taxaFixa = taxaFixa;
        this.taxaPKM = taxaPKM;
    }

    public double calcularTaxa(double distancia) {
        return taxaFixa + (taxaPKM * distancia);
    }
}


public class Main{
    public static void main(String[] args) {
        Entregador e1 = new Entregador("Vitor", TipoVeiculo.CARRO);
        Entregador e2 = new Entregador("ad", TipoVeiculo.BICICLETA);
        Entregador e3 = new Entregador("cd", TipoVeiculo.MOTO);
    }
}
