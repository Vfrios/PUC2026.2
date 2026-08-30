import java.util.Scanner;
import java.util.List;
import java.util.ArrayList;

public class L00 {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int opcao;

        do {
            System.out.println("\n========== MENU DE EXERCÍCIOS ==========");
            System.out.println("1 a 7  - Exercícios de Lógica, Condicionais e Strings");
            System.out.println("8 a 10 - Exercícios de Programação Orientada a Objetos");
            System.out.println("0      - Sair do programa");
            System.out.print("\nDigite o número do exercício que deseja ver: ");

            opcao = scanner.nextInt();

            // Quebra de linha para separar o menu da execução do exercício
            System.out.println("----------------------------------------");

            switch (opcao) {
                case 1:
                    ex1(scanner);
                    break;
                case 2:
                    ex2(scanner);
                    break;
                case 3:
                    ex3(scanner);
                    break;
                case 4:
                    ex4(scanner);
                    break;
                case 5:
                    ex5(scanner);
                    break;
                case 6:
                    ex6();
                    break;
                case 7:
                    ex7(scanner);
                    break;
                case 8:
                    ex8();
                    break;
                case 9:
                    ex9();
                    break;
                case 10:
                    ex10();
                    break;
                case 0:
                    System.out.println("Encerrando o programa. Até mais!");
                    break;
                default:
                    System.out.println("Opção inválida! Escolha um número entre 1 e 10, ou 0 para sair.");
            }

            System.out.println("----------------------------------------");

        } while (opcao != 0); // O loop continua rodando até o usuário digitar 0

