package Prova1;
public class Main {

    public static void main(String[] args) {

        int quantidade = Integer.parseInt(
            IO.readln("Quantos livros deseja cadastrar? ")
        );

        Livro[] livros = new Livro[quantidade];

        for (int i = 0; i < livros.length; i++) {

            IO.println("\n===== LIVRO " + (i + 1) + " =====");

            String titulo = IO.readln("Título: ");

            String autor = IO.readln("Autor: ");

            int paginas = Integer.parseInt(
                IO.readln("Quantidade de páginas: ")
            );

            double preco = Double.parseDouble(
                IO.readln("Preço: ")
            );

            livros[i] = new Livro(titulo, autor, paginas, preco);
        }

        IO.println("\n\n========== LIVROS CADASTRADOS ==========");

        for (int i = 0; i < livros.length; i++) {

            IO.println("\n----- Livro " + (i + 1) + " -----");

            livros[i].exibir();
        }
    }
}
