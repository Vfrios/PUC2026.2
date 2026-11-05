import React, { useState, useEffect } from "react";
import { api } from "../../api.js";
import { Archive, CheckCircle2, CheckSquare, Clock, Copy, Eye, Gift, Loader2, Pencil, RotateCcw, Send, Trash2, Users } from "lucide-react";
import { Avatar, Button, Checkbox, Chip, EmptyState, ErrorBox, INK, INK_SOFT, Loading, StatusBadge, TopBar, CATS, ETAPA_LABEL, fieldInput, statusDoItem, timeAgo, useApiData } from "../../shared/shared.jsx";
/* ---- GERENCIAR ITENS ---- */
const ABAS_GERENCIAR = [
  { key: "ativos", label: "Ativos", filtro: it => statusDoItem(it) === "ATIVO" },
  { key: "negociacao", label: "Em negociação", filtro: it => statusDoItem(it) === "EM_NEGOCIACAO" },
  { key: "doados", label: "Doados", filtro: it => it.status === "DOADO" },
  { key: "arquivados", label: "Arquivados", filtro: it => ["REMOVIDO", "EXPIRADO"].includes(statusDoItem(it)) },
];

function RespostaRapida({ solicitacao, notify, onEnviada }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const enviar = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await api.enviarMensagem(solicitacao.id, texto.trim());
      setTexto("");
      notify("Resposta enviada.");
      onEnviada?.();
    } catch (e) {
      notify(e.message || "Não foi possível enviar a resposta.");
    } finally {
      setEnviando(false);
    }
  };
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
      <input value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => e.key === "Enter" && enviar()} placeholder="Responder aqui..." style={{ ...fieldInput, flex: 1, border: "1px solid #E9E7DC", borderRadius: 16, padding: "8px 12px", fontSize: 12.5, background: "#fff" }} />
      <button type="button" onClick={enviar} disabled={enviando || !texto.trim()} aria-label="Enviar resposta" style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "var(--role-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: texto.trim() ? 1 : .5 }}>
        {enviando ? <Loader2 size={14} style={{ animation: "spin .8s linear infinite" }} /> : <Send size={14} />}
      </button>
    </div>
  );
}

