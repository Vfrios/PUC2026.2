import React, { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api, getToken, setToken, ApiError, wsUrl } from "../../api.js";
import { Client as StompClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Home, Plus, Search, MapPin, User, Bell, Heart, MessageCircle, Star, QrCode, Users, Settings, ChevronLeft, Camera, Send, Award, Leaf, AlertTriangle, ChevronRight, Recycle, Gift, Share2, Flag, Shirt, BookOpen, Sofa, Baby, Zap, UtensilsCrossed, Calendar, Clock, LogIn, Mail, Lock, Sparkles, ShieldCheck, ArrowLeftRight, ImagePlus, LogOut, Loader2, UserPlus, Trash2, Pencil, CheckCircle2, RotateCcw, X, CornerUpLeft } from "lucide-react";
import { ROLE_COLORS, GOLD, INK, INK_SOFT, CATS, ESTADOS, CO2_ESTIMADO, BADGES, MOTIVOS_DENUNCIA, NOTIF_ICONS, COMMUNITY_POSTS, capitalize, timeAgo, fmtDateTime, badgeIndex, onlyDigits, distanciaKm, formatCpf, formatCep, cpfValido, comprimirImagem, useApiData, Button, Chip, Avatar, Stars, SectionTitle, ImpactRing, ItemCard, Toast, Loading, ErrorBox, StatusBar, TopBar, BottomNav, Screen, iconBtn, linkText, fieldLabel, fieldBox, fieldInput, EmptyState, StatBox, ETAPA_LABEL } from "../../shared/shared.jsx";

const dataAtual = new Date();
const doisDigitos = valor => String(valor).padStart(2, "0");
const dataLocalAtual = `${dataAtual.getFullYear()}-${doisDigitos(dataAtual.getMonth() + 1)}-${doisDigitos(dataAtual.getDate())}`;
const horaLocalAtual = `${doisDigitos(dataAtual.getHours())}:${doisDigitos(dataAtual.getMinutes())}`;

/** Polling de Inbox/Chat: valida mensagens novas a cada 10s. */
const POLL_MS = 10_000;

function usePolling(callback, enabled = true) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;

    const tick = () => {
      if (document.visibilityState === "visible") callbackRef.current();
    };

    const id = window.setInterval(tick, POLL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") callbackRef.current();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);
}

function previewMensagemInbox(s) {
  const ultima = s?.ultimaMensagem?.texto;
  if (ultima) return ultima;
  if (s?.mensagem) return s.mensagem;
  return s?.item?.titulo || "Conversa";
}

function mensagensIguais(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  return a.every((m, i) =>
    m.id === b[i]?.id
    && m.texto === b[i]?.texto
    && !!m.lida === !!b[i]?.lida
    && !!m.entregue === !!b[i]?.entregue
  );
}

