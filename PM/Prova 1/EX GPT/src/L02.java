import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;
import java.util.Arrays;

public class L02 {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        List<Runnable> exercicios = new ArrayList<>();

        exercicios.add(() -> ex1());
        exercicios.add(() -> ex2());
        exercicios.add(() -> ex3());
        exercicios.add(() -> ex4());
        exercicios.add(() -> ex5());
        exercicios.add(() -> ex6());
        exercicios.add(() -> ex7());
        exercicios.add(() -> ex8());
        exercicios.add(() -> ex9());
        exercicios.add(() -> ex10());
        exercicios.add(() -> ex11());
        exercicios.add(() -> ex12());
        exercicios.add(() -> ex13());
        exercicios.add(() -> ex14());
        exercicios.add(() -> ex15());
        exercicios.add(() -> ex16());
        exercicios.add(() -> ex17());
        exercicios.add(() -> ex18());
        exercicios.add(() -> ex19());
        exercicios.add(() -> ex20());

        int opcao;

        do {
            IO.println("0 - Sair");
            for (int i = 0; i < exercicios.size(); i++) {
                IO.println((i + 1) + " - Exercício " + (i + 1) + " (Hard)");
            }
            IO.print("\nEscolha o exercício: ");

            opcao = Integer.parseInt(IO.readln("Digite um número: ").trim());
            IO.println("----------------------------------------");

            if (opcao == 0) {
                IO.println("Encerrando...");
            } else if (opcao >= 1 && opcao <= exercicios.size()) {
                exercicios.get(opcao - 1).run();
            } else {
                IO.println("Opção inválida!");
            }

            IO.println("----------------------------------------");

        } while (opcao != 0);

