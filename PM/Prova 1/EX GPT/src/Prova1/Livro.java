package Prova1;
public class Livro {

    private String titulo;
    private String autor;
    private int paginas;
    private double preco;

    public Livro(String novoTitulo, String novoAutor, int novasPaginas, double novoPreco) {
        setTitulo(novoTitulo);
        setAutor(novoAutor);
        setPaginas(novasPaginas);
        setPreco(novoPreco);
    }

    public void setTitulo(String novoTitulo) {
        titulo = novoTitulo;
    }

    public void setAutor(String novoAutor) {
        autor = novoAutor;
    }

    public void setPaginas(int novasPaginas) {
        paginas = novasPaginas < 0 ? 0 : novasPaginas;
    }

    public void setPreco(double novoPreco) {
        preco = novoPreco < 0 ? 0 : novoPreco;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getAutor() {
        return autor;
    }

    public int getPaginas() {
        return paginas;
    }

    public double getPreco() {
        return preco;
    }

    public String getCategoria() {
        if (paginas < 150) {
            return "Curto";
        } else if (paginas <= 300) {
            return "Médio";
        } else {
            return "Longo";
        }
    }

    public double getPrecoComDesconto() {
        if (paginas < 150) {
            return preco * 0.95;
        } else if (paginas <= 300) {
            return preco * 0.90;
        } else {
            return preco * 0.85;
        }
    }

    public void exibir() {
        IO.println("Título: " + titulo);
        IO.println("Autor: " + autor);
        IO.println("Páginas: " + paginas);
        IO.println("Preço: R$ " + preco);
        IO.println("Categoria: " + getCategoria());
        IO.println("Preço com desconto: R$ " + getPrecoComDesconto());
    }
}
