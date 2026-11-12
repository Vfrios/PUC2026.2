/**
 * Vendas
 */
public class Vendas {
    private double valorBase;
    private TipoPag pagamento;

    public Vendas(double valorBase, TipoPag pagamento) {
        if (valorBase < 0)
            throw new IllegalArgumentException("Valor base tem que er positivo");

        if (pagamento.CARTAO < 10.0 || pagamento.BOLETO < 5.0)
            throw new IllegalArgumentException("Valor para cartao acima de 10 e boleto acima de 5");
        this.valorBase = valorBase;
        this.pagamento = pagamento;
    }

    public String recibo() {
        return "Pagamento via: " + pagamento +
                "Valor base: " + valorBase +
                "Valor Final: " + pagamento.calcularValorFinal(valorBase);
    }

}

public enum TipoPag {
    PIX(0.0,0.0),
    CARTAO(0.0,0.5),
    BOLETO(3.5, 0.0);

    private final double taxaFixa;
    private final double taxaJuros;

    TipoPag(double taxaFixa, double taxaJuros) {
        this.taxaFixa = taxaFixa;
        this.taxaJuros = taxaJuros;
    }

    public double calcularValorFinal(double valorBase) {
        return taxaFixa + (valorBase * (1 + taxaJuros));
    }
}


public static void main(String[] args) {
    Vendas v1 = new Vendas(130,TipoPag.BOLETO);
    Vendas v2 = new Vendas(40,TipoPag.PIX);
    Vendas v3 = new Vendas(50, TipoPag.CARTAO);

    IO.println(v1.recibo());
    IO.println(v2.recibo());
    
    IO.println(v3.recibo());
}
