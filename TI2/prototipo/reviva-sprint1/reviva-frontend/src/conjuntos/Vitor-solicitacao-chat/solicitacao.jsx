import React, { useEffect, useState } from "react";
import { api } from "../../api.js";
import { AlertTriangle, ChevronRight, Gift, MessageCircle, Send } from "lucide-react";
import { Button, EmptyState, ErrorBox, ETAPA_LABEL, fieldBox, fieldInput, fmtDateTime, INK, INK_SOFT, Loading, SectionTitle, StatusBadge, statusDoItem, TopBar, useApiData } from "../../shared/shared.jsx";

function Solicitacao({ go, notify, params, usuario }) {
  const itemIdParam = params?.itemId;
  const solicitacaoIdParam = params?.solicitacaoId;
  const {
    loading: carregandoSolicitacao,
    error: erroSolicitacao,
    errorStatus,
    data: solicitacaoCarregada,
    reload,
  } = useApiData(() => api.solicitacaoPorId(solicitacaoIdParam), [solicitacaoIdParam], { skip: !solicitacaoIdParam });
  const itemId = itemIdParam || solicitacaoCarregada?.item?.id;
  const { data: item, loading: carregandoItem, error: erroItem, reload: recarregarItem } =
    useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const { data: enviadas, loading: carregandoEnviadas, error: erroEnviadas, reload: recarregarEnviadas } =
    useApiData(() => api.solicitacoesEnviadas(), [usuario?.id], { skip: !usuario?.id || !!solicitacaoIdParam });
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (item && !mensagem) setMensagem(`Olá! Tenho interesse no item "${item.titulo}". Ele ainda está disponível?`);
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const solicitacaoExistente = solicitacaoCarregada ||
    (enviadas || []).find(s => String(s.item?.id) === String(itemId) && !["CANCELADA", "RECUSADA"].includes(s.etapa));
  const carregando = carregandoSolicitacao || carregandoItem || (carregandoEnviadas && !enviadas);
  const erro = erroSolicitacao || erroItem || erroEnviadas;
  const statusItem = statusDoItem(item);
  const souAnunciante = String(item?.doador?.id) === String(usuario?.id);
  const souDoador = String(solicitacaoExistente?.doadorId) === String(usuario?.id);
  const outraPessoa = souDoador ? solicitacaoExistente?.receptor : item?.doador;

  const abrirConversa = (solicitacao) => {
    go(souDoador ? "chatDoador" : "chatReceptor", {
      solicitacaoId: solicitacao.id,
      otherId: outraPessoa?.id,
      otherName: outraPessoa?.nome,
      itemTitulo: solicitacao.item?.titulo || item?.titulo,
      itemId: solicitacao.item?.id || itemId,
    });
  };

  const enviarSolicitacao = async () => {
    if (!itemId || mensagem.trim().length < 5) {
      notify("Escreva uma mensagem de pelo menos 5 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      const criada = await api.solicitar(itemId, mensagem.trim());
      notify("Conversa iniciada. Você pode continuar pelo Inbox.");
      abrirConversa(criada);
    } catch (e) {
      notify(e.message || "Não foi possível iniciar a conversa.");
    } finally {
      setEnviando(false);
    }
  };

  if (carregando && !item && !solicitacaoExistente) {
    return <div><TopBar title="Iniciar conversa" onBack={() => go(-1)} /><Loading /></div>;
  }
  if (errorStatus === 403 || errorStatus === 404) {
    return <div><TopBar title="Iniciar conversa" onBack={() => go(-1)} /><EmptyState Icon={AlertTriangle} text={errorStatus === 403 ? "Você não participa desta conversa." : "Esta conversa não foi encontrada."} /></div>;
  }
  if (erro) {
    return <div><TopBar title="Iniciar conversa" onBack={() => go(-1)} /><ErrorBox message={erro} onRetry={() => { reload(); recarregarItem(); recarregarEnviadas(); }} /></div>;
  }
  if (!itemId || (!item && !solicitacaoExistente)) {
    return <div><TopBar title="Iniciar conversa" onBack={() => go(-1)} /><EmptyState Icon={AlertTriangle} text="Este item não está disponível para consulta." /></div>;
  }

  return (
    <div>
      <TopBar title={solicitacaoExistente ? "Conversa sobre o item" : "Iniciar conversa"} onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 24px" }}>
        {(item || solicitacaoExistente?.item) && (
          <button
            type="button"
            onClick={() => go("detalhesItem", { itemId })}
            style={{ display: "flex", width: "100%", gap: 10, alignItems: "center", textAlign: "left", background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 10, cursor: "pointer" }}
          >
            <div style={{ width: 54, height: 54, borderRadius: 12, overflow: "hidden", background: "var(--role-soft)", flexShrink: 0 }}>
              {(item || solicitacaoExistente.item)?.fotosUrls?.[0] && <img src={(item || solicitacaoExistente.item).fotosUrls[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: INK }}>{(item || solicitacaoExistente.item)?.titulo}</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 2 }}>{(item || solicitacaoExistente.item)?.doador?.nome}</div>
              {item && <div style={{ marginTop: 4 }}><StatusBadge item={item} /></div>}
            </div>
            <ChevronRight size={16} color={INK_SOFT} />
          </button>
        )}

        {solicitacaoExistente ? (
          <>
            <SectionTitle>Informações da conversa</SectionTitle>
            <div style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 12.5, color: INK }}><b>Status:</b> {ETAPA_LABEL[solicitacaoExistente.etapa] || solicitacaoExistente.status || "Em andamento"}</div>
              {solicitacaoExistente.criadaEm && <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>Iniciada em {fmtDateTime(solicitacaoExistente.criadaEm)}</div>}
              {solicitacaoExistente.ultimaMensagem?.texto && (
                <div style={{ background: "#F1EFE6", borderRadius: 12, padding: 10, marginTop: 10, fontSize: 12, color: INK }}>
                  <b>Mensagem mais recente:</b> {solicitacaoExistente.ultimaMensagem.texto}
                </div>
              )}
            </div>
            <div style={{ marginTop: 16 }}>
              <Button full icon={MessageCircle} onClick={() => abrirConversa(solicitacaoExistente)}>Abrir conversa</Button>
            </div>
          </>
        ) : souAnunciante ? (
          <div style={{ marginTop: 16 }}><EmptyState Icon={Gift} text="Este anúncio é seu. Consulte suas conversas pelo Inbox." /></div>
        ) : statusItem !== "ATIVO" ? (
          <div role="status" style={{ marginTop: 16, background: "#FBE8E0", color: "#9C4327", borderRadius: 14, padding: 14, fontSize: 13 }}>
            Este item não está disponível para iniciar uma nova conversa.
          </div>
        ) : (
          <>
            <SectionTitle>Mensagem para quem publicou</SectionTitle>
            <div style={{ ...fieldBox, alignItems: "flex-start" }}>
              <textarea aria-label="Mensagem para quem publicou o item" rows={4} maxLength={500} value={mensagem} onChange={e => setMensagem(e.target.value)} style={{ ...fieldInput, resize: "none" }} />
            </div>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 4 }}>A conversa ficará vinculada a este item e poderá ser retomada pelo Inbox.</div>
            <div style={{ marginTop: 18 }}>
              <Button full icon={Send} loading={enviando} disabled={!mensagem.trim()} onClick={enviarSolicitacao}>Iniciar conversa</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { Solicitacao };
