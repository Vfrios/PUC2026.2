package exception;

/**
 * Lancada quando ocorre falha na comunicacao com a API externa
 * de clima ou quando os dados retornados sao invalidos/indisponiveis.
 */
public class ClimaIndisponivelException extends RuntimeException {

    public ClimaIndisponivelException(String message) {
        super(message);
    }

    public ClimaIndisponivelException(String message, Throwable cause) {
        super(message, cause);
    }
}
