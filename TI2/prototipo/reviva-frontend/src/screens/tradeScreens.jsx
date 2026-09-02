import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api, getToken, setToken, ApiError, wsUrl } from "../api.js";
import { Client as StompClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Home, Plus, Search, MapPin, User, Bell, Heart, MessageCircle, Star, QrCode, Users, Settings, ChevronLeft, Camera, Send, Award, Leaf, AlertTriangle, ChevronRight, Recycle, Gift, Share2, Flag, Shirt, BookOpen, Sofa, Baby, Zap, UtensilsCrossed, Calendar, Clock, LogIn, Mail, Lock, Sparkles, ShieldCheck, ArrowLeftRight, ImagePlus, LogOut, Loader2, UserPlus, Trash2, Pencil, CheckCircle2, Archive, RotateCcw, X } from "lucide-react";
import { ROLE_COLORS, GOLD, INK, INK_SOFT, CATS, ESTADOS, CO2_ESTIMADO, BADGES, MOTIVOS_DENUNCIA, NOTIF_ICONS, COMMUNITY_POSTS, capitalize, timeAgo, fmtDateTime, badgeIndex, onlyDigits, distanciaKm, formatCpf, formatCep, cpfValido, comprimirImagem, useApiData, Button, Chip, Avatar, Stars, SectionTitle, ImpactRing, ItemCard, Toast, Loading, ErrorBox, StatusBar, TopBar, BottomNav, Screen, iconBtn, linkText, fieldLabel, fieldBox, fieldInput, EmptyState, StatBox } from "./shared.jsx";

const dataAtual = new Date();
const doisDigitos = valor => String(valor).padStart(2, "0");
const dataLocalAtual = `${dataAtual.getFullYear()}-${doisDigitos(dataAtual.getMonth() + 1)}-${doisDigitos(dataAtual.getDate())}`;
const horaLocalAtual = `${doisDigitos(dataAtual.getHours())}:${doisDigitos(dataAtual.getMinutes())}`;

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