        scanner.close();
    }

    // ==================== ETAPA 1: AQUECIMENTO ====================

    /**
     * Exercício 1 — Entrada, saída e operações
     * Leia dois números inteiros. Calcule e imprima: soma, subtração,
     * multiplicação, divisão inteira e resto.
     */
    public static void ex1(Scanner scanner) {
        System.out.println("=== Exercício 1 ===");
        System.out.print("Digite o primeiro número inteiro: ");
        int a = scanner.nextInt();
        System.out.print("Digite o segundo número inteiro: ");
        int b = scanner.nextInt();

        System.out.println("Soma: " + (a + b));
        System.out.println("Subtração: " + (a - b));
        System.out.println("Multiplicação: " + (a * b));

        if (b != 0) {
            System.out.println("Divisão inteira: " + (a / b));
            System.out.println("Resto da divisão: " + (a % b));
        } else {
            System.out.println("Não é possível realizar divisão por zero.");
        }
    }

    /**
     * Exercício 2 — Condicionais
     * Leia uma idade e informe:
     * 0-12 (Criança), 13-17 (Adolescente), 18-59 (Adulto), 60+ (Idoso).
     */
    public static void ex2(Scanner scanner) {
        System.out.println("\n=== Exercício 2 ===");
        System.out.print("Digite a sua idade: ");
        int idade = scanner.nextInt();

        if (idade >= 0 && idade <= 12) {
            System.out.println("Classificação: Criança");
        } else if (idade >= 13 && idade <= 17) {
            System.out.println("Classificação: Adolescente");
        } else if (idade >= 18 && idade <= 59) {
            System.out.println("Classificação: Adulto");
        } else if (idade >= 60) {
            System.out.println("Classificação: Idoso");
        } else {
            System.out.println("Idade inválida.");
        }
    }

    /**
     * Exercício 3 — For
     * Leia um número N e imprima de 1 até N.
     * Depois, imprima somente os números pares.
     */
    public static void ex3(Scanner scanner) {
        System.out.println("\n=== Exercício 3 ===");
        System.out.print("Digite um número N: ");
        int n = scanner.nextInt();

        System.out.print("De 1 até N: ");
        for (int i = 1; i <= n; i++) {
            System.out.print(i + " ");
        }
        System.out.println();

        System.out.print("Somente os pares: ");
        for (int i = 2; i <= n; i += 2) {
            System.out.print(i + " ");
        }
        System.out.println();
    }

    /**
     * Exercício 4 — While
     * Leia números inteiros até digitar 0.
     * Mostre: quantidade de números digitados, soma e média.
     */
    public static void ex4(Scanner scanner) {
        System.out.println("\n=== Exercício 4 ===");
        System.out.println("Digite números inteiros (0 para parar):");

        int qtd = 0;
        int soma = 0;
        int numero;

        while (true) {
            numero = scanner.nextInt();
            if (numero == 0) {
                break;
            }
            qtd++;
            soma += numero;
        }

        System.out.println("Quantidade de números (excluindo 0): " + qtd);
        System.out.println("Soma: " + soma);
        if (qtd > 0) {
            System.out.println("Média: " + ((double) soma / qtd));
        } else {
            System.out.println("Média: 0");
        }
    }

    // ==================== ETAPA 2: MÉTODOS ====================

    /**
     * Exercício 5 — Calculadora com métodos
     * O main deve apenas ler os números e chamar os métodos.
     */
    public static void ex5(Scanner scanner) {
        System.out.println("\n=== Exercício 5 ===");
        System.out.print("Digite o primeiro número (double): ");
        double n1 = scanner.nextDouble();
        System.out.print("Digite o segundo número (double): ");
        double n2 = scanner.nextDouble();

        System.out.println("Soma: " + somar(n1, n2));
        System.out.println("Subtração: " + subtrair(n1, n2));
        System.out.println("Multiplicação: " + multiplicar(n1, n2));
        System.out.println("Divisão: " + dividir(n1, n2));
    }

    public static double somar(double a, double b) {
        return a + b;
    }

    public static double subtrair(double a, double b) {
        return a - b;
    }

    public static double multiplicar(double a, double b) {
        return a * b;
    }

    public static double dividir(double a, double b) {
        if (b == 0) {
            System.out.println("Erro: divisão por zero.");
            return Double.NaN;
        }
        return a / b;
    }

    /**
     * Exercício 6 — Maior número (Sobrecarga)
     */
    public static void ex6() {
        System.out.println("\n=== Exercício 6 ===");
        System.out.println("Testando maior entre 5 e 10: " + maior(5, 10));
        System.out.println("Testando maior entre 15, 3 e 8: " + maior(15, 3, 8));
    }

    public static int maior(int a, int b) {
        return (a > b) ? a : b;
    }

    public static int maior(int a, int b, int c) {
        return maior(maior(a, b), c);
    }

    // ==================== ETAPA 3: STRINGS ====================

    /**
     * Exercício 7 — Analisador de texto
     * Leia uma palavra e informe: quantidade de caracteres, primeiro caractere,
     * último caractere, se contém "a" e a palavra invertida.
     */
    public static void ex7(Scanner scanner) {
        System.out.println("\n=== Exercício 7 ===");
        System.out.print("Digite uma palavra: ");
        String palavra = scanner.next();

        System.out.println("Quantidade de caracteres: " + palavra.length());
        System.out.println("Primeiro caractere: " + palavra.charAt(0));
        System.out.println("Último caractere: " + palavra.charAt(palavra.length() - 1));

        boolean contemA = palavra.toLowerCase().contains("a");
        System.out.println("Contém a letra 'a'? " + (contemA ? "Sim" : "Não"));

        String invertida = new StringBuilder(palavra).reverse().toString();
        System.out.println("Palavra invertida: " + invertida);
    }

    // ==================== ETAPA 4: POO ====================

    public static void ex8() {
        System.out.println("\n=== Exercício 8 (Testando Produto) ===");
        Produto p = new Produto("Notebook", 3500.00, 10);
        p.mostrarInformacoes();
        p.adicionarEstoque(5);
        p.removerEstoque(2);
        p.alterarPreco(3200.00);
        p.mostrarInformacoes();
    }

    public static void ex9() {
        System.out.println("\n=== Exercício 9 (Testando Conta) ===");
        Conta c = new Conta("1234-5", "João Silva", 1000.0);
        c.consultarSaldo();
        c.depositar(500.0);
        c.sacar(200.0);
        c.sacar(2000.0); // Deve ser negado
        c.depositar(-50.0); // Deve ser negado
        c.consultarSaldo();
    }

    public static void ex10() {
        System.out.println("\n=== Exercício 10 (Testando Pedido) ===");
        Pedido ped = new Pedido(1, "Maria Oliveira");

        Produto p1 = new Produto("Teclado", 150.0, 1); // Quantidade não importa tanto pro pedido, mas sim para o
                                                       // estoque
        Produto p2 = new Produto("Mouse", 80.0, 1);

        ped.adicionarProduto(p1);
        ped.adicionarProduto(p2);

        ped.mostrarPedido();

        ped.removerProduto(p1);
        System.out.println("Após remover o teclado:");
        ped.mostrarPedido();
    }
}

// ==================== CLASSES (POO) ====================

/**
 * Exercício 8 — Classe Produto
 * Crie uma classe Produto com os atributos: nome, preco e quantidade.
 * Implemente um construtor para inicializar esses atributos.
 * Crie os métodos:
 * - alterarPreco(double novoPreco): atualiza o preço.
 * - adicionarEstoque(int qtd): aumenta a quantidade em estoque.
 * - removerEstoque(int qtd): diminui a quantidade, validando se há estoque
 * suficiente.
 * - calcularValorTotal(): retorna o valor total (preco * quantidade).
 * - mostrarInformacoes(): exibe todos os dados do produto e o valor total.
 */