function GerenciarItens({ go, notify }) {
  const { loading, error, data: itens, reload: reloadItens } = useApiData(() => api.meusItens(), []);
  const { data: solicitacoes, reload: reloadSolic } = useApiData(() => api.solicitacoesRecebidas(), []);
  const [expandido, setExpandido] = useState(null);
  const [acaoLoading, setAcaoLoading] = useState(null);
  const [aba, setAba] = useState("ativos");
  const [selecionando, setSelecionando] = useState(false);
  const [selecionados, setSelecionados] = useState(() => new Set());

  const reload = () => { reloadItens({ silent: true }); reloadSolic({ silent: true }); };

  useEffect(() => {
    const intervalo = setInterval(() => reloadSolic({ silent: true }), 15000);
    return () => clearInterval(intervalo);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setSelecionados(new Set()); setSelecionando(false); }, [aba]);

  const abaAtual = ABAS_GERENCIAR.find(a => a.key === aba);
  const itensVisiveis = (itens || [])
    .filter(abaAtual.filtro)
    .sort((a, b) => new Date(b.atualizadoEm || b.publicadoEm) - new Date(a.atualizadoEm || a.publicadoEm));

  const solicPorItem = (itemId) => (solicitacoes || []).filter(s => String(s.item?.id) === String(itemId));
  const ativasPorItem = (itemId) => solicPorItem(itemId).filter(s => !["CANCELADA", "RECUSADA"].includes(s.etapa));

  const executar = async (item, fn, sucesso, confirmacao) => {
    if (confirmacao && !window.confirm(confirmacao)) return;
    setAcaoLoading(item.id);
    try { await fn(); notify(sucesso); reload(); }
    catch (e) { notify(e.message || "Não foi possível concluir a ação."); }
    finally { setAcaoLoading(null); }
  };

  const remover = (item) => executar(item, () => api.removerItem(item.id), "Anúncio removido. Você pode restaurá-lo em Arquivados.", `Remover o anúncio "${item.titulo}"?`);
  const restaurar = (item) => executar(item, () => api.restaurarItem(item.id), "Item restaurado por mais 60 dias.");
  const confirmarDoacao = (item) => executar(item, () => api.marcarItemComoDoado(item.id), "Doação confirmada! Seu impacto foi atualizado.", `Confirmar que "${item.titulo}" já foi doado?`);
  const recusar = (s) => executar({ id: s.id }, () => api.recusarSolicitacao(s.id), "Solicitação recusada.", `Recusar o pedido de ${s.receptor?.nome || "este interessado"}?`);

  const acoesLote = aba === "arquivados"
    ? [{ acao: "RESTAURAR", label: "Restaurar", icon: RotateCcw, variant: "primary" }]
    : aba === "doados" ? []
    : [{ acao: "DOADO", label: "Marcar como doados", icon: CheckCircle2, variant: "primary" }, { acao: "REMOVER", label: "Remover", icon: Trash2, variant: "danger" }];

  const aplicarLote = async (acao, label) => {
    const ids = [...selecionados];
    if (ids.length === 0) return;
    if (!window.confirm(`${label}: ${ids.length} item(ns) selecionado(s). Confirmar?`)) return;
    setAcaoLoading("lote");
    try {
      const alterados = await api.acaoItensEmLote(ids, acao);
      const ignorados = ids.length - (alterados?.length || 0);
      notify(ignorados > 0 ? `${alterados.length} atualizado(s); ${ignorados} não aceitavam essa ação.` : `${alterados.length} item(ns) atualizado(s).`);
      setSelecionados(new Set());
      setSelecionando(false);
      reload();
    } catch (e) {
      notify(e.message || "Não foi possível aplicar a ação em lote.");
    } finally {
      setAcaoLoading(null);
    }
  };

  const alternarSelecao = (id) => setSelecionados(s => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  return (
    <div style={{ paddingBottom: selecionando ? 80 : 12 }}>
      <TopBar title="Gerenciar itens" onBack={() => go(-1)} right={
        <button type="button" onClick={() => go("cadastroItem")} aria-label="Cadastrar item" title="Cadastrar item" style={{ width: 34, height: 34, borderRadius: 12, background: "var(--role-soft)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Gift size={16} color="var(--role-primary-dark)" /></button>
      } />
      <div style={{ padding: "0 20px 10px", display: "flex", gap: 8, overflowX: "auto" }}>
        {ABAS_GERENCIAR.map(a => {
          const total = (itens || []).filter(a.filtro).length;
          return <Chip key={a.key} active={aba === a.key} onClick={() => setAba(a.key)}>{a.label}{total ? ` · ${total}` : ""}</Chip>;
        })}
      </div>
      {acoesLote.length > 0 && itensVisiveis.length > 1 && (
        <div style={{ padding: "0 20px 8px", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          {selecionando && <button type="button" onClick={() => setSelecionados(new Set(itensVisiveis.map(i => i.id)))} style={{ border: "none", background: "none", color: "var(--role-primary)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Selecionar todos</button>}
          <button type="button" onClick={() => { setSelecionando(s => !s); setSelecionados(new Set()); }} style={{ border: "none", background: "none", color: "var(--role-primary)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <CheckSquare size={13} /> {selecionando ? "Cancelar seleção" : "Selecionar vários"}
          </button>
        </div>
      )}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading label="Buscando seus itens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && itensVisiveis.length === 0 && (
          <EmptyState Icon={aba === "arquivados" ? Archive : aba === "doados" ? CheckCircle2 : aba === "negociacao" ? Clock : Gift} text={{
            ativos: "Nenhum anúncio ativo. Toque em 'Doar' para cadastrar um item.",
            negociacao: "Nenhum item com retirada agendada no momento.",
            doados: "Nenhum item doado ainda.",
            arquivados: "Nenhum item removido ou expirado.",
          }[aba]} />
        )}
        {itensVisiveis.map((it) => {
          const relacionadas = solicPorItem(it.id);
          const interessados = it.interessados ?? ativasPorItem(it.id).length;
          const aberto = expandido === it.id;
          const foto = it.fotosUrls?.[0];
          const Icon = (CATS[it.categoria] || CATS.OUTROS).Icon;
          const status = statusDoItem(it);
          const ocupado = acaoLoading === it.id;
          return (
            <div key={it.id} style={{ background: "#fff", border: selecionados.has(it.id) ? "1.5px solid var(--role-primary)" : "1px solid #EDEBE1", borderRadius: 16, padding: 12 }}>
              <div onClick={() => selecionando ? alternarSelecao(it.id) : setExpandido(aberto ? null : it.id)} style={{ cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}>
                {selecionando && <Checkbox checked={selecionados.has(it.id)} onChange={() => alternarSelecao(it.id)} label={`Selecionar ${it.titulo}`} />}
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--role-soft)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {foto ? <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon size={22} color="var(--role-primary-dark)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.titulo}</div>
                    <StatusBadge item={it} />
                  </div>
                  <div style={{ fontSize: 11.5, color: interessados > 0 ? "var(--role-primary-dark)" : INK_SOFT, marginTop: 4, fontWeight: interessados > 0 ? 700 : 500, display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={12} /> {interessados === 1 ? "1 interessado" : `${interessados} interessados`}
                  </div>
                  <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 2 }}>
                    {it.atualizadoEm ? `Atualizado há ${timeAgo(it.atualizadoEm)}` : `Publicado em ${new Date(it.publicadoEm).toLocaleDateString("pt-BR")}`}
                    {status === "ATIVO" && it.expiraEm && <> · até {new Date(it.expiraEm).toLocaleDateString("pt-BR")}</>}
                  </div>
                </div>
              </div>
              {aberto && !selecionando && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #F0EEE4", paddingTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>Solicitações recebidas</div>
                  {relacionadas.length === 0 && <div style={{ fontSize: 12, color: INK_SOFT }}>Nenhuma solicitação ainda.</div>}
                  {relacionadas.map(s => {
                    const encerrada = ["CANCELADA", "RECUSADA", "CONCLUIDA"].includes(s.etapa);
                    return (
                      <div key={s.id} style={{ background: "#FAFAF4", borderRadius: 12, padding: 10, opacity: encerrada && s.etapa !== "CONCLUIDA" ? .65 : 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar label={s.receptor?.nome} size={26} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{s.receptor?.nome}</div>
                            <div style={{ fontSize: 10.5, color: INK_SOFT }}>{ETAPA_LABEL[s.etapa] || "Em conversa"} · {timeAgo(s.ultimaMensagem?.criadaEm || s.criadaEm)}</div>
                          </div>
                        </div>
                        {(s.ultimaMensagem?.texto || s.mensagem) && <div style={{ fontSize: 12, color: INK_SOFT, margin: "6px 0 0" }}>"{s.ultimaMensagem?.texto || s.mensagem}"</div>}
                        {!encerrada && <RespostaRapida solicitacao={s} notify={notify} onEnviada={() => reloadSolic({ silent: true })} />}
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <Button small variant="ghost" style={{ flex: 1 }} onClick={() => go("chatDoador", { solicitacaoId: s.id, otherId: s.receptor?.id, otherName: s.receptor?.nome, itemTitulo: it.titulo, itemId: it.id })}>Abrir conversa</Button>
                          {!encerrada && <Button small variant="danger" loading={acaoLoading === s.id} onClick={() => recusar(s)}>Recusar</Button>}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginTop: 4 }}>Ações do anúncio</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button small variant="soft" icon={Eye} onClick={() => go("detalhesItem", { itemId: it.id })}>Ver anúncio</Button>
                    {(status === "ATIVO" || status === "EM_NEGOCIACAO" || status === "EXPIRADO" || status === "REMOVIDO") && <Button small variant="ghost" icon={Pencil} onClick={() => go("cadastroItem", { item: it })}>Editar</Button>}
                    <Button small variant="ghost" icon={Copy} onClick={() => go("cadastroItem", { duplicar: it })}>Duplicar</Button>
                    {(status === "ATIVO" || status === "EM_NEGOCIACAO") && <Button small variant="primary" icon={CheckCircle2} loading={ocupado} onClick={() => confirmarDoacao(it)}>Marcar como doado</Button>}
                    {(status === "REMOVIDO" || status === "EXPIRADO") && <Button small variant="primary" icon={RotateCcw} loading={ocupado} onClick={() => restaurar(it)}>Restaurar</Button>}
                    {(status === "ATIVO" || status === "EM_NEGOCIACAO" || status === "EXPIRADO") && <Button small variant="danger" icon={Trash2} loading={ocupado} onClick={() => remover(it)}>Remover</Button>}
                  </div>
                  {status === "DOADO" && <div style={{ fontSize: 11.5, color: INK_SOFT }}>Itens doados ficam no seu histórico de impacto e não podem ser editados.</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selecionando && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, padding: "10px 16px", background: "#fff", borderTop: "1px solid #EDEBE1", display: "flex", gap: 8, alignItems: "center", zIndex: 30 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: INK, flex: 1 }}>{selecionados.size} selecionado(s)</span>
          {acoesLote.map(a => <Button key={a.acao} small variant={a.variant} icon={a.icon} disabled={selecionados.size === 0} loading={acaoLoading === "lote"} onClick={() => aplicarLote(a.acao, a.label)}>{a.label}</Button>)}
        </div>
      )}
    </div>
  );
}

export { GerenciarItens };
