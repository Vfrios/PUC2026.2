import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;

public class L01 {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // LISTA DINÂMICA - PODE CRESCER INFINITAMENTE
        List<Runnable> exercicios = new ArrayList<>();

        // ADICIONE QUANTOS EXERCÍCIOS QUISER
        exercicios.add(() -> ex1()); // índice 0
        exercicios.add(() -> ex2()); // índice 1
        exercicios.add(() -> ex3()); // índice 2
        exercicios.add(() -> ex4()); // índice 3
        exercicios.add(() -> ex5()); // índice 4
        exercicios.add(() -> ex6()); // índice 5
        exercicios.add(() -> ex7());
        exercicios.add(() -> ex8());
        exercicios.add(() -> ex9());
        exercicios.add(() -> ex10());
        exercicios.add(() -> ex11());
        exercicios.add(() -> ex12());
        exercicios.add(() -> ex13());
        exercicios.add(() -> ex14());
        exercicios.add(() -> ex15());
        exercicios.add(() -> desafio());
        exercicios.add(() -> desafio2());

        int opcao;

        do {
            // MOSTRA TODOS OS EXERCÍCIOS CADASTRADOS
            IO.println("0 - Sair");
            for (int i = 0; i < exercicios.size(); i++) {
                IO.println((i + 1) + " - Exercício " + (i + 1));
            }
            IO.print("\nEscolha o exercício: ");

            opcao = Integer.parseInt(IO.readln("Digite um número: ").trim());
            IO.println("----------------------------------------");

            if (opcao == 0) {
                IO.println("Encerrando...");
            } else if (opcao >= 1 && opcao <= exercicios.size()) {
                exercicios.get(opcao - 1).run(); // -1 pq lista começa em 0
            } else {
                IO.println("Opção inválida!");
            }

            IO.println("----------------------------------------");

        } while (opcao != 0);