function Inbox({ go, usuario }) {
  const { loading, error, data: conversas, reload } = useApiData(() => api.conversas(), [usuario?.id]);
  const [arquivadas, setArquivadas] = useState(() => JSON.parse(localStorage.getItem("reviva_inbox_arquivadas") || "[]"));
  const [deslocamento, setDeslocamento] = useState({});
  const inicioToque = useRef({});
  const visiveis = (conversas || []).filter(s => !arquivadas.includes(s.id));

  const arquivar = (id) => {
    const novas = [...arquivadas, id];
    setArquivadas(novas);
    localStorage.setItem("reviva_inbox_arquivadas", JSON.stringify(novas));
  };
  const tocar = (id, event) => { inicioToque.current[id] = event.touches[0].clientX; };
  const soltar = (id, event) => {
    const distancia = event.changedTouches[0].clientX - (inicioToque.current[id] || 0);
    setDeslocamento(atual => ({ ...atual, [id]: 0 }));
    if (distancia < -70) arquivar(id);
  };

  return (
    <div>
      <TopBar title="Inbox" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        {loading && <Loading label="Carregando conversas..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && visiveis.length === 0 && <EmptyState Icon={MessageCircle} text="Nenhuma conversa por aqui." />}
        {visiveis.map(s => {
          const naoLidas = s.mensagensNaoLidas || s.unreadCount || 0;
          const souDoador = s.item?.doador?.id === usuario?.id;
          const outroNome = souDoador ? s.receptor?.nome : s.item?.doador?.nome;
          return <div key={s.id} onTouchStart={event => tocar(s.id, event)} onTouchEnd={event => soltar(s.id, event)} onClick={() => go(souDoador ? "chatDoador" : "chatReceptor", { solicitacaoId: s.id, otherName: outroNome, itemTitulo: s.item?.titulo, itemId: s.item?.id })} style={{ transform: `translateX(${deslocamento[s.id] || 0}px)`, transition: "transform .2s", display: "flex", alignItems: "center", gap: 10, padding: 12, marginBottom: 8, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 14, cursor: "pointer" }}>
            <Avatar label={outroNome} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{outroNome || "Conversa"}</div><div style={{ fontSize: 11.5, color: INK_SOFT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.item?.titulo || "Conversa"}</div></div>
            {naoLidas > 0 && <span style={{ minWidth: 20, height: 20, borderRadius: 10, padding: "0 6px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--role-primary)", color: "#fff", fontSize: 10, fontWeight: 700 }}>{naoLidas}</span>}
          </div>;
        })}
      </div>
    </div>
  );
}

function Chat({ go, role, notify, params, usuario }) {
  const { solicitacaoId, otherName, itemTitulo, itemId } = params || {};
  const { data: item } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sending, setSending] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const scrollRef = useRef(null);
  const fotoRef = useRef(null);
  const cameraRef = useRef(null);

  const carregar = useCallback(async () => {
    if (!solicitacaoId) return;
    try {
      const data = await api.listarMensagens(solicitacaoId);
      setMessages(data);
      setErro("");
    } catch (e) {
      setErro(e.message || "Não foi possível carregar as mensagens.");
    } finally {
      setLoading(false);
    }
  }, [solicitacaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Chat em tempo real: assina o tópico desta conversa via STOMP/WebSocket.
  // Substitui o polling — a mensagem chega assim que o outro lado envia,
  // sem esperar um intervalo nem recarregar a tela.
  useEffect(() => {
    if (!solicitacaoId) return;

    const client = new StompClient({
      webSocketFactory: () => new SockJS(`${wsUrl()}?token=${encodeURIComponent(getToken() || "")}`),
      reconnectDelay: 4000,
      onConnect: () => {
        client.subscribe(`/topic/solicitacoes/${solicitacaoId}`, (frame) => {
          const nova = JSON.parse(frame.body);
          setMessages((atual) => {
            if (atual.some((m) => m.id === nova.id)) return atual; // evita duplicar
            return [...atual, nova];
          });
        });
      },
    });
    client.activate();

    return () => client.deactivate();
  }, [solicitacaoId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!draft.trim() || !solicitacaoId) return;
    setSending(true);
    const texto = draft;
    setDraft("");
    try {
      await api.enviarMensagem(solicitacaoId, texto);
      carregar();
    } catch (e) {
      notify(e.message || "Não foi possível enviar a mensagem.");
      setDraft(texto);
    } finally {
      setSending(false);
    }
  };

  const avisarAnexo = (mensagem) => {
    setMenuAberto(false);
    notify(mensagem);
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
        try {
          await api.enviarMensagem(solicitacaoId, texto);
          await carregar();
          notify("Localização compartilhada.");
        } catch (e) {
          notify(e.message || "Não foi possível compartilhar a localização.");
        } finally {
          setSending(false);
        }
      },
      () => notify("Permita o acesso à localização para compartilhar."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const itemStatus = item?.status === "DOADO" ? "Doado" : "Disponível";
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={otherName || "Conversa"} onBack={() => go(-1)} right={<button type="button" onClick={() => go("inbox")} style={{ ...iconBtn, width: 30, height: 30 }} aria-label="Abrir inbox" title="Abrir inbox"><MessageCircle size={15} color="var(--role-primary-dark)" /></button>} />
      <div onClick={() => itemId && go("detalhesItem", { itemId })} style={{ margin: "0 16px 8px", padding: 8, display: "flex", alignItems: "center", gap: 8, border: "1px solid #EDEBE1", borderRadius: 12, background: "#fff", cursor: itemId ? "pointer" : "default" }}>
        {itemFoto ? <img src={itemFoto} alt="" style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 8 }} /> : <Avatar label={otherName} size={38} />}
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item?.titulo || itemTitulo || "Item da conversa"}</div><div style={{ fontSize: 10.5, color: itemStatus === "Doado" ? "#9C4327" : "var(--role-primary)" }}>{itemStatus}</div></div>
        {itemId && <ChevronRight size={15} color={INK_SOFT} />}
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "6px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading && <Loading label="Carregando conversa..." />}
        {erro && <ErrorBox message={erro} onRetry={carregar} />}
        {!loading && messages.length === 0 && <EmptyState Icon={MessageCircle} text="Ainda não há mensagens. Diga oi 👋" />}
        {messages.map((m) => {
          const mine = usuario && m.remetente?.id === usuario.id;
          const localizacao = parseLocationMessage(m.texto);
          return (
            <div key={m.id} style={{
              alignSelf: mine ? "flex-end" : "flex-start",
              background: localizacao ? "transparent" : (mine ? "var(--role-primary)" : "#F1EFE6"),
              color: mine ? "#fff" : INK, padding: "9px 13px", borderRadius: 16,
              borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4,
              fontSize: 13.5, maxWidth: localizacao ? "88%" : "78%",
            }}>
              {localizacao ? <LocationMessage {...localizacao} /> : <div>{m.texto}</div>}
              {mine && <div style={{ fontSize: 10, marginTop: 3, textAlign: "right", color: m.lida ? "#9BE7FF" : "rgba(255,255,255,.72)" }} aria-label={m.lida ? "Lido" : m.entregue ? "Entregue" : "Enviado"}>
                {m.lida ? "✅✅" : m.entregue ? "✅✅" : "✅"}
              </div>}
            </div>
          );
        })}
      </div>
      {menuAberto && <div style={{ padding: "8px 12px", display: "flex", gap: 8, borderTop: "1px solid #EDEBE1", background: "#FAFAF4" }}>
        <input ref={fotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) avisarAnexo(`Foto selecionada: ${e.target.files[0].name}.`); e.target.value = ""; }} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) avisarAnexo("Foto capturada pela câmera."); e.target.value = ""; }} />
        <button type="button" onClick={() => fotoRef.current?.click()} style={{ ...iconBtn, background: "var(--role-soft)" }} aria-label="Enviar foto" title="Enviar foto"><ImagePlus size={17} color="var(--role-primary-dark)" /></button>
        <button type="button" onClick={() => cameraRef.current?.click()} style={{ ...iconBtn, background: "var(--role-soft)" }} aria-label="Abrir câmera" title="Abrir câmera"><Camera size={17} color="var(--role-primary-dark)" /></button>
        <button type="button" onClick={compartilharLocalizacao} style={{ ...iconBtn, background: "var(--role-soft)" }} aria-label="Compartilhar localização" title="Compartilhar localização"><MapPin size={17} color="var(--role-primary-dark)" /></button>
      </div>}
      <div style={{ padding: 12, display: "flex", gap: 8, alignItems: "center", borderTop: "1px solid #EDEBE1" }}>
        <button onClick={() => setMenuAberto(aberto => !aberto)} style={{ ...iconBtn, background: menuAberto ? "var(--role-primary)" : "var(--role-soft)" }} aria-label="Mais opções" title="Mais opções"><Plus size={18} color={menuAberto ? "#fff" : "var(--role-primary-dark)"} /></button>
        <button onClick={() => go(role === "doador" ? "agendamentoDoador" : "agendamentoReceptor", params)} style={{ ...iconBtn, background: "var(--role-soft)" }}><Calendar size={17} color="var(--role-primary-dark)" /></button>
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Escreva uma mensagem..." style={{ ...fieldInput, flex: 1, border: "1px solid #E9E7DC", borderRadius: 20, padding: "10px 14px" }} />
        <button onClick={send} disabled={sending} style={{ ...iconBtn, background: "var(--role-primary)" }}><Send size={16} color="#fff" /></button>
      </div>
      <div style={{ padding: "0 16px 14px" }}>
        <Button full variant="soft" icon={Calendar} onClick={() => go(role === "doador" ? "agendamentoDoador" : "agendamentoReceptor", params)}>Combinar retirada</Button>
      </div>
    </div>
  );
}

