public Data registrarDevolucao(Data devolucao) {
    if (this.dataDevolucao != null)
        return null;
    if(devolucao != null || dataRetirada.estahNaFrenteDe(devolucao))
        throw new IllegalArgumentException();

    dataDevolucao = devolucao;
    Data devolucaoPrevista = dataRetirada.incrementar(DIAS_PADRAO);
    saldoDias = devolucao.diferencaemDias(devolucaoPrevista);
    return devolucao;
}


Emprestimo <abstract>
# aluno: String;
# dataRetirada: Data;
# dataDevolucao: Data;
 # Emprestimo(retirada: Data)             
 + registrarDevolucao(devolucao: Data): Data <abstract>
 + saldoDeDias(): int <abstract>   
 + finalizado(): boolean 

Aluno extends Emprestimo

- PRAZO= 3
- HORARIO_INICIO = 8
 + registrarDevolucao(devolucao: Data): Data 
 + saldoDeDias(): int
 
 Professor extens Emprestimo
- PRAZO =15


 @Override
 public Data registrarDevolucao(Data devolucao){


 }
