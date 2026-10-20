import React, { useCallback, useEffect, useState } from "react";
import { api } from "../../api.js";
import { ChevronRight, Gift, MessageCircle, Send } from "lucide-react";
import { Avatar, Button, EmptyState, ErrorBox, fmtDateTime, INK, INK_SOFT, Loading, TopBar, useApiData } from "../../shared/shared.jsx";

function nomeOutraPessoa(conversa, usuarioId) {
  const souAnunciante = String(conversa.doadorId || conversa.item?.doador?.id) === String(usuarioId);
  const pessoa = souAnunciante ? conversa.receptor : conversa.item?.doador;
  return {
    souAnunciante,
    pessoa,
    nome: pessoa?.nome || "Pessoa da conversa",
  };
}

function Inbox({ go, usuario }) {
  const { loading, error, data, reload } = useApiData(() => api.conversas(), [usuario?.id]);
  const conversas = (data || []).filter(c => c?.id);

  useEffect(() => {
    const intervalo = window.setInterval(() => reload({ silent: true }), 10000);
    return () => window.clearInterval(intervalo);
  }, [reload]);

  return (
    <div>
      <TopBar title="Inbox" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ fontSize: 12, color: INK_SOFT, marginBottom: 12 }}>
          Conversas iniciadas a partir dos anúncios e mensagens trocadas.
        </div>
        {loading && <Loading label="Carregando conversas..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && conversas.length === 0 && (
          <EmptyState Icon={MessageCircle} text="Nenhuma conversa ainda. Abra um anúncio para iniciar contato." />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {conversas.map(conversa => {
            const outra = nomeOutraPessoa(conversa, usuario?.id);
            const hora = conversa.ultimaMensagem?.criadaEm || conversa.criadaEm;
            return (
              <button
                key={conversa.id}
                type="button"
                onClick={() => go(outra.souAnunciante ? "chatDoador" : "chatReceptor", {
                  solicitacaoId: conversa.id,
                  otherId: outra.pessoa?.id,
                  otherName: outra.nome,
                  itemId: conversa.item?.id,
                  itemTitulo: conversa.item?.titulo,
                })}
                style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, padding: 12, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 14, cursor: "pointer", textAlign: "left" }}
              >
                <Avatar label={outra.nome} size={40} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{outra.nome}</span>
                    {hora && <span style={{ fontSize: 10, color: INK_SOFT, flexShrink: 0 }}>{new Date(hora).toLocaleDateString("pt-BR")}</span>}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: INK_SOFT, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conversa.item?.titulo || "Anúncio"}
                  </span>
                  <span style={{ display: "block", fontSize: 11.5, color: INK_SOFT, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conversa.ultimaMensagem?.texto || conversa.mensagem || "Abra para ver a conversa"}
                  </span>
                </span>
                <ChevronRight size={16} color={INK_SOFT} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Chat({ go, params, usuario }) {
  const { solicitacaoId, otherName, itemTitulo, itemId } = params || {};
  const {
    loading: carregandoConversa,
    error: erroConversa,
    data: conversa,
    reload: recarregarConversa,
  } = useApiData(() => api.solicitacaoPorId(solicitacaoId), [solicitacaoId], { skip: !solicitacaoId });
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [carregandoMensagens, setCarregandoMensagens] = useState(true);
  const [erroMensagens, setErroMensagens] = useState("");
  const [enviando, setEnviando] = useState(false);

  const carregarMensagens = useCallback(async (silencioso = false) => {
    if (!solicitacaoId) {
      setCarregandoMensagens(false);
      setErroMensagens("Conversa não identificada. Volte ao Inbox e abra uma conversa.");
      return;
    }
    try {
      const resultado = await api.listarMensagens(solicitacaoId);
      setMensagens(Array.isArray(resultado) ? resultado : []);
      setErroMensagens("");
      if ((resultado || []).some(m => String(m.remetente?.id) !== String(usuario?.id))) {
        await api.marcarMensagensLidas(solicitacaoId);
      }
    } catch (e) {
      if (!silencioso) setErroMensagens(e.message || "Não foi possível carregar as mensagens.");
    } finally {
      if (!silencioso) setCarregandoMensagens(false);
    }
  }, [solicitacaoId, usuario?.id]);

  useEffect(() => {
    carregarMensagens();
    const intervalo = window.setInterval(() => carregarMensagens(true), 5000);
    return () => window.clearInterval(intervalo);
  }, [carregarMensagens]);

  const enviar = async () => {
    const conteudo = texto.trim();
    if (!conteudo || !solicitacaoId || enviando) return;
    setEnviando(true);
    try {
      await api.enviarMensagem(solicitacaoId, conteudo);
      setTexto("");
      await carregarMensagens();
      await recarregarConversa({ silent: true });
    } catch (e) {
      setErroMensagens(e.message || "Não foi possível enviar a mensagem. O texto foi mantido para nova tentativa.");
    } finally {
      setEnviando(false);
    }
  };

  const tituloItem = conversa?.item?.titulo || itemTitulo || "Item da conversa";
  const nomePessoa = otherName || conversa?.receptor?.nome || conversa?.item?.doador?.nome || "Conversa";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 440, height: "100%" }}>
      <TopBar title={nomePessoa} onBack={() => go(-1)} />
      <button
        type="button"
        onClick={() => itemId && go("detalhesItem", { itemId })}
        disabled={!itemId}
        style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 16px 8px", padding: 8, border: "1px solid #EDEBE1", borderRadius: 12, background: "#fff", textAlign: "left", cursor: itemId ? "pointer" : "default" }}
      >
        <Gift size={17} color="var(--role-primary)" />
        <span style={{ flex: 1, fontSize: 12, color: INK, fontWeight: 700 }}>{tituloItem}</span>
        {itemId && <ChevronRight size={15} color={INK_SOFT} />}
      </button>

      <div style={{ flex: 1, minHeight: 180, overflowY: "auto", padding: "8px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {carregandoConversa && carregandoMensagens && <Loading label="Carregando conversa..." />}
        {erroConversa && <ErrorBox message={erroConversa} onRetry={() => { recarregarConversa(); carregarMensagens(); }} />}
        {erroMensagens && <ErrorBox message={erroMensagens} onRetry={() => carregarMensagens()} />}
        {!carregandoMensagens && !erroMensagens && mensagens.length === 0 && (
          <EmptyState Icon={MessageCircle} text="Ainda não há mensagens nesta conversa." />
        )}
        {mensagens.map((mensagem, index) => {
          const minha = String(mensagem.remetente?.id) === String(usuario?.id);
          return (
            <div key={mensagem.id || `${mensagem.criadaEm}-${index}`} style={{ alignSelf: minha ? "flex-end" : "flex-start", maxWidth: "84%", background: minha ? "var(--role-primary)" : "#fff", color: minha ? "#fff" : INK, border: minha ? "none" : "1px solid #EDEBE1", borderRadius: 14, padding: "9px 11px" }}>
              {!minha && <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 3, color: "var(--role-primary)" }}>{mensagem.remetente?.nome || nomePessoa}</div>}
              <div style={{ fontSize: 13, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{mensagem.texto}</div>
              {mensagem.criadaEm && <div style={{ textAlign: "right", fontSize: 9, opacity: .75, marginTop: 4 }}>{fmtDateTime(mensagem.criadaEm)}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", padding: "10px 14px 14px", borderTop: "1px solid #EDEBE1", background: "#fff" }}>
        <textarea
          aria-label="Escrever mensagem"
          rows={2}
          maxLength={2000}
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
          placeholder="Escreva uma mensagem..."
          style={{ flex: 1, resize: "none", border: "1px solid #E9E7DC", borderRadius: 12, padding: 10, font: "inherit", fontSize: 13 }}
        />
        <Button small icon={Send} loading={enviando} disabled={!texto.trim()} onClick={enviar}>Enviar</Button>
      </div>
    </div>
  );
}

export { Inbox, Chat };
