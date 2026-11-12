public abstract class Plano {
    protected String aluno;
    protected double valor_base;

    public Plano(String aluno, double valor) {
        if (aluno == null || aluno.isEmpty()) {
            throw new IllegalArgumentException("Nome nao pode estar vazio");
        }
        if (valor == 0) {
            throw new IllegalArgumentException("Valor nao pode ser zero");
        }
        this.aluno = aluno;
        this.valor_base = valor;
    }

    public abstract double calcularValorfinal();

    public String relatorio() {
        return "Aluno" + aluno + " Valor final: " + calcularValorfinal();
    }
}


public class Mensal extends Plano {

    public Mensal(String aluno, double valor) {
        super(aluno, valor);
    }

    @Override
    public double calcularValorfinal() {
        return valor_base;
    }

    @Override
    public String relatorio() {
        return "Aluno: " + aluno + " Valor final: " + calcularValorfinal();
    }
}


public class Trimestral extends Plano {
    private static final double DESCONTO = 0.9;
    private static final double MINIMO = 100.0;

    public Trimestral(String aluno, double valor_base) {
        super(aluno, valor_base);

        if (valor_base < MINIMO)
            throw new IllegalArgumentException("Valor base maior que 100");
    }

    @Override
    public double calcularValorfinal() {
        return valor_base * DESCONTO;
    }

    @Override
    public String relatorio() {
        return "Aluno: " + aluno + " Valor final: " + calcularValorfinal();
    }
}


public class Anual extends Plano {
    private static final double DESCONTO = 0.8;
    private static final double MINIMO = 200.0;
    private static final double MATRICULA = 50.0;

    public Anual(String aluno, double valor_base) {
        super(aluno, valor_base);
        if (valor_base < MINIMO)
            throw new IllegalArgumentException("Valor base dev ser maior que 200");
    }
    
    @Override 
    public double calcularValorfinal() {
        return valor_base * DESCONTO + MATRICULA;
    }

    @Override 
    public String relatorio() {
        return "Aluno: " + aluno + "Valor final: " + calcularValorfinal();
    }
}