        scanner.close();
    }

    /**
     * Exercício 1 HARD — Contagem Regressiva com Múltiplos
     * Peça um número N.
     * Mostre a contagem regressiva de N até 0.
     * Mas:
     * - Se o número for múltiplo de 3, mostre "Fizz"
     * - Se for múltiplo de 5, mostre "Buzz"
     * - Se for múltiplo de ambos (3 e 5), mostre "FizzBuzz"
     * - Se não for múltiplo, mostre o número
     */
    public static void ex1() {
        int numero = Integer.parseInt(IO.readln("Digite um número: ").trim());

        for (int i = 0; i < numero; i++) {
            if (numero % 3 == 0) {
                IO.println("Fizz");
            } else if (numero % 5 == 0) {
                IO.println("Buzz");
            } else if (numero % 3 == 0 && numero % 5 == 0) {
                IO.println("FizzBuzz");
            } else {
                IO.println(numero);
            }

        }

    }

    /**
     * Exercício 2 HARD — Soma de Números até o Alvo
     * O usuário digita um número alvo (ex: 100).
     * Depois, o programa pede números repetidamente.
     * A soma acumulada não pode ultrapassar o alvo.
     * Se ultrapassar, avise "Estourou o limite!" e pare.
     * No final, mostre a soma total e quantos números foram digitados.
     */
    public static void ex2() {
        int num = Integer.parseInt(IO.readln("Digite um número: ").trim());
        int soma = 0, count = 0;
        ArrayList<Integer> vetor = new ArrayList<>();
        while (soma <= num) {
            int temp = Integer.parseInt(IO.readln("Digite um número: ").trim());
            soma += temp;
            count++;
            vetor.add(temp);
        }
        if (soma >= num) {
            IO.println("LIMITE com soma total de:" + soma + "\nTentativas: " + count);
            IO.println("Numeros digitados sao: ");
            for (int i = 0; i < vetor.size(); i++) {
                IO.print(vetor.get(i) + ",");
            }
        }

    }

    /**
     * Exercício 3 HARD — Média das Notas com Maior e Menor
     * Peça 5 notas (0 a 10).
     * Calcule a média.
     * Mas só considere as notas que são maiores que 5.
     * Imprima:
     * - Média (considerando apenas notas > 5)
     * - Maior nota
     * - Menor nota
     * - Quantas notas foram desconsideradas (<= 5)
     */

    public static void ex3() {
        int[] notas = new int[5];
        int soma = 0, count = 0;

        for (int i = 0; i < notas.length; i++) {
            int valor = Integer.parseInt(IO.readln("Digite a " + (i + 1) + "º nota: "));
            notas[i] = valor;
            if (valor > 5) {
                soma += valor;
            } else
                count++;
        }
        int maior = notas[0];
        int menor = notas[0];
        for (int i = 1; i < notas.length; i++) {
            if (maior < notas[i])
                maior = notas[i];
            if (menor > notas[i])
                menor = notas[i];
        }
        IO.println("Media das notas: " + soma / 5);
        IO.println("Maior nota: " + maior);
        IO.println("Menor nota: " + menor);
        IO.println("Notas desconsideradas: " + count);
        int[] ord = notas.clone();
        Arrays.sort(ord);
        for (int i = 0; i < ord.length; i++) {
            IO.print(ord[i]+"\n");
        }
        
    }

    /**
     * Exercício 4 HARD — Número Secreto com Dicas e Tentativas
     * Gere um número aleatório entre 1 e 200.
     * O usuário tem 10 tentativas para adivinhar.
     * A cada palpite:
     * - Mostre "Muito alto!" ou "Muito baixo!"
     * - Se errar, mostre quantas tentativas restam
     * - Se acertar, mostre "Parabéns!" e em quantas tentativas
     * Se acabarem as tentativas, revele o número secreto.
     */
    public static void ex4() {
        int secreto = (int) (Math.random() * 200) + 1;
        for (int i = 0; i < 10; i++) {
            int num = Integer.parseInt(IO.readln("Digite um número: ").trim());
            if (num != secreto ) {
                IO.println("erro e faltam:" + (10 - i));
                if (i == 9)
                    IO.println("numero: " + secreto);
                if (num<secreto) {
                    IO.println("baixo");
                } else {
                    IO.println("alto");
                }
            }
            else IO.println("acerto");
        }
        
    }

    /**
     * Exercício 5 HARD — Tabuada Reversa
     * Peça um número N.
     * Mostre a tabuada de N, mas:
     * - Comece do 10 até 1 (reversa)
     * - Destaque os resultados que são pares com "[PAR]"
     * - Destaque os resultados ímpares com "[IMPAR]"
     * Exemplo: 3x10=30 [PAR]
     */
    public static void ex5() {
        // Seu código aqui
    }

    /**
     * Exercício 6 HARD — Maior e Menor com Posições
     * Peça 5 números.
     * Encontre o maior e o menor.
     * Mostre também:
     * - Em qual posição (índice) está o maior
     * - Em qual posição está o menor
     * - A soma dos números
     * - A média
     * - A diferença entre o maior e o menor
     */
    public static void ex6() {
        // Seu código aqui
    }

    /**
     * Exercício 7 HARD — Palíndromo com Frases
     * Leia uma frase.
     * Verifique se ela é um palíndromo IGNORANDO espaços, pontuação e maiúsculas.
     * Exemplo: "A man a plan a canal Panama" é palíndromo.
     * Dica: remova espaços, converta para minúsculas, remova pontuação.
     */
    public static void ex7() {
        String frase = IO.readln("Digite algo: ");
        String removed = frase.replace(" ", "").toLowerCase();
        String inv = new StringBuilder(removed).reverse().toString();
        if (removed.equals(inv))
            IO.println("plaindromo");
        else IO.println("nao plaindromo");
    }

    /**
     * Exercício 8 HARD — Soma de Pares com Intervalo
     * Peça dois números: início e fim.
     * Some todos os números pares NESTE INTERVALO.
     * Mostre a soma.
     * Se o início for maior que o fim, inverta os valores automaticamente.
     */
    public static void ex8() {
        // Seu código aqui
    }

    /**
     * Exercício 9 HARD — Contagem de Vogais e Consoantes
     * Leia uma frase.
     * Conte:
     * - Vogais (a, e, i, o, u)
     * - Consoantes
     * - Números
     * - Espaços
     * - Outros caracteres (pontuação, símbolos)
     * Imprima um resumo detalhado.
     */
    public static void ex9() {
        // Dica: use Character.isDigit(), Character.isLetter(), etc.
        // Seu código aqui
    }

    /**
     * Exercício 10 HARD — Fatorial com Validação
     * Peça um número N.
     * Calcule o fatorial de N.
     * Se o usuário digitar número negativo, peça novamente.
     * Se digitar 0, fatorial é 1.
     * Mostre o cálculo passo a passo:
     * Exemplo: 5! = 5 x 4 x 3 x 2 x 1 = 120
     */
    public static void ex10() {
        // Seu código aqui
    }

    /**
     * Exercício 11 HARD — Busca em Matriz com Contagem
     * Crie uma matriz 4x4.
     * Preencha com números aleatórios entre 1 e 50.
     * Peça um número alvo.
     * Mostre:
     * - Todas as posições onde o número aparece
     * - Quantas vezes aparece
     * - Se não aparecer, mostre o número mais próximo
     * Dica: Math.abs() para distância
     */
    public static void ex11() {
        // Dica: int num = (int)(Math.random() * 50) + 1;
        // Seu código aqui
    }

    /**
     * Exercício 12 HARD — Substituição de Caracteres
     * Leia uma frase.
     * Peça um caractere para substituir e outro para colocar no lugar.
     * Substitua TODAS as ocorrências do caractere na frase.
     * Mostre:
     * - Frase original
     * - Frase modificada
     * - Quantas substituições foram feitas
     */
    public static void ex12() {
        // Seu código aqui
    }

    /**
     * Exercício 13 HARD — Ordenação com Remoção de Duplicatas
     * Crie um array de 10 números (leia do usuário).
     * Remova todos os números duplicados.
     * Ordene o array resultante.
     * Mostre:
     * - Array original
     * - Array sem duplicatas
     * - Quantos números foram removidos
     */
    public static void ex13() {
        // Dica: use ArrayList para facilitar remoção
        // Seu código aqui
    }

    /**
     * Exercício 14 HARD — Tabuleiro de Xadrez com Borda Dupla
     * Peça o tamanho N (mínimo 3).
     * Crie uma matriz NxN.
     * - A borda EXTERNA deve ser '#'
     * - A borda INTERNA (a 1 posição da borda) deve ser '*'
     * - O centro (restante) deve ser '.'
     * Exemplo para 5x5:
     * # # # # #
     * # * * * #
     * # * . * #
     * # * * * #
     * # # # # #
     */
    public static void ex14() {
        // Seu código aqui
    }

    /**
     * Exercício 15 HARD — Compressão de Strings
     * Leia uma string.
     * Comprima usando contagem de caracteres consecutivos.
     * Exemplo: "aaabbcccc" → "a3b2c4"
     * "aabbcc" → "a2b2c2"
     * Se a string comprimida for maior que a original, mostre a original.
     * Se for menor, mostre a comprimida.
     */
    public static void ex15() {
        // Seu código aqui
    }

    /**
     * Exercício 16 HARD — Fibonacci com Limite
     * Peça um número limite.
     * Gere a sequência de Fibonacci até que o próximo termo
     * ultrapasse o limite.
     * Mostre todos os números gerados e a soma de todos eles.
     */
    public static void ex16() {
        // Seu código aqui
    }

    /**
     * Exercício 17 HARD — Soma de Dígitos com Ordem Inversa
     * Leia um número inteiro positivo.
     * Mostre:
     * - Soma dos dígitos
     * - Número invertido (ex: 123 → 321)
     * - Quantidade de dígitos
     * - Se o número é capicua (igual de trás para frente)
     */
    public static void ex17() {
        // Seu código aqui
    }

    /**
     * Exercício 18 HARD — Tabuleiro Espiral
     * Peça o tamanho N (ímpar, mínimo 3).
     * Crie uma matriz NxN preenchida com 'O'.
     * Preencha uma espiral com 'X' começando do centro.
     * Exemplo 5x5:
     * O O O O O
     * O X X X O
     * O X O X O
     * O X X X O
     * O O O O O
     * 
     * Dica: o centro está em (N/2, N/2)
     */
    public static void ex18() {
        // Seu código aqui
    }

    /**
     * Exercício 19 HARD — Anagramas
     * Leia duas palavras/frases.
     * Verifique se são anagramas (mesmas letras, ordem diferente).
     * Exemplo: "amor" e "roma" são anagramas.
     * Ignore espaços, pontuação e maiúsculas/minúsculas.
     * Mostre o resultado e a quantidade de caracteres de cada.
     */
    public static void ex19() {
        // Dica: remova espaços, converta para char[], ordene, compare
        // Seu código aqui
    }

    /**
     * Exercício 20 HARD — Sistema de Notas com Estatísticas Avançadas
     * Peça o número de alunos.
     * Para cada aluno, leia:
     * - Nome
     * - 3 notas (0-10)
     * Calcule:
     * - Média de cada aluno
     * - Situação (Aprovado >= 7, Recuperação >= 5, Reprovado < 5)
     * - Média da turma
     * - Maior média
     * - Menor média
     * - Quantos aprovados, recuperação e reprovados
     * - Lista de alunos com média abaixo da média da turma
     * No final, imprima um boletim completo.
     */
    public static void ex20() {
        // Seu código aqui
    }
}
