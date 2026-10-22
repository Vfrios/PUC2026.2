public abstract class Forma {
    protected String descricao;

    public Forma(String d) {
        if (d == null || d.trim().isEmpty())
            throw new IllegalArgumentException("Descrição vazia");
        this.descricao = d;
    }

    public String relatorio() {
        return descricao + " | Área: " + String.format("%.2f", area());
    }

    public abstract double area();
}
public class Retangulo extends Forma {
    private double base, altura;

    public Retangulo(String d, double b, double a) {
        super(d);
        if (b <= 0 || a <= 0) throw new IllegalArgumentException("Dimensão inválida");
        this.base = b;
        this.altura = a;
    }

    @Override
    public double area() {
        return base * altura;
    }
}
public class Main {
    public static void main(String[] args) {
        Forma f1 = new Retangulo("Retangulo", 12, 3);
        Forma f2 = new Circulo("Circulo", 5);
        Forma f3 = new Triangulo("Triangulo", 10, 5);

        System.out.println(f1.relatorio());
        System.out.println(f2.relatorio());
        System.out.println(f3.relatorio());
    }
}
