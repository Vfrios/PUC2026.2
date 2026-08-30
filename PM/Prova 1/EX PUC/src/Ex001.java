/**
 * 01) O disco de vinil já foi o meio mais popular de compartilhar música, mas
 * apresenta uma limitação técnica:
 * cada disco de vinil só pode armazenar 24 minutos de áudio por lado.
 * Para álbuns mais longos, é necessário mais de um disco de vinil, o que
 * encarece o processo.
 * Digamos que, para publicar uma obra em vinil na Xulambs Produções Musicais
 * (XPM), o artista precisa pagar pelas confecções dos discos o valor de R$
 * 35,00 por disco e um valor fixo de R$ 420,00 pelos serviços da equipe
 * técnica.
 * 
 * O sistema deve
 * ler a duração do álbum (em minutos) e
 * o número de cópias a serem feitas.
 * Seu objetivo é imprimir para o artista
 * o orçamento mostrando o valor total a pagar e
 * o custo de confecção por cópia do álbum.
 * 
 * 
 * Sua tarefa:
 * Você não deve criar o código do programa/sistema inteiro que resolva o
 * problema. Você deve criar apenas o
 * método principal, usando sintaxe Java, de modo que este método provenha uma
 * solução adequada para o
 * problema proposto.
 */
public class Ex001 {
    public static int Settempo() {
        int x;
        x = Integer.parseInt(IO.readln("Digite o tempo (0 a 48):").trim());

        return x;
    }

    public static int copiaAlbum() {
        int x = Integer.parseInt(IO.readln("Digite um número de copia: ").trim());
        return x;
    }

    public static int orca(int x,int tempo) {
        return ((tempo+47)/48)*x * 35 + 420;
    }
   
    public static void Exibir(int x, int y) {
        IO.println("Discos " + (y+47)/48);
        IO.println("orcamento: " + x);
        IO.println("Tempo: " + y);
    }
    public static void main(String[] args) {
        int Temp = Settempo();
        int Ncopia = copiaAlbum();
        Exibir(orca(Ncopia,Temp),Temp);

    }
}