/* ---- AGENDAMENTO ---- */
function Agendamento({ go, role, notify, params }) {
  const { solicitacaoId, otherName, itemTitulo } = params || {};
  const [data, setData] = useState(dataLocalAtual);
  const [hora, setHora] = useState(horaLocalAtual);
  const [local, setLocal] = useState("Portaria do Ed. Alameda, Funcionários");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const confirmar = async () => {
    if (!solicitacaoId) { setErro("Solicitação não identificada — volte pelo chat."); return; }
    if (!data) { setErro("Escolha uma data."); return; }
    setErro("");
    setLoading(true);
    try {
      const iso = new Date(`${data}T${hora || "10:00"}:00`).toISOString();
      const agendamento = await api.agendar(solicitacaoId, iso, local);
      notify(`Retirada agendada para ${fmtDateTime(iso)}`);
      go(role === "doador" ? "confirmDoacao" : "confirmRecebimento", { agendamento, otherName, itemTitulo });
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
        <div style={fieldBox}><MapPin size={16} color={INK_SOFT} /><input value={local} onChange={e => setLocal(e.target.value)} style={fieldInput} /></div>
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
  if (!agendamento) return <div><TopBar title="Confirmação" onBack={() => go(-1)} /><EmptyState Icon={QrCode} text="Nenhum agendamento em andamento." /></div>;

  const token = agendamento.solicitacao?.item?.qrCodeToken;

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
      {token && (
        <div style={{ marginTop: 16, background: "#F1EFE6", borderRadius: 12, padding: "12px 18px", fontFamily: "monospace", fontSize: 12, color: INK, wordBreak: "break-all" }}>{token}</div>
      )}
      <div style={{ marginTop: 26, width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <Button full loading={loading} onClick={confirmar}>Confirmar retirada manualmente</Button>
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
function Avaliar({ go, notify, params }) {
  const { quem, avaliadoId, agendamentoId, next } = params || {};
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const enviar = async () => {
    if (!agendamentoId || !avaliadoId) { go(next || "homeDoador"); return; }
    setLoading(true);
    try {
      await api.avaliar(agendamentoId, avaliadoId, nota, comentario);
      notify("Avaliação enviada — obrigado!");
      go(next || "homeDoador");
    } catch (e) {
      notify(e.message || "Não foi possível enviar a avaliação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar title="Avaliação" onBack={() => go(-1)} />
      <div style={{ height: "100%", padding: "30px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <Avatar label={quem || "Usuário"} size={64} tone="var(--role-primary)" />
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: INK, marginTop: 14 }}>Como foi com {quem || "essa pessoa"}?</div>
      <div style={{ display: "flex", gap: 6, margin: "16px 0" }}>
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={30} onClick={() => setNota(i)} fill={i <= nota ? GOLD : "none"} color={i <= nota ? GOLD : "#D6D6D0"} style={{ cursor: "pointer" }} />
        ))}
      </div>
      <div style={{ ...fieldBox, width: "100%", alignItems: "flex-start" }}>
        <textarea rows={3} value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Deixe um comentário (opcional)" style={{ ...fieldInput, resize: "none" }} />
      </div>
      <div style={{ marginTop: 20, width: "100%" }}>
        <Button full loading={loading} onClick={enviar}>Enviar avaliação</Button>
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
  return (
    <div>
      <TopBar title="Meu impacto" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 18, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 20, padding: 18 }}>
          <ImpactRing pct={Math.min(1, kg / 100)} size={110} value={`${kg.toFixed(1)} kg`} label="material reutilizado" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
          <StatBox value={itens} label="itens doados" Icon={Gift} />
          <StatBox value={pontos} label="pontos" Icon={Award} />
          <StatBox value={(usuario?.reputacaoScore || 0).toFixed(1)} label="nota média" Icon={Star} />
        </div>
        <SectionTitle>Selo de impacto</SectionTitle>
        <div style={{ background: "var(--role-soft)", borderRadius: 14, padding: 12, fontSize: 12, lineHeight: 1.5, color: "var(--role-primary-dark)" }}>
          Cada quilo representa material que ganhou uma nova vida em vez de ser descartado. Essa métrica acompanha a ODS 12, de consumo e produção responsáveis.
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
          {BADGES.map((b, i) => (
            <div key={b.tier} style={{ minWidth: 78, textAlign: "center", opacity: i <= idx ? 1 : 0.4 }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: b.color + "22", border: `2px solid ${b.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                <Award size={22} color={b.color} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: INK, marginTop: 6 }}>{b.label}</div>
            </div>
          ))}
        </div>
        {proximo && (
          <div style={{ background: "var(--role-soft)", borderRadius: 14, padding: 12, marginTop: 10, fontSize: 11.5, color: "var(--role-primary-dark)" }}>
            Faltam <b>{Math.max(0, proximo.min - pontos)} pontos</b> para você alcançar o selo {proximo.label} 🏅
          </div>
        )}
      </div>
    </div>
  );
}

export { Inbox, Chat, Agendamento, ConfirmDoacao, ConfirmRecebimento, Avaliar, DashboardImpacto };

/* ---- HOME RECEPTOR ---- */