        scanner.close();
    }

    /**
     * Exercício 1 — Saída de dados
     * Imprima a frase "Olá, Mundo!" no console.
     */
    public static void ex1() {
        IO.println("ola mundo");
    }

    /**
     * Exercício 2 — Variáveis
     * Crie duas variáveis inteiras e atribua valores a elas (ex: 5 e 7).
     * Calcule a soma das duas e imprima o resultado.
     */
    public static void ex2() {
        int x = Integer.parseInt(IO.readln("Digite um numero ").trim());
        int y = Integer.parseInt(IO.readln("Digite um numero ").trim());
        IO.println(x + y);
    }

    /**
     * Exercício 3 — Entrada de dados
     * Peça para o usuário digitar o nome dele.
     * Leia o nome e imprima uma mensagem dizendo: "Bem-vindo, [nome]".
     */
    public static void ex3() {
        String name = IO.readln("Digite seu nome ");
        IO.println("bem vindo" + name);
    }

    /**
     * Exercício 4 — Condicional básica
     * Peça para o usuário digitar a idade.
     * Se a idade for 18 ou mais, imprima "Maior de idade".
     * Se for menor, imprima "Menor de idade".
     */
    public static void ex4() {
        int age = Integer.parseInt(IO.readln("Digite sua idade").trim());
        if (age < 18)
            IO.println("menor de idade e sua idade é: " + age);
        else
            IO.println("maior de idade e sua idade é: " + age);
    }

    /**
     * Exercício 5 — Laço básico
     * Crie um laço de repetição que imprima os números de 1 até 5.
     */
    public static void ex5() {
        for (int i = 1; i < 6; i++)
            IO.println(i);
    }

    /**
     * Exercício 6 — Comparação de Strings
     * Leia duas palavras do teclado usando IO.readln().
     * Compare as duas usando '==' e imprima o resultado (provavelmente dará false).
     * Compare as duas usando '.equals()' e imprima o resultado.
     * Use o método '.equalsIgnoreCase()' para comparar ignorando maiúsculas e
     * minúsculas.
     */
    public static void ex6() {
        String palavra1 = IO.readln("Digite a primeira palavra: ").trim();
        String palavra2 = IO.readln("Digite a segunda palavra igualzinha à primeira: ").trim();

        // Em Java, '==' compara o ENDEREÇO DE MEMÓRIA (ponteiros), não o conteúdo!
        IO.println("Usando '==': " + (palavra1 == palavra2));

        // '.equals()' compara o texto letra por letra (como o == do C++)
        IO.println("Usando '.equals()': " + palavra1.equals(palavra2));

        // Bônus do Java: ignorar maiúsculas e minúsculas facilmente
        IO.println("Usando '.equalsIgnoreCase()': " + palavra1.equalsIgnoreCase(palavra2));
    }

    /**
     * Exercício 7 — Arrays Inteligentes
     * Peça para o usuário digitar o tamanho do array.
     * Crie um array de inteiros com esse tamanho (ex: int[] arr = new
     * int[tamanho]).
     * Faça um 'for' usando 'arr.length' como limite para ler e preencher o array.
     * Depois, faça um "for-each" ( for(int x : arr) ) para imprimir os valores.
     */
    public static void ex7() {
        int tamanho = Integer.parseInt(IO.readln("Qual o tamanho do array? ").trim());

        // Alocando na Heap (sem precisar de delete depois!)
        int[] arr = new int[tamanho];

        // No Java, arrays são objetos e sabem o próprio tamanho (.length)
        for (int i = 0; i < arr.length; i++) {
            arr[i] = Integer.parseInt(IO.readln("Digite o valor para a posicao " + i + ": ").trim());
        }

        IO.println("Os valores digitados foram:");
        // For-each (Lê-se: "Para cada inteiro x dentro do array arr")
        for (int x : arr) {
            IO.println("- " + x);
        }
    }

    /**
     * Exercício 8 — ArrayList (O equivalente ao std::vector)
     * Crie uma lista: ArrayList<Integer> numeros = new ArrayList<>();
     * Crie um laço infinito que leia números e adicione na lista com '.add()'.
     * Se o usuário digitar 0, saia do laço (break).
     * Use 'Collections.sort(numeros)' para ordenar a lista.
     * Imprima a lista (no Java, se você der println direto na lista, ele já imprime
     * formatado!).
     */
    public static void ex8() {
        // Equivalente ao std::vector<int> do C++
        ArrayList<Integer> numeros = new ArrayList<>();

        IO.println("Digite números para a lista (0 para parar):");
        while (true) {
            int num = Integer.parseInt(IO.readln("> ").trim());
            if (num == 0) {
                break;
            }
            numeros.add(num); // push_back() do C++
        }

        // Ordenando a lista
        Collections.sort(numeros);

        // O Java converte o ArrayList para uma String bonitinha automaticamente: [1, 2,
        // 3]
        IO.println("Lista ordenada: " + numeros.toString());
    }

    /**
     * Exercício 9 — Matrizes (Arrays Multidimensionais)
     * Crie uma matriz 3x3: int[][] matriz = new int[3][3];
     * Faça dois laços for aninhados (usando matriz.length e matriz[i].length).
     * Preencha a matriz com números digitados pelo usuário.
     * Calcule e imprima a soma dos elementos da diagonal principal (onde i == j).
     */
    public static void ex9() {
        int[][] matriz = new int[3][3];

        IO.println("Preencha a matriz 3x3:");
        for (int i = 0; i < matriz.length; i++) {
            for (int j = 0; j < matriz[i].length; j++) {
                matriz[i][j] = Integer.parseInt(IO.readln("Posicao [" + i + "][" + j + "]: ").trim());
            }
        }

        int somaDiagonal = 0;
        for (int i = 0; i < matriz.length; i++) {
            somaDiagonal += matriz[i][i]; // Diagonal principal: linha == coluna
        }

        IO.println("Soma da diagonal principal: " + somaDiagonal);
    }

    /**
     * Exercício 10 — StringBuilder (Strings mutáveis)
     * No C++, você pode fazer string[0] = 'X'. No Java não.
     * Leia uma palavra do usuário.
     * Crie um StringBuilder: StringBuilder sb = new StringBuilder(palavra);
     * Use 'sb.reverse()' para inverter a palavra e '.toString()' para voltar a ser
     * String.
     * Imprima a palavra invertida.
     */
    public static void ex10() {
        String palavra = IO.readln("Digite uma palavra: ");

        // Transformando a String (Imutável) em um StringBuilder (Mutável)
        StringBuilder sb = new StringBuilder(palavra);

        // Operações rápidas que o Java já dá prontas:
        sb.reverse();

        // Transformando de volta para String normal
        String palavraInvertida = sb.toString();

        IO.println("Palavra invertida: " + palavraInvertida);
    }

    /**
     * Exercício 11 — If/Else e Ternário
     * Leia um número inteiro do usuário.
     * 1. Usando um IF/ELSE tradicional, verifique e imprima se ele é Positivo,
     * Negativo ou Zero.
     * 2. Usando o OPERADOR TERNÁRIO ( ? : ), verifique se ele é Par ou Ímpar e
     * guarde o resultado
     * numa String, depois imprima.
     */
    public static void ex11() {
        int x = Integer.parseInt(IO.readln("Digite um número: ").trim());
        if (x < 0) {
            IO.println("Negativo");
        } else if (x > 0) {
            // else if code
            IO.println("Positivo");
        } else {
            // else code
            IO.println("Zero");
        }
        String resultado = (x % 2 == 0) ? "Par" : "impar";
        IO.println(resultado);
    }

    /**
     * Exercício 12 — For e While
     * Leia um número N (maior que 0).
     * 1. Faça um laço FOR para imprimir os N primeiros números pares.
     * 2. Faça um laço WHILE para imprimir os N primeiros números ímpares.
     * Cuidado para não confundir o "contador do laço" com o "número impresso".
     */
    public static void ex12() {
        int x = Integer.parseInt(IO.readln("Digite um número: ").trim());
        for (int i = 0; i < x; i++) {
            if (i % 2 == 0)
                IO.println(i);
            i++;
        }
        int z = 0;
        while (z < x) {
            if (z % 2 == 1) {
                IO.println(z);
            }
            z++;
        }
    }

    /**
     * Exercício 13 — Vetores (Arrays Base)
     * 1. Leia um tamanho N e crie um vetor de inteiros ( int[] vetor = new int[N];
     * ).
     * 2. Use um FOR para ler N números do usuário e guardar no vetor.
     * 3. Peça para o usuário digitar um "número alvo" para buscar.
     * 4. Percorra o vetor. Se achar o alvo, imprima o índice onde ele está e use um
     * 'break'.
     * 5. Se não achar, imprima "Número não encontrado".
     */
    public static void ex13() {
        int qnt = Integer.parseInt(IO.readln("Digite um número: ").trim());
        int[] vetor = new int[qnt];
        for (int i = 0; i < vetor.length; i++) {
            int ntemp = Integer.parseInt(IO.readln("Digite um número: ").trim());
            vetor[i] = ntemp;
            i++;
        }
        int num = Integer.parseInt(IO.readln("Digite um número: ").trim());
        for (int i = 0; i < vetor.length; i++) {
            if (vetor[i] == num) {
                IO.println("posicao: " + i + "numero: " + num);
                break;
            } else
                IO.println("nao encontrado");
        }
    }

    /**
     * Exercício 14 — Matrizes (Arrays de Arrays)
     * Crie uma matriz 3x3 de caracteres: char[][] tabuleiro = new char[3][3];
     * 1. Use dois laços FOR aninhados para preencher toda a matriz com o caractere
     * '.' (ponto).
     * 2. Peça ao usuário uma linha (0 a 2) e uma coluna (0 a 2).
     * 3. Coloque um 'X' nessa posição: tabuleiro[linha][coluna] = 'X';
     * 4. Imprima a matriz completa no formato de um tabuleiro (3 linhas e 3
     * colunas).
     */
    public static void ex14() {
        // 1. Matriz 3x3 fixa
        char[][] tabuleiro = new char[3][3];

        // 2. Preencher com '.'
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                tabuleiro[i][j] = '.';
            }
        }

        // 3. Pedir linha e coluna (COM VALIDAÇÃO)
        int linha;
        int coluna;

        do {
            linha = Integer.parseInt(IO.readln("Digite a linha (0 a 2): ").trim());
            if (linha < 0 || linha > 2) {
                IO.println("Linha inválida! Digite 0, 1 ou 2.");
            }
        } while (linha < 0 || linha > 2);

        do {
            coluna = Integer.parseInt(IO.readln("Digite a coluna (0 a 2): ").trim());
            if (coluna < 0 || coluna > 2) {
                IO.println("Coluna inválida! Digite 0, 1 ou 2.");
            }
        } while (coluna < 0 || coluna > 2);

        // 4. Colocar 'X' na posição
        tabuleiro[linha][coluna] = 'X';

        // 5. Imprimir no formato de tabuleiro
        IO.println("\nTabuleiro:");
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                IO.print(tabuleiro[i][j] + " ");
            }
            IO.println(); // Quebra de linha após cada linha do tabuleiro
        }
    }

    /**
     * Exercício 15 — Manipulação de Strings
     * No C++: texto.length(), texto[i], texto.substr(inicio, tamanho).
     * No Java: texto.length(), texto.charAt(i), texto.substring(inicio,
     * fim_exclusivo).
     * 
     * Leia uma frase do usuário.
     * 1. Imprima o tamanho da frase (quantos caracteres tem).
     * 2. Imprima a primeira letra e a última letra usando .charAt().
     * 3. Imprima a frase toda em MAIÚSCULAS usando .toUpperCase().
     * 4. Se a frase tiver mais de 5 letras, imprima os 5 primeiros caracteres
     * usando .substring(0, 5).
     */
    public static void ex15() {
        String frase = IO.readln("Digite algo: ");
        IO.println(frase.length());
        IO.println("Primeira letra:" + frase.charAt(0) + "\nUltima letra: " + frase.charAt(frase.length() - 1));
        IO.println(frase.toUpperCase());
        String Sfr = frase.replace(" ", "");
        if (Sfr.length() > 5) {
            for (int i = 0; i < 5; i++) {
                IO.print(Sfr.charAt(i) + " ");

            }
            IO.println();
        }
    }

    public static void desafio() {
        int linha = Integer.parseInt(IO.readln("digite a quantidade de linha: ").trim());
        int coluna = Integer.parseInt(IO.readln("Digite a quantidade de colunas: ").trim());
        char[][] tabuleiro = new char[linha][coluna];
        for (int i = 0; i < linha; i++) {
            for (int j = 0; j < coluna; j++) {
                if (i == j) {
                    tabuleiro[i][j] = 'X';
                } else
                    tabuleiro[i][j] = 'Y';
                if (i + j == coluna - 1) {
                    tabuleiro[i][j] = 'X';
                }
            }
        }
        for (int i = 0; i < linha; i++) {
            for (int j = 0; j < coluna; j++) {
                IO.print(tabuleiro[i][j] + " ");
            }
            IO.println();
        }

    }

    public static void desafio2() {
        int linha = Integer.parseInt(IO.readln("digite a quantidade de linha: ").trim());
        int coluna = Integer.parseInt(IO.readln("Digite a quantidade de colunas: ").trim());
        char[][] tabuleiro = new char[linha][coluna];
        for (int i = 0; i < linha; i++) {
            for (int j = 0; j < coluna; j++) {
                if (i==0 || i==linha-1 || j==0 || j==coluna-1) {
                    tabuleiro[i][j] = 'X';

                } else tabuleiro[i][j] = '*';
                
            }
        }

        for (int i = 0; i < linha; i++) {
            for (int j = 0; j < coluna; j++) {
                IO.print(tabuleiro[i][j] + " ");
            }
            IO.println();
        }
    }


    
}
