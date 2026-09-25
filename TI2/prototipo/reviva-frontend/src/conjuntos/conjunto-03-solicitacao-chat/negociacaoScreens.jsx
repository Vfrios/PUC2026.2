import React, { useState, useEffect } from "react";
import { api } from "../../api.js";
import { AlertTriangle, Award, Calendar, Camera, ChevronRight, Clock, Gift, MapPin, MessageCircle, QrCode, Recycle, Send, Star, X } from "lucide-react";
import { BADGES, Button, Chip, EmptyState, ErrorBox, ETAPA_LABEL, EtapasSolicitacao, fieldBox, fieldInput, fmtDateTime, ImpactRing, INK, INK_SOFT, Loading, SectionTitle, StatBox, StatusBadge, statusDoItem, timeAgo, TopBar, useApiData, badgeIndex } from "../../shared/shared.jsx";
/* ---- SOLICITAÇÃO ---- */
function Solicitacao({ go, notify, params, usuario }) {
  const itemIdParam = params?.itemId;
  const solicitacaoIdParam = params?.solicitacaoId;
  const { loading: carregandoSolic, error: erroSolic, errorStatus: statusSolic, data: solicitacaoPorId, reload: recarregarSolic } = useApiData(
    () => api.solicitacaoPorId(solicitacaoIdParam), [solicitacaoIdParam], { skip: !solicitacaoIdParam });
  const itemId = itemIdParam || solicitacaoPorId?.item?.id;
  const { data: item, loading: carregandoItem, errorStatus: statusItem } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const { data: enviadas, loading: carregandoEnviadas, reload: recarregarEnviadas } = useApiData(() => api.solicitacoesEnviadas(), [usuario?.id], { skip: !usuario?.id || !!solicitacaoIdParam });
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    if (item && !mensagem) setMensagem(`Olá! Tenho interesse no item "${item.titulo}". Ele ainda está disponível?`);
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const existente = solicitacaoPorId || (enviadas || []).find(s => s.item?.id === itemId && !["CANCELADA", "RECUSADA"].includes(s.etapa));
  const status = statusDoItem(item);
  const souDono = usuario && item?.doador?.id === usuario.id;
  const souDoadorDaSolic = existente && usuario && existente.doadorId === usuario.id;
  const outroNome = souDoadorDaSolic ? existente?.receptor?.nome : (existente?.item?.doador?.nome || item?.doador?.nome);
  const outroId = souDoadorDaSolic ? existente?.receptor?.id : (existente?.item?.doador?.id || item?.doador?.id);

  const abrirChat = (s) => go(souDoadorDaSolic ? "chatDoador" : "chatReceptor", {
    solicitacaoId: s.id, otherId: outroId, otherName: outroNome,
    itemTitulo: s.item?.titulo || item?.titulo, itemId: s.item?.id || itemId,
  });

  const enviar = async () => {
    if (!itemId) return;
    if (mensagem.trim().length < 5) { notify("Escreva uma mensagem um pouco maior para o anunciante."); return; }
    setLoading(true);
    try {
      const solicitacao = await api.solicitar(itemId, mensagem.trim());
      notify("Solicitação enviada! Acompanhe a resposta pelo chat.");
      go("chatReceptor", {
        solicitacaoId: solicitacao.id,
        otherId: solicitacao.item?.doador?.id,
        otherName: solicitacao.item?.doador?.nome,
        itemTitulo: solicitacao.item?.titulo,
        itemId: solicitacao.item?.id || itemId,
      });
    } catch (e) {
      notify(e.message || "Não foi possível enviar a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const cancelar = async () => {
    if (!existente) return;
    if (!window.confirm("Cancelar esta solicitação? Se houver retirada agendada, ela também será cancelada e o anunciante será avisado.")) return;
    setCancelando(true);
    try {
      await api.cancelarSolicitacao(existente.id);
      notify("Solicitação cancelada.");
      if (solicitacaoIdParam) recarregarSolic(); else recarregarEnviadas();
    } catch (e) {
      notify(e.message || "Não foi possível cancelar.");
    } finally {
      setCancelando(false);
    }
  };

  const carregando = carregandoSolic || carregandoItem || (carregandoEnviadas && !enviadas);
  if (carregando && !item && !existente) return <div><TopBar title="Solicitação" onBack={() => go(-1)} /><Loading /></div>;
  if (solicitacaoIdParam && (statusSolic === 403 || statusSolic === 404)) {
    return <div><TopBar title="Solicitação" onBack={() => go(-1)} /><EmptyState Icon={AlertTriangle} text={statusSolic === 403 ? "Você não participa desta solicitação." : "Solicitação não encontrada."} /></div>;
  }
  if (erroSolic) return <div><TopBar title="Solicitação" onBack={() => go(-1)} /><ErrorBox message={erroSolic} onRetry={recarregarSolic} /></div>;
  if (!itemId || statusItem === 404) return <div><TopBar title="Solicitação" onBack={() => go(-1)} /><EmptyState Icon={AlertTriangle} text="Este item não existe mais." /></div>;

  const foto = item?.fotosUrls?.[0];
  const podeCancelar = existente && ["ENVIADA", "ACEITA", "AGENDADA"].includes(existente.etapa);

  return (
    <div>
      <TopBar title={existente ? "Minha solicitação" : "Solicitar item"} onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 20px" }}>
        {item && (
          <div onClick={() => go("detalhesItem", { itemId })} style={{ display: "flex", gap: 10, alignItems: "center", background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 10, cursor: "pointer" }}>
            <div style={{ width: 54, height: 54, borderRadius: 12, overflow: "hidden", background: "var(--role-soft)", flexShrink: 0 }}>{foto && <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: INK }}>{item.titulo}</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 2 }}>{item.doador?.nome} · {[item.bairro, item.cidade].filter(Boolean).join(", ")}</div>
              <div style={{ marginTop: 4 }}><StatusBadge item={item} /></div>
            </div>
            <ChevronRight size={16} color={INK_SOFT} />
          </div>
        )}

        {existente ? (
          <>
            <SectionTitle>Andamento</SectionTitle>
            <div style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 }}>
              <EtapasSolicitacao etapa={existente.etapa} />
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: INK }}>
              <div><b>Status:</b> {ETAPA_LABEL[existente.etapa] || existente.status}</div>
              <div style={{ color: INK_SOFT }}>Enviada em {fmtDateTime(existente.criadaEm)}</div>
              {existente.ultimaMensagem && <div style={{ background: "#F1EFE6", borderRadius: 12, padding: 10 }}><b>Última mensagem:</b> {existente.ultimaMensagem.texto}<div style={{ fontSize: 11, color: INK_SOFT, marginTop: 3 }}>há {timeAgo(existente.ultimaMensagem.criadaEm)}</div></div>}
              {existente.etapa === "ENVIADA" && <div style={{ color: INK_SOFT }}>O anunciante ainda não respondeu. Você será notificado quando houver resposta.</div>}
              {existente.agendamento && existente.agendamento.status !== "CANCELADO" && (
                <div style={{ background: "var(--role-soft)", borderRadius: 12, padding: 10, color: "var(--role-primary-dark)" }}>
                  <b>Retirada:</b> {fmtDateTime(existente.agendamento.dataHora)}{existente.agendamento.localEncontro ? ` · ${existente.agendamento.localEncontro}` : ""}
                  <div style={{ fontSize: 11, marginTop: 3 }}>{existente.agendamento.confirmadoPeloReceptor ? "Confirmada pelo receptor." : "Aguardando confirmação do receptor."}</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <Button full icon={MessageCircle} onClick={() => abrirChat(existente)}>Abrir conversa</Button>
              {podeCancelar && <Button full variant="danger" icon={X} loading={cancelando} onClick={cancelar}>Cancelar solicitação</Button>}
              {!podeCancelar && ["CANCELADA", "RECUSADA"].includes(existente.etapa) && status === "ATIVO" && !souDoadorDaSolic && <Button full variant="ghost" onClick={() => go("solicitacao", { itemId })}>Solicitar novamente</Button>}
            </div>
          </>
        ) : souDono ? (
          <EmptyState Icon={Gift} text="Este item é seu. Acompanhe os pedidos em Gerenciar itens." />
        ) : status !== "ATIVO" ? (
          <div style={{ marginTop: 16, background: "#FBE8E0", color: "#9C4327", borderRadius: 14, padding: 14, fontSize: 13 }}>
            {status === "EM_NEGOCIACAO" ? "Este item está reservado para outra pessoa. Favorite para saber se ele voltar a ficar disponível." : "Este item não está mais disponível para solicitações."}
          </div>
        ) : (
          <>
            <SectionTitle>Mensagem para o anunciante</SectionTitle>
            <div style={{ ...fieldBox, alignItems: "flex-start" }}>
              <textarea rows={4} maxLength={500} value={mensagem} onChange={e => setMensagem(e.target.value)} style={{ ...fieldInput, resize: "none" }} />
            </div>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 4 }}>Apresente-se e diga quando pode retirar. A conversa fica disponível no Inbox.</div>
            {item?.regrasRetirada && <div style={{ marginTop: 10, background: "var(--role-soft)", borderRadius: 12, padding: 10, fontSize: 12, color: "var(--role-primary-dark)" }}><b>Regras do anunciante:</b> {item.regrasRetirada}</div>}
            <div style={{ marginTop: 18 }}>
              <Button full icon={Send} loading={loading} onClick={enviar}>Enviar solicitação</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Agendamento({ go, role, notify, params, usuario }) {
  const { solicitacaoId, otherName, itemTitulo, itemId } = params || {};
  const { data: item } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const papelAtual = item?.doador?.id === usuario?.id ? "doador" : "receptor";
  const [data, setData] = useState(dataLocalAtual);
  const [hora, setHora] = useState(horaLocalAtual);
  const [local, setLocal] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const { data: enderecos, loading: carregandoEnderecos } = useApiData(() => api.enderecos(), [usuario?.id], { skip: !usuario?.id });
  const formatarEndereco = (e) => [
    [e.logradouro, e.numero].filter(Boolean).join(", "),
    e.complemento, e.bairro, e.cidade,
  ].filter(Boolean).join(" · ");

  useEffect(() => {
    if (local || !enderecos) return;
    const principal = enderecos.find(e => e.principal) || enderecos[0];
    if (principal) setLocal(formatarEndereco(principal));
  }, [enderecos]); // eslint-disable-line react-hooks/exhaustive-deps

  const confirmar = async () => {
    if (!solicitacaoId) { setErro("Solicitação não identificada — volte pelo chat."); return; }
    if (!data) { setErro("Escolha uma data."); return; }
    if (new Date(`${data}T${hora || "10:00"}:00`) < new Date(Date.now() - 60_000)) { setErro("Escolha uma data e horário no futuro."); return; }
    if (local.trim().length < 5) { setErro("Informe o local de encontro."); return; }
    setErro("");
    setLoading(true);
    try {
      const iso = new Date(`${data}T${hora || "10:00"}:00`).toISOString();
      const agendamento = await api.agendar(solicitacaoId, iso, local);
      notify(`Retirada agendada para ${fmtDateTime(iso)}`);
      go(papelAtual === "doador" ? "chatDoador" : "chatReceptor", { ...params, agendamento, otherName, itemTitulo, itemId });
    } catch (e) {
      setErro(e.message || "Não foi possível agendar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar title="Agendar retirada" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        <SectionTitle>Data</SectionTitle>
        <div style={fieldBox}><Calendar size={16} color={INK_SOFT} /><input type="date" value={data} onChange={e => setData(e.target.value)} style={fieldInput} /></div>
        <SectionTitle>Horário</SectionTitle>
        <div style={fieldBox}><Clock size={16} color={INK_SOFT} /><input type="time" value={hora} onChange={e => setHora(e.target.value)} style={fieldInput} /></div>
        <SectionTitle>Local de encontro</SectionTitle>
        {(enderecos || []).length > 0 && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {enderecos.map(e => <Chip key={e.id} active={local === formatarEndereco(e)} onClick={() => setLocal(formatarEndereco(e))}>{e.apelido || e.bairro}{e.principal ? " ★" : ""}</Chip>)}
          </div>
        )}
        <div style={fieldBox}><MapPin size={16} color={INK_SOFT} /><input value={local} onChange={e => setLocal(e.target.value)} placeholder="Ex: portaria do prédio, praça, estação..." style={fieldInput} /></div>
        {!carregandoEnderecos && (enderecos || []).length === 0 && (
          <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 6 }}>
            Dica: <span onClick={() => go("enderecos")} style={{ ...linkText, fontSize: 11.5 }}>salve seus endereços</span> para preencher o local com um toque.
          </div>
        )}
        <div style={{ background: "var(--role-soft)", borderRadius: 14, padding: 12, marginTop: 14, fontSize: 11.5, color: "var(--role-primary-dark)", display: "flex", gap: 8 }}>
          <QrCode size={16} /> Ao confirmar, um código de retirada é gerado automaticamente para fechar a doação com 1 toque.
        </div>
        {erro && <div style={{ marginTop: 12, fontSize: 12, color: "#9C4327", background: "#FBE8E0", padding: "8px 10px", borderRadius: 10 }}>{erro}</div>}
        <div style={{ marginTop: 18 }}>
          <Button full loading={loading} onClick={confirmar}>Confirmar agendamento</Button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDoacao({ go, notify, params, refreshUsuario }) {
  const { agendamento, otherName } = params || {};
  const [loading, setLoading] = useState(false);
  const [agendamentoAtual, setAgendamentoAtual] = useState(agendamento);
  const [gerandoCodigo, setGerandoCodigo] = useState(false);
  useEffect(() => {
    if (!agendamento?.id) return;
    setGerandoCodigo(true);
    api.gerarCodigoRetirada(agendamento.id)
      .then(setAgendamentoAtual)
      .catch(e => notify(e.message || "Não foi possível gerar o código."))
      .finally(() => setGerandoCodigo(false));
  }, [agendamento?.id]);
  if (!agendamento) return <div><TopBar title="Confirmação" onBack={() => go(-1)} /><EmptyState Icon={QrCode} text="Nenhum agendamento em andamento." /></div>;

  const token = agendamentoAtual?.codigoRetirada || agendamentoAtual?.solicitacao?.item?.qrCodeToken;

  const confirmar = async () => {
    setLoading(true);
    try {
      await api.confirmarPorDoador(agendamento.id);
      await refreshUsuario();
      notify("Doação confirmada! Obrigado por reduzir o desperdício 🌱");
      go("avaliarReceptor", {
        agendamentoId: agendamento.id,
        avaliadoId: agendamento.solicitacao?.receptor?.id,
        quem: agendamento.solicitacao?.receptor?.nome || otherName,
        next: "dashboardImpacto",
      });
    } catch (e) {
      notify(e.message || "Não foi possível confirmar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar title="Confirmação" onBack={() => go(-1)} />
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "30px 24px", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
        <QrCode size={40} color="var(--role-primary-dark)" />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: INK }}>Hoje é dia de retirada!</div>
      <div style={{ fontSize: 13, color: INK_SOFT, marginTop: 6, maxWidth: 260 }}>Mostre este código para {otherName || "o receptor"} digitar no app dele e confirmar automaticamente.</div>
      {gerandoCodigo && <div style={{ marginTop: 16, fontSize: 12, color: INK_SOFT }}>Gerando código...</div>}
      {token && (
        <div style={{ marginTop: 16, background: "#F1EFE6", borderRadius: 12, padding: "12px 18px", fontFamily: "monospace", fontSize: 12, color: INK, wordBreak: "break-all" }}>{token}</div>
      )}
      {!token && !gerandoCodigo && <div style={{ marginTop: 16, fontSize: 12, color: "#9C4327" }}>O código ainda não foi gerado.</div>}
      <div style={{ marginTop: 26, width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <Button full loading={loading} disabled={!token || gerandoCodigo} onClick={confirmar}>Confirmar retirada manualmente</Button>
        <Button full variant="ghost" icon={AlertTriangle} onClick={async () => { try { await api.reportarProblema(agendamento.id); } catch {} go("moderacao", params); }}>Relatar um problema</Button>
      </div>
      </div>
    </div>
  );
}

function ConfirmRecebimento({ go, notify, params, refreshUsuario }) {
  const { agendamento, otherName } = params || {};
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  if (!agendamento) return <div><TopBar title="Confirmação" onBack={() => go(-1)} /><EmptyState Icon={QrCode} text="Nenhum agendamento em andamento." /></div>;

  const irParaAvaliacao = async () => {
    await refreshUsuario();
    go("avaliarDoador", {
      agendamentoId: agendamento.id,
      avaliadoId: agendamento.solicitacao?.item?.doador?.id,
      quem: agendamento.solicitacao?.item?.doador?.nome || otherName,
      next: "historico",
    });
  };

  const confirmarComCodigo = async () => {
    if (!codigo.trim()) { notify("Digite o código mostrado pelo doador."); return; }
    setLoading(true);
    try {
      await api.confirmarPorQrCode(agendamento.id, codigo.trim());
      notify("Recebimento confirmado ✔");
      await irParaAvaliacao();
    } catch (e) {
      notify(e.message || "Código inválido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar title="Confirmação" onBack={() => go(-1)} />
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "30px 24px", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
        <QrCode size={40} color="var(--role-primary-dark)" />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: INK }}>Digite o código de retirada</div>
      <div style={{ fontSize: 13, color: INK_SOFT, marginTop: 6, maxWidth: 260 }}>Peça para {otherName || "o doador"} mostrar o código dele assim que você receber o item.</div>
      <div style={{ ...fieldBox, width: "100%", marginTop: 18 }}>
        <input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Cole o código aqui" style={{ ...fieldInput, fontFamily: "monospace" }} />
      </div>
      <div style={{ marginTop: 20, width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <Button full icon={Camera} loading={loading} onClick={confirmarComCodigo}>Confirmar com código</Button>
        <Button full variant="ghost" icon={AlertTriangle} onClick={async () => { try { await api.reportarProblema(agendamento.id); } catch {} go("moderacao", params); }}>Relatar um problema</Button>
      </div>
      </div>
    </div>
  );
}

function DashboardImpacto({ go, usuario }) {
  const kg = usuario?.kgResiduoEvitado || 0;
  const itens = usuario?.itensDoados || 0;
  const pontos = usuario?.pontos || 0;
  const idx = badgeIndex(usuario?.seloAtual);
  const proximo = BADGES[idx + 1];
  const metaKg = 100;
  const pct = Math.min(1, kg / metaKg);
  const kgLabel = Number.isInteger(kg) ? String(kg) : kg.toFixed(1).replace(".", ",");
  return (
    <div>
      <TopBar title="Meu impacto" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 24px" }}>
        <div style={{
          borderRadius: 22, padding: "18px 18px 16px", color: "#fff", overflow: "hidden", position: "relative",
          background: "linear-gradient(145deg, #1F6E43 0%, #164F31 55%, #123F27 100%)",
        }}>
          <div style={{ position: "absolute", right: -20, top: -28, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 700,
            letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,.9)",
            background: "rgba(255,255,255,.12)", borderRadius: 999, padding: "5px 10px",
          }}>
            <Recycle size={13} strokeWidth={2.4} /> ODS 12
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: 14 }}>
            <ImpactRing pct={pct} size={96} value={kgLabel} label="kg" tone="light" />
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, lineHeight: 1.25 }}>
                Material fora do descarte
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 5, lineHeight: 1.4 }}>
                Cada quilo é algo que ganhou outro uso.
              </div>
              <div style={{ marginTop: 10, fontSize: 11, fontWeight: 600, color: "#F6D48A" }}>
                Meta {metaKg} kg · {Math.round(pct * 100)}%
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
          <StatBox value={itens} label={itens === 1 ? "item doado" : "itens doados"} Icon={Gift} />
          <StatBox value={pontos} label="pontos" Icon={Award} />
          <StatBox value={(usuario?.reputacaoScore || 0).toFixed(1)} label="nota média" Icon={Star} />
        </div>

        <SectionTitle>Selo de impacto</SectionTitle>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
          {BADGES.map((b, i) => (
            <div key={b.tier} style={{ minWidth: 78, textAlign: "center", opacity: i <= idx ? 1 : 0.35 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: b.color + "18", border: `1.5px solid ${b.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                <Award size={20} color={b.color} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: INK, marginTop: 6 }}>{b.label}</div>
            </div>
          ))}
        </div>
        {proximo && (
          <div style={{ marginTop: 12, fontSize: 12, color: INK_SOFT, lineHeight: 1.45 }}>
            Faltam <b style={{ color: INK }}>{Math.max(0, proximo.min - pontos)} pontos</b> para o selo {proximo.label}.
          </div>
        )}
      </div>
    </div>
  );
}

export { Solicitacao, Agendamento, ConfirmDoacao, ConfirmRecebimento, DashboardImpacto };