function LocationMessage({ latitude, longitude, horario }) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const horarioFormatado = horario
    ? new Date(horario).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";
  const coordenadaValida = Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  if (!coordenadaValida) return <div>Localização indisponível</div>;

  return (
    <div className="location-message-card rounded-2xl shadow-md overflow-hidden bg-white" style={{ width: "min(280px, 100%)" }}>
      <div className="location-message-map">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          minZoom={15}
          maxZoom={15}
          zoomControl={false}
          dragging={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          touchZoom={false}
          keyboard={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap"
          />
        </MapContainer>
      </div>
      <div className="location-message-details">
        <div>
          <strong>Localização atual</strong>
          {horarioFormatado && <time>{horarioFormatado}</time>}
        </div>
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
        >
          Abrir no Google Maps
        </a>
      </div>
    </div>
  );
}

function parseLocationMessage(texto) {
  if (!texto) return null;
  try {
    const payload = JSON.parse(texto);
    if (payload?.tipo !== "LOCALIZACAO") return null;
    return payload;
  } catch {
    return null;
  }
}

function parseImageMessage(texto) {
  if (!texto) return null;
  try {
    const payload = JSON.parse(texto);
    return payload?.tipo === "IMAGEM" && payload.url ? payload : null;
  } catch {
    return null;
  }
}

function ImageMessage({ image }) {
  return (
    <div>
      <img src={image.url} alt={image.nome || "Imagem enviada"} style={{ display: "block", width: "min(240px, 100%)", maxHeight: 280, objectFit: "cover", borderRadius: 10 }} />
      {image.nome && <div style={{ marginTop: 5, fontSize: 10.5, opacity: .8 }}>{image.nome}</div>}
    </div>
  );
}

const EVENTOS_TROCA = ["AGENDAMENTO_CRIADO", "AGENDAMENTO_CONFIRMADO", "RETIRADA_CONFIRMADA", "SOLICITACAO_CANCELADA", "SOLICITACAO_RECUSADA"];

function parseTradeEvent(texto) {
  if (!texto) return null;
  try {
    const payload = JSON.parse(texto);
    return EVENTOS_TROCA.includes(payload?.tipo) ? payload : null;
  } catch {
    return null;
  }
}

function parseReplyMessage(texto) {
  if (!texto) return null;
  try {
    const payload = JSON.parse(texto);
    return payload?.tipo === "RESPOSTA" && typeof payload.texto === "string" ? payload : null;
  } catch {
    return null;
  }
}

/** Texto curto de uma mensagem para citações (respostas). */
function resumoMensagem(texto) {
  if (parseLocationMessage(texto)) return "Localização compartilhada";
  if (parseImageMessage(texto)) return "Foto";
  const resposta = parseReplyMessage(texto);
  const base = resposta ? resposta.texto : texto || "";
  return base.length > 90 ? `${base.slice(0, 87)}...` : base;
}

const LIMITE_ARRASTE_RESPOSTA = 56;

/** Arrastar para a direita (toque) ou clique duplo (mouse) cita a mensagem, como no WhatsApp. */
function MensagemResponder({ ativo, onResponder, style, children }) {
  const [deslocamento, setDeslocamento] = useState(0);
  const gesto = useRef(null);

  const iniciar = (e) => {
    if (!ativo || e.pointerType === "mouse") return;
    gesto.current = { x: e.clientX, y: e.clientY, horizontal: null, dx: 0 };
  };
  const mover = (e) => {
    const g = gesto.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (g.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) g.horizontal = Math.abs(dx) > Math.abs(dy);
    if (g.horizontal) {
      g.dx = Math.max(0, Math.min(dx, LIMITE_ARRASTE_RESPOSTA + 20));
      setDeslocamento(g.dx);
    } else if (g.horizontal === false) gesto.current = null;
  };
  const finalizar = () => {
    if (gesto.current?.horizontal && gesto.current.dx >= LIMITE_ARRASTE_RESPOSTA) {
      navigator.vibrate?.(15);
      onResponder();
    }
    gesto.current = null;
    setDeslocamento(0);
  };

  return (
    <div
      onPointerDown={iniciar}
      onPointerMove={mover}
      onPointerUp={finalizar}
      onPointerCancel={finalizar}
      onDoubleClick={ativo ? (e) => { window.getSelection?.()?.removeAllRanges(); e.preventDefault(); onResponder(); } : undefined}
      style={{ ...style, position: "relative", touchAction: "pan-y", userSelect: ativo ? "none" : undefined, transform: `translateX(${deslocamento}px)`, transition: deslocamento ? "none" : "transform .2s ease" }}
    >
      {deslocamento > 0 && (
        <div style={{ position: "absolute", left: -28, top: "50%", transform: "translateY(-50%)", opacity: Math.min(deslocamento / LIMITE_ARRASTE_RESPOSTA, 1), color: "var(--role-primary)", display: "flex" }}>
          <CornerUpLeft size={18} />
        </div>
      )}
      {children}
    </div>
  );
}

function TradeEventMessage({ event }) {
  const labels = {
    AGENDAMENTO_CONFIRMADO: [CheckCircle2, "Agendamento confirmado", "O receptor confirmou a data, hora e local da retirada."],
    RETIRADA_CONFIRMADA: [CheckCircle2, "Retirada confirmada", "A doação foi concluída com sucesso."],
    SOLICITACAO_CANCELADA: [X, "Conversa cancelada", "Esta troca foi cancelada e não aceita novas mensagens."],
    SOLICITACAO_RECUSADA: [X, "Solicitação recusada", "O anunciante recusou este pedido. O item segue disponível para outras pessoas."],
  };
  if (event.tipo === "AGENDAMENTO_CRIADO") {
    return <div style={{ background: "var(--role-soft)", color: "var(--role-primary-dark)", padding: "11px 13px", borderRadius: 14, fontSize: 12.5 }}><strong>Agendamento criado</strong><div style={{ marginTop: 4 }}>{fmtDateTime(event.dataHora)}{event.local ? ` · ${event.local}` : ""}</div></div>;
  }
  const [Icon, title, detail] = labels[event.tipo];
  return <div style={{ background: "#F1EFE6", color: INK, padding: "11px 13px", borderRadius: 14, fontSize: 12.5, display: "flex", gap: 9, alignItems: "center" }}><Icon size={18} color="var(--role-primary-dark)" /><div><strong>{title}</strong><div style={{ marginTop: 2, color: INK_SOFT }}>{detail}</div></div></div>;
}

/** Checks de status no estilo WhatsApp: 1 = enviado, 2 cinza = entregue, 2 azul = lido. */
function WhatsAppTicks({ entregue, lida, onDark }) {
  const color = lida ? "#53BDEB" : (onDark ? "rgba(255,255,255,.75)" : "#8696A0");
  const label = lida ? "Lida" : entregue ? "Entregue" : "Enviada";
  return (
    <span aria-label={label} title={label} style={{ display: "inline-flex", alignItems: "center", marginLeft: 3, lineHeight: 0 }}>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden="true">
        <path d="M11.1 1.1 5.05 8.05 2.2 5.2" stroke={color} strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        {(entregue || lida) && (
          <path d="M14.35 1.1 8.3 8.05 7.1 6.85" stroke={color} strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </span>
  );
}

function MessageMeta({ mensagem, mine, onDark }) {
  const horario = mensagem.criadaEm
    ? new Date(mensagem.criadaEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";
  return (
    <div style={{
      marginTop: 3, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2,
      fontSize: 10, lineHeight: 1, color: onDark ? "rgba(255,255,255,.72)" : INK_SOFT,
    }}>
      {horario && <span>{horario}</span>}
      {mine && <WhatsAppTicks entregue={!!mensagem.entregue} lida={!!mensagem.lida} onDark={onDark} />}
    </div>
  );
}

function upsertMensagem(lista, nova) {
  const key = nova.localKey || nova.id;
  const idx = lista.findIndex((m) => m.id === nova.id || (nova.localKey && m.localKey === nova.localKey) || (key && m.localKey === key));
  if (idx < 0) return [...lista, nova];
  const next = [...lista];
  next[idx] = { ...next[idx], ...nova, localKey: next[idx].localKey || nova.localKey };
  return next;
}

/** Confirma envio trocando o temp pelo retorno da API, sem remontar o balão. */
function confirmarEnvio(lista, localKey, enviada) {
  return lista.map((m) => (m.localKey === localKey || m.id === localKey
    ? { ...enviada, localKey: m.localKey || localKey }
    : m));
}

function mensagemOtimista(usuario, texto) {
  const localKey = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: localKey,
    localKey,
    texto,
    criadaEm: new Date().toISOString(),
    entregue: false,
    lida: false,
    pendente: true,
    remetente: { id: usuario?.id, nome: usuario?.nome, fotoUrl: usuario?.fotoUrl },
  };
}

/** Mantém balões ainda não confirmados ao aplicar a lista do servidor. */
function mesclarComPendentes(servidor, atual) {
  let next = [...(servidor || [])];
  for (const m of atual || []) {
    if (!m.pendente && !String(m.id).startsWith("local-") && !String(m.id).startsWith("temp-")) continue;
    const jaConfirmada = next.some((s) =>
      s.texto === m.texto
      && s.remetente?.id
      && s.remetente.id === m.remetente?.id
      && Math.abs(new Date(s.criadaEm) - new Date(m.criadaEm)) < 60_000
    );
    if (!jaConfirmada) next = upsertMensagem(next, m);
  }
  return next;
}

function Inbox({ go, usuario }) {
  const { loading, error, data: conversas, reload } = useApiData(() => api.conversas(), [usuario?.id]);
  // Não exige item/receptor completos — conversas antigas com DBRef quebrado ainda devem aparecer.
  const visiveis = (conversas || []).filter(s => s?.id);

  usePolling(() => reload({ silent: true }), !!usuario?.id);

  return (
    <div>
      <TopBar title="Inbox" onBack={() => go(-1)} right={<button type="button" onClick={() => reload()} style={{ ...iconBtn, width: 30, height: 30 }} aria-label="Atualizar conversas" title="Atualizar"><RotateCcw size={14} color="var(--role-primary-dark)" /></button>} />
      <div style={{ padding: "0 20px" }}>
        {loading && <Loading label="Carregando conversas..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && visiveis.length === 0 && <EmptyState Icon={MessageCircle} text="Nenhuma conversa por aqui." />}
        {visiveis.map(s => {
          const naoLidas = s.mensagensNaoLidas || s.unreadCount || 0;
          const souDoador = s.item?.doador?.id === usuario?.id || s.doadorId === usuario?.id;
          const outroNome = souDoador ? (s.receptor?.nome || "Interessado") : (s.item?.doador?.nome || "Doador");
          const outroId = souDoador ? s.receptor?.id : s.item?.doador?.id;
          const preview = previewMensagemInbox(s);
          const horario = s.ultimaMensagem?.criadaEm || s.criadaEm;
          return <div key={s.id} onClick={() => go(souDoador ? "chatDoador" : "chatReceptor", { solicitacaoId: s.id, otherId: outroId, otherName: outroNome, itemTitulo: s.item?.titulo, itemId: s.item?.id })} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, marginBottom: 8, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 14, cursor: "pointer" }}>
            <Avatar label={outroNome} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{outroNome}</div>
                {horario && <div style={{ fontSize: 10, color: INK_SOFT, flexShrink: 0 }}>{timeAgo(horario)}</div>}
              </div>
              <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.item?.titulo || "Item"}{s.etapa && <span style={{ color: ["CANCELADA", "RECUSADA"].includes(s.etapa) ? "#9C4327" : "var(--role-primary-dark)", fontWeight: 700 }}> · {ETAPA_LABEL[s.etapa]}</span>}</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{preview}</div>
            </div>
            {naoLidas > 0 && <span style={{ minWidth: 20, height: 20, borderRadius: 10, padding: "0 6px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--role-primary)", color: "#fff", fontSize: 10, fontWeight: 700 }}>{naoLidas}</span>}
          </div>;
        })}
      </div>
    </div>
  );
}

function Chat({ go, role, notify, params, usuario, onlineIds = new Set() }) {
  const { solicitacaoId, otherId, otherName, itemTitulo, itemId } = params || {};
  const { data: item } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const papelAtual = item?.doador?.id === usuario?.id ? "doador" : "receptor";
  const { data: agendamento, reload: recarregarAgendamento } = useApiData(() => api.agendamentoDaSolicitacao(solicitacaoId), [solicitacaoId], { skip: !solicitacaoId });
  const { data: solicitacao, reload: recarregarSolicitacao } = useApiData(() => api.solicitacaoPorId(solicitacaoId), [solicitacaoId], { skip: !solicitacaoId });
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sending, setSending] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [conexao, setConexao] = useState("conectando");
  const [respondendo, setRespondendo] = useState(null);
  const encerrada = ["CANCELADA", "RECUSADA"].includes(solicitacao?.etapa);
  const scrollRef = useRef(null);
  const fotoRef = useRef(null);
  const cameraRef = useRef(null);
  const inputRef = useRef(null);

  const carregar = useCallback(async ({ silent = false } = {}) => {
    if (!solicitacaoId) return;
    try {
      const data = await api.listarMensagens(solicitacaoId);
      setMessages((atual) => {
        if (silent) {
          let next = atual;
          for (const m of data || []) next = upsertMensagem(next, m);
          // Tira pendentes que o servidor já confirmou (mesmo texto + remetente).
          next = next.filter((m) => {
            if (!m.pendente) return true;
            return !next.some((s) =>
              !s.pendente
              && s.id !== m.id
              && s.texto === m.texto
              && s.remetente?.id === m.remetente?.id
            );
          });
          return mensagensIguais(atual, next) ? atual : next;
        }
        return mesclarComPendentes(data, atual);
      });
      if (!silent) setErro("");
    } catch (e) {
      if (!silent) setErro(e.message || "Não foi possível carregar as mensagens.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [solicitacaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Polling a cada 10s: valida se chegou mensagem nova (além do WebSocket).
  usePolling(() => carregar({ silent: true }), !!solicitacaoId);

  // Chat em tempo real: assina o tópico desta conversa via STOMP/WebSocket.
  useEffect(() => {
    if (!solicitacaoId) return;

    let jaConectou = false;
    const client = new StompClient({
      webSocketFactory: () => new SockJS(`${wsUrl()}?token=${encodeURIComponent(getToken() || "")}`),
      reconnectDelay: 4000,
      onWebSocketClose: () => setConexao(jaConectou ? "reconectando" : "falhou"),
      onStompError: () => setConexao("reconectando"),
      onConnect: () => {
        // Ao reconectar, busca o que chegou enquanto o WebSocket estava fora.
        if (jaConectou) carregar({ silent: true });
        jaConectou = true;
        setConexao("online");
        client.subscribe(`/topic/solicitacoes/${solicitacaoId}`, (frame) => {
          const nova = JSON.parse(frame.body);
          setMessages((atual) => {
            // Eco do próprio envio: confirma só o pendente mais antigo com o mesmo texto.
            let trocou = false;
            const limpa = atual.map((m) => {
              if (trocou || !m.pendente) return m;
              if (m.texto === nova.texto && m.remetente?.id && m.remetente.id === nova.remetente?.id) {
                trocou = true;
                return { ...nova, localKey: m.localKey, pendente: false };
              }
              return m;
            });
            if (trocou) return limpa;
            return upsertMensagem(limpa, nova);
          });
          const deOutraPessoa = usuario?.id && nova.remetente?.id && nova.remetente.id !== usuario.id;
          if (deOutraPessoa && document.visibilityState !== "visible" && "Notification" in window && Notification.permission === "granted") {
            new Notification(`Nova mensagem de ${nova.remetente?.nome || otherName || "Reviva"}`, { body: resumoMensagem(nova.texto) });
          }
          // Se a mensagem veio do outro lado e o chat está visível, confirmamos
          // leitura (checks azuis). Com a aba oculta, o polling marca ao voltar.
          if (usuario?.id && nova.remetente?.id && nova.remetente.id !== usuario.id
            && document.visibilityState === "visible") {
            api.marcarMensagensLidas(solicitacaoId).catch(() => {});
          }
          if (parseTradeEvent(nova.texto)) {
            recarregarAgendamento();
            recarregarSolicitacao({ silent: true });
          }
        });
      },
    });
    client.activate();

    return () => client.deactivate();
  }, [solicitacaoId, usuario?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!draft.trim() || !solicitacaoId || encerrada) return;
    const texto = draft;
    const citacao = respondendo;
    setDraft("");
    setRespondendo(null);
    const payload = citacao
      ? JSON.stringify({ tipo: "RESPOSTA", texto: texto.trim(), citacao: { id: citacao.id, autor: citacao.remetente?.nome || "", texto: resumoMensagem(citacao.texto) } })
      : texto;
    const otimista = mensagemOtimista(usuario, payload);
    // flushSync: pinta o balão antes de qualquer await (senão parece que "carrega depois").
    flushSync(() => {
      setMessages((atual) => upsertMensagem(atual, otimista));
    });
    try {
      const enviada = await api.enviarMensagem(solicitacaoId, payload);
      setMessages((atual) => confirmarEnvio(atual, otimista.localKey, { ...enviada, pendente: false }));
    } catch (e) {
      setMessages((atual) => atual.filter((m) => m.localKey !== otimista.localKey));
      notify(e.message || "Não foi possível enviar a mensagem.");
      setDraft((atual) => atual || texto);
      setRespondendo((atual) => atual || citacao);
      if (e.status === 409) recarregarSolicitacao({ silent: true });
    }
  };

  const avisarAnexo = (mensagem) => {
    setMenuAberto(false);
    notify(mensagem);
  };

  const enviarFoto = async (file) => {
    if (!file || !solicitacaoId) return;
    setMenuAberto(false);
    setSending(true);
    try {
      const url = await comprimirImagem(file);
      const payload = JSON.stringify({ tipo: "IMAGEM", url, nome: file.name });
      const otimista = mensagemOtimista(usuario, payload);
      flushSync(() => setMessages((atual) => upsertMensagem(atual, otimista)));
      try {
        const enviada = await api.enviarMensagem(solicitacaoId, payload);
        setMessages((atual) => confirmarEnvio(atual, otimista.localKey, { ...enviada, pendente: false }));
        notify("Foto enviada.");
      } catch (e) {
        setMessages((atual) => atual.filter((m) => m.localKey !== otimista.localKey));
        throw e;
      }
    } catch (e) {
      notify(e.message || "Não foi possível enviar a foto.");
    } finally {
      setSending(false);
    }
  };

  const abrirConfirmacao = () => {
    if (!agendamento || agendamento.status === "CANCELADO") {
      go(papelAtual === "doador" ? "agendamentoDoador" : "agendamentoReceptor", params);
      return;
    }
    go(papelAtual === "doador" ? "confirmDoacao" : "confirmRecebimento", { ...params, agendamento });
  };

  const confirmarAgendamento = async () => {
    try {
      await api.confirmarAgendamento(agendamento.id);
      notify("Agendamento confirmado.");
      recarregarAgendamento();
    } catch (e) {
      notify(e.message || "Não foi possível confirmar o agendamento.");
    }
  };

  const cancelarTroca = async () => {
    if (!window.confirm("Deseja cancelar esta troca? O agendamento será cancelado e a outra pessoa será avisada.")) return;
    setCancelando(true);
    try {
      await api.cancelarSolicitacao(solicitacaoId);
      notify("Troca cancelada.");
      recarregarAgendamento();
      recarregarSolicitacao({ silent: true });
    } catch (e) {
      notify(e.message || "Não foi possível cancelar a troca.");
    } finally {
      setCancelando(false);
    }
  };

  const compartilharLocalizacao = () => {
    setMenuAberto(false);
    if (!("geolocation" in navigator)) { notify("Seu navegador não oferece localização automática."); return; }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        if (!solicitacaoId) return;
        setSending(true);
        const horario = new Date().toISOString();
        const texto = JSON.stringify({
          tipo: "LOCALIZACAO",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          horario,
        });
        const otimista = mensagemOtimista(usuario, texto);
        flushSync(() => setMessages((atual) => upsertMensagem(atual, otimista)));
        try {
          const enviada = await api.enviarMensagem(solicitacaoId, texto);
          setMessages((atual) => confirmarEnvio(atual, otimista.localKey, { ...enviada, pendente: false }));
          notify("Localização compartilhada.");
        } catch (e) {
          setMessages((atual) => atual.filter((m) => m.localKey !== otimista.localKey));
          notify(e.message || "Não foi possível compartilhar a localização.");
        } finally {
          setSending(false);
        }
      },
      () => notify("Permita o acesso à localização para compartilhar."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const itemStatus = { DOADO: "Doado", EM_NEGOCIACAO: "Em negociação", REMOVIDO: "Removido" }[item?.status] || "Disponível";
  const itemFoto = item?.fotosUrls?.[0];

  if (!solicitacaoId) {
    return (
      <div>
        <TopBar title="Chat" onBack={() => go(-1)} />
        <EmptyState Icon={MessageCircle} text="Abra uma conversa a partir de um anúncio." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <TopBar title={<div><div>{otherName || "Conversa"}</div><div style={{ fontSize: 10.5, fontWeight: 500, color: otherId && onlineIds.has(otherId) ? "#2D8A57" : INK_SOFT }}>{otherId && onlineIds.has(otherId) ? "online" : "offline"}</div></div>} onBack={() => go(-1)} right={<button type="button" onClick={() => go("inbox")} style={{ ...iconBtn, width: 30, height: 30 }} aria-label="Abrir inbox" title="Abrir inbox"><MessageCircle size={15} color="var(--role-primary-dark)" /></button>} />
      <div onClick={() => itemId && go("detalhesItem", { itemId })} style={{ margin: "0 16px 8px", padding: 8, display: "flex", alignItems: "center", gap: 8, border: "1px solid #EDEBE1", borderRadius: 12, background: "#fff", cursor: itemId ? "pointer" : "default", flexShrink: 0 }}>
        {itemFoto ? <img src={itemFoto} alt="" style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 8 }} /> : <Avatar label={otherName} size={38} />}
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item?.titulo || itemTitulo || "Item da conversa"}</div><div style={{ fontSize: 10.5, color: itemStatus === "Disponível" ? "var(--role-primary)" : "#9C4327" }}>{itemStatus}{solicitacao?.etapa ? ` · ${ETAPA_LABEL[solicitacao.etapa]}` : ""}</div></div>
        {itemId && <ChevronRight size={15} color={INK_SOFT} />}
      </div>
      {conexao !== "online" && conexao !== "conectando" && (
        <div role="status" style={{ margin: "0 16px 6px", padding: "6px 10px", borderRadius: 10, background: "#FDEFD9", color: "#9C6B14", fontSize: 11.5, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Loader2 size={12} style={{ animation: "spin .8s linear infinite" }} />
          {conexao === "reconectando" ? "Conexão perdida. Reconectando..." : "Tempo real indisponível. Tentando conectar; mensagens seguem chegando a cada 10s."}
        </div>
      )}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", padding: "6px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading && <Loading label="Carregando conversa..." />}
        {erro && <ErrorBox message={erro} onRetry={carregar} />}
        {!loading && !erro && messages.length === 0 && <EmptyState Icon={MessageCircle} text="Ainda não há mensagens. Diga oi e combine os detalhes da retirada." />}
        {messages.map((m) => {
          const mine = usuario && m.remetente?.id === usuario.id;
          const localizacao = parseLocationMessage(m.texto);
          const imagem = parseImageMessage(m.texto);
          const evento = parseTradeEvent(m.texto);
          const resposta = parseReplyMessage(m.texto);
          return (
            <MensagemResponder
              key={m.localKey || m.id}
              ativo={!evento && !encerrada}
              onResponder={() => { setRespondendo(m); inputRef.current?.focus(); }}
              style={{ alignSelf: evento || localizacao ? "center" : (mine ? "flex-end" : "flex-start"), maxWidth: evento || localizacao || imagem ? "88%" : "78%" }}
            >
              <div style={{
                background: evento || localizacao ? "transparent" : (mine ? "var(--role-primary)" : "#F1EFE6"),
                color: mine ? "#fff" : INK, padding: "9px 13px", borderRadius: 16,
                borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4,
                fontSize: 13.5, minWidth: 0,
              }}>
                {resposta && (
                  <div style={{ borderLeft: `3px solid ${mine ? "rgba(255,255,255,.7)" : "var(--role-primary)"}`, background: mine ? "rgba(255,255,255,.14)" : "#fff", borderRadius: 8, padding: "5px 8px", marginBottom: 6, fontSize: 11.5 }}>
                    <div style={{ fontWeight: 700 }}>{resposta.citacao?.autor || "Mensagem"}</div>
                    <div style={{ opacity: .85 }}>{resposta.citacao?.texto}</div>
                  </div>
                )}
                {evento ? <TradeEventMessage event={evento} /> : localizacao ? <LocationMessage {...localizacao} /> : imagem ? <ImageMessage image={imagem} /> : <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{resposta ? resposta.texto : m.texto}</div>}
                {!evento && <MessageMeta mensagem={m} mine={mine} onDark={mine && !localizacao} />}
              </div>
            </MensagemResponder>
          );
        })}
      </div>
      {encerrada && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid #EDEBE1", background: "#F1EFE6", fontSize: 12.5, color: INK_SOFT, textAlign: "center", flexShrink: 0 }}>
          {solicitacao?.etapa === "RECUSADA" ? "O anunciante recusou esta solicitação." : "Esta conversa foi cancelada."} O histórico continua disponível para consulta.
        </div>
      )}
      {respondendo && !encerrada && (
        <div style={{ padding: "8px 12px 0", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0, borderLeft: "3px solid var(--role-primary)", background: "var(--role-soft)", borderRadius: 8, padding: "5px 8px", fontSize: 11.5 }}>
            <div style={{ fontWeight: 700, color: "var(--role-primary-dark)" }}>Respondendo a {respondendo.remetente?.id === usuario?.id ? "você" : (respondendo.remetente?.nome || otherName)}</div>
            <div style={{ color: INK_SOFT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resumoMensagem(respondendo.texto)}</div>
          </div>
          <button type="button" onClick={() => setRespondendo(null)} aria-label="Cancelar resposta" style={{ border: "none", background: "none", cursor: "pointer", color: INK_SOFT }}><X size={16} /></button>
        </div>
      )}
      {menuAberto && !encerrada && <div style={{ padding: "8px 12px", display: "flex", gap: 8, borderTop: "1px solid #EDEBE1", background: "#FAFAF4", flexShrink: 0 }}>
        <input ref={fotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const file = e.target.files?.[0]; if (file) enviarFoto(file); e.target.value = ""; }} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => { const file = e.target.files?.[0]; if (file) enviarFoto(file); e.target.value = ""; }} />
        <button type="button" onClick={() => fotoRef.current?.click()} style={{ ...iconBtn, background: "var(--role-soft)" }} aria-label="Enviar foto" title="Enviar foto"><ImagePlus size={17} color="var(--role-primary-dark)" /></button>
        <button type="button" onClick={() => cameraRef.current?.click()} style={{ ...iconBtn, background: "var(--role-soft)" }} aria-label="Abrir câmera" title="Abrir câmera"><Camera size={17} color="var(--role-primary-dark)" /></button>
        <button type="button" onClick={compartilharLocalizacao} style={{ ...iconBtn, background: "var(--role-soft)" }} aria-label="Compartilhar localização" title="Compartilhar localização"><MapPin size={17} color="var(--role-primary-dark)" /></button>
      </div>}
      {!encerrada && <div style={{ padding: 12, display: "flex", gap: 8, alignItems: "center", borderTop: respondendo ? "none" : "1px solid #EDEBE1", flexShrink: 0 }}>
        <button onClick={() => setMenuAberto(aberto => !aberto)} style={{ ...iconBtn, background: menuAberto ? "var(--role-primary)" : "var(--role-soft)" }} aria-label="Mais opções" title="Mais opções"><Plus size={18} color={menuAberto ? "#fff" : "var(--role-primary-dark)"} /></button>
        <button onClick={() => go(papelAtual === "doador" ? "agendamentoDoador" : "agendamentoReceptor", params)} style={{ ...iconBtn, background: "var(--role-soft)" }}><Calendar size={17} color="var(--role-primary-dark)" /></button>
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          onBlur={() => {
            window.setTimeout(() => {
              window.scrollTo(0, 0);
              const height = Math.round(window.visualViewport?.height || window.innerHeight);
              document.documentElement.style.setProperty("--app-height", `${height}px`);
            }, 80);
          }}
          placeholder="Escreva uma mensagem..."
          style={{ ...fieldInput, flex: 1, border: "1px solid #E9E7DC", borderRadius: 20, padding: "10px 14px" }}
        />
        <button onClick={send} disabled={!draft.trim()} aria-label="Enviar mensagem" style={{ ...iconBtn, background: "var(--role-primary)", opacity: draft.trim() ? 1 : 0.55 }}><Send size={16} color="#fff" /></button>
      </div>}
      {!encerrada && <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
        <Button full variant="soft" icon={agendamento?.status !== "CONFIRMADO" ? Calendar : (papelAtual === "receptor" && !agendamento.confirmacaoAgendamentoReceptorEm ? CheckCircle2 : QrCode)} disabled={agendamento?.status === "CANCELADO" || agendamento?.status === "CONCLUIDO" || (papelAtual === "doador" && !agendamento?.confirmacaoAgendamentoReceptorEm)} onClick={papelAtual === "receptor" && agendamento?.status === "CONFIRMADO" && !agendamento.confirmacaoAgendamentoReceptorEm ? confirmarAgendamento : abrirConfirmacao}>
          {agendamento?.status === "CONFIRMADO" ? (papelAtual === "receptor" && !agendamento.confirmacaoAgendamentoReceptorEm ? "Confirmar agendamento" : papelAtual === "doador" ? "Gerar código" : "Digitar código") : agendamento?.status === "CANCELADO" ? "Troca cancelada" : agendamento?.status === "CONCLUIDO" ? "Troca concluída" : "Combinar retirada"}
        </Button>
        {agendamento && !["CANCELADO", "CONCLUIDO"].includes(agendamento.status) && solicitacao?.etapa !== "CONCLUIDA" && (
          <Button full variant="ghost" icon={X} loading={cancelando} onClick={cancelarTroca}>Cancelar troca</Button>
        )}
      </div>}
    </div>
  );
}

/* ---- AGENDAMENTO ---- */
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

/* ---- CONFIRMAÇÃO (compartilhada — doador mostra o código, receptor digita) ---- */
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

/* ---- AVALIAÇÃO (compartilhado) ---- */
const CATEGORIAS_AVALIACAO = [
  { key: "pontualidade", label: "Pontualidade" },
  { key: "comunicacao", label: "Comunicação" },
  { key: "estadoItem", label: "Item conforme anunciado" },
];

function EstrelasInput({ value, onChange, size = 30, label }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} role="radio" aria-checked={i === value} aria-label={`${i} estrela(s)`} size={size} onClick={() => onChange(i)} fill={i <= value ? GOLD : "none"} color={i <= value ? GOLD : "#D6D6D0"} style={{ cursor: "pointer" }} />
      ))}
    </div>
  );
}