class Produto {
    private String nome;
    private double preco;
    private int quantidade;

    public Produto(String nome, double preco, int quantidade) {
        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
    }

    public void alterarPreco(double novoPreco) {
        if (novoPreco >= 0) {
            this.preco = novoPreco;
        } else {
            System.out.println("Erro: Preço não pode ser negativo.");
        }
    }

    public void adicionarEstoque(int qtd) {
        if (qtd > 0) {
            this.quantidade += qtd;
        }
    }

    public void removerEstoque(int qtd) {
        if (qtd > 0 && this.quantidade >= qtd) {
            this.quantidade -= qtd;
        } else {
            System.out.println("Erro: Estoque insuficiente ou valor inválido.");
        }
    }

    public double calcularValorTotal() {
        return this.preco * this.quantidade;
    }

    public void mostrarInformacoes() {
        System.out.println("Produto: " + this.nome + " | Preço: R$" + this.preco +
                " | Estoque: " + this.quantidade +
                " | Valor total em estoque: R$" + calcularValorTotal());
    }

    // Getters utilizados na classe Pedido
    public String getNome() {
        return nome;
    }

    public double getPreco() {
        return preco;
    }
}

/**
 * Exercício 9 — Classe Conta Bancária
 * Crie uma classe Conta com os atributos: numero, titular e saldo.
 * Implemente um construtor para inicializar os atributos.
 * Crie os métodos:
 * - depositar(double valor): adiciona dinheiro ao saldo.
 * - sacar(double valor): retira dinheiro do saldo.
 * - consultarSaldo(): exibe o saldo atual, número da conta e titular.
 * Regras obrigatórias:
 * - Não permitir depósito de valor negativo.
 * - Não permitir saque maior que o saldo disponível.
 * - Não permitir saque de valor negativo.
 */
class Conta {
    private String numero;
    private String titular;
    private double saldo;

    public Conta(String numero, String titular, double saldoInicial) {
        this.numero = numero;
        this.titular = titular;
        this.saldo = Math.max(saldoInicial, 0); // Garante que não inicie negativo
    }

    public void depositar(double valor) {
        if (valor > 0) {
            this.saldo += valor;
            System.out.println("Depósito de R$" + valor + " realizado com sucesso.");
        } else {
            System.out.println("Erro: Não é possível depositar valor nulo ou negativo.");
        }
    }

    public void sacar(double valor) {
        if (valor <= 0) {
            System.out.println("Erro: Não é possível sacar valor nulo ou negativo.");
        } else if (valor > this.saldo) {
            System.out.println("Erro: Saldo insuficiente para o saque.");
        } else {
            this.saldo -= valor;
            System.out.println("Saque de R$" + valor + " realizado com sucesso.");
        }
    }

    public void consultarSaldo() {
        System.out.println("Conta: " + this.numero + " | Titular: " + this.titular +
                " | Saldo Atual: R$" + this.saldo);
    }
}

/**
 * Exercício 10 — Classe Pedido (Associação de Classes)
 * Crie uma classe Pedido com os atributos: numero, cliente e uma lista de
 * produtos.
 * Implemente um construtor que receba número e cliente, e inicialize a lista
 * vazia.
 * Crie os métodos:
 * - adicionarProduto(Produto produto): insere um produto na lista.
 * - removerProduto(Produto produto): remove um produto da lista.
 * - calcularTotal(): percorre a lista e retorna a soma dos preços dos produtos.
 * - mostrarPedido(): exibe o número, cliente, itens adicionados e o valor
 * total.
 */
class Pedido {
    private int numero;
    private String cliente;
    private List<Produto> listaDeProdutos;

    public Pedido(int numero, String cliente) {
        this.numero = numero;
        this.cliente = cliente;
        this.listaDeProdutos = new ArrayList<>();
    }

    public void adicionarProduto(Produto produto) {
        this.listaDeProdutos.add(produto);
    }

    public void removerProduto(Produto produto) {
        if (this.listaDeProdutos.contains(produto)) {
            this.listaDeProdutos.remove(produto);
        } else {
            System.out.println("Produto não encontrado no pedido.");
        }
    }

    public double calcularTotal() {
        double total = 0;
        for (Produto p : listaDeProdutos) {
            total += p.getPreco();
        }
        return total;
    }

    public void mostrarPedido() {
        System.out.println("=== Pedido #" + this.numero + " ===");
        System.out.println("Cliente: " + this.cliente);
        System.out.println("Itens:");
        for (Produto p : listaDeProdutos) {
            System.out.println("- " + p.getNome() + ": R$" + p.getPreco());
        }
        System.out.println("Total do Pedido: R$" + calcularTotal());
        System.out.println("====================");
    }
}