function Avaliar({ go, notify, params }) {
  const { quem, avaliadoId, agendamentoId, next } = params || {};
  const [nota, setNota] = useState(5);
  const [categorias, setCategorias] = useState({ pontualidade: 5, comunicacao: 5, estadoItem: 5 });
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: jaAvaliada, loading: verificando } = useApiData(() => api.jaAvaliei(agendamentoId), [agendamentoId], { skip: !agendamentoId });

  const enviar = async () => {
    if (!agendamentoId || !avaliadoId) { go(next || "homeDoador"); return; }
    setLoading(true);
    try {
      await api.avaliar(agendamentoId, avaliadoId, nota, comentario.trim(), categorias);
      notify("Avaliação enviada — obrigado! A reputação foi atualizada.");
      go(next || "homeDoador");
    } catch (e) {
      notify(e.message || "Não foi possível enviar a avaliação.");
    } finally {
      setLoading(false);
    }
  };

  if (verificando) return <div><TopBar title="Avaliação" onBack={() => go(-1)} /><Loading /></div>;
  if (jaAvaliada) {
    return (
      <div>
        <TopBar title="Avaliação" onBack={() => go(-1)} />
        <div style={{ padding: "30px 24px", textAlign: "center" }}>
          <CheckCircle2 size={40} color="var(--role-primary)" />
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: INK, marginTop: 12 }}>Você já avaliou esta troca</div>
          <div style={{ fontSize: 13, color: INK_SOFT, marginTop: 6 }}>Sua nota foi {jaAvaliada.nota} estrela(s). Cada troca pode ser avaliada uma única vez.</div>
          <Button full style={{ marginTop: 20 }} onClick={() => go(next || "homeDoador")}>Continuar</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Avaliação" onBack={() => go(-1)} />
      <div style={{ padding: "24px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <Avatar label={quem || "Usuário"} size={64} tone="var(--role-primary)" />
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: INK, marginTop: 14 }}>Como foi com {quem || "essa pessoa"}?</div>
      <div style={{ margin: "14px 0 6px" }}><EstrelasInput value={nota} onChange={setNota} label="Nota geral" /></div>
      <div style={{ fontSize: 11.5, color: INK_SOFT }}>Nota geral</div>
      <div style={{ width: "100%", background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 12, marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {CATEGORIAS_AVALIACAO.map(c => (
          <div key={c.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: INK, textAlign: "left" }}>{c.label}</span>
            <EstrelasInput value={categorias[c.key]} onChange={v => setCategorias(x => ({ ...x, [c.key]: v }))} size={20} label={c.label} />
          </div>
        ))}
      </div>
      <div style={{ ...fieldBox, width: "100%", alignItems: "flex-start", marginTop: 12 }}>
        <textarea rows={3} maxLength={400} value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Deixe um comentário (opcional)" style={{ ...fieldInput, resize: "none" }} />
      </div>
      <div style={{ marginTop: 20, width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        <Button full loading={loading} onClick={enviar}>Enviar avaliação</Button>
        <Button full variant="ghost" onClick={() => go(next || "homeDoador")}>Avaliar depois</Button>
      </div>
      </div>
    </div>
  );
}

/* ---- DASHBOARD DE IMPACTO ---- */
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

export { Inbox, Chat, Agendamento, ConfirmDoacao, ConfirmRecebimento, Avaliar, DashboardImpacto };

/* ---- HOME RECEPTOR ---- */
