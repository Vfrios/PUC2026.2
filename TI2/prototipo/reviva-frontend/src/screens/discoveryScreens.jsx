import React, { useState, useEffect, useRef, useCallback } from "react";
import { api, getToken, setToken, ApiError, wsUrl } from "../api.js";
import { Client as StompClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ListaItens } from "./itemScreens.jsx";
import { Home, Plus, Search, MapPin, User, Bell, Heart, MessageCircle, Star, QrCode, Users, Settings, ChevronLeft, Camera, Send, Award, Leaf, AlertTriangle, ChevronRight, Recycle, Gift, Share2, Flag, Shirt, BookOpen, Sofa, Baby, Zap, UtensilsCrossed, Calendar, Clock, LogIn, Mail, Lock, Sparkles, ShieldCheck, ArrowLeftRight, ImagePlus, LogOut, Loader2, UserPlus, Trash2, Pencil, CheckCircle2, Archive, RotateCcw, X } from "lucide-react";
import { ROLE_COLORS, GOLD, INK, INK_SOFT, CATS, ESTADOS, CO2_ESTIMADO, BADGES, MOTIVOS_DENUNCIA, NOTIF_ICONS, COMMUNITY_POSTS, capitalize, timeAgo, fmtDateTime, badgeIndex, onlyDigits, distanciaKm, formatCpf, formatCep, cpfValido, comprimirImagem, useApiData, Button, Chip, Avatar, Stars, SectionTitle, ImpactRing, ItemCard, Toast, Loading, ErrorBox, StatusBar, TopBar, BottomNav, Screen, iconBtn, linkText, fieldLabel, fieldBox, fieldInput, EmptyState, StatBox } from "./shared.jsx";

function LocationSheet({ onClose, onSelect, notify }) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const historico = JSON.parse(localStorage.getItem("reviva_localizacoes") || "[]");
  const selecionar = local => { localStorage.setItem("reviva_localizacao_atual", local); onSelect(local); onClose(); };
  const buscarCep = async () => {
    const valor = onlyDigits(cep);
    if (valor.length !== 8) { notify("Digite um CEP válido."); return; }
    setLoading(true);
    try {
      const res = await api.buscarCep(valor);
      const local = [res.bairro, res.cidade, res.uf].filter(Boolean).join(" · ");
      const novos = [local, ...historico.filter(item => item !== local)].slice(0, 5);
      localStorage.setItem("reviva_localizacoes", JSON.stringify(novos));
      selecionar(local);
    } catch (e) { notify(e.message || "Não foi possível localizar o CEP."); }
    finally { setLoading(false); }
  };
  const usarGps = () => {
    if (!("geolocation" in navigator)) { notify("Seu navegador não oferece localização automática."); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      try { const res = await api.reverseGeo(pos.coords.latitude, pos.coords.longitude); selecionar([res.bairro, res.cidade, res.uf].filter(Boolean).join(" · ") || "Localização atual"); }
      catch (e) { notify(e.message || "Não foi possível detectar sua localização."); }
      finally { setLoading(false); }
    }, () => { setLoading(false); notify("Permita o acesso à localização para continuar."); });
  };
  return <div style={{ position: "absolute", inset: 0, zIndex: 40, background: "rgba(22,40,31,.32)", display: "flex", alignItems: "flex-end" }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: "#fff", borderRadius: "22px 22px 0 0", padding: "18px 20px 24px", boxShadow: "0 -8px 24px rgba(0,0,0,.16)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><SectionTitle>Onde você está?</SectionTitle><button type="button" onClick={onClose} style={iconBtn} aria-label="Fechar localização"><X size={17} /></button></div>
      <div style={{ ...fieldBox, marginTop: 4 }}><MapPin size={16} color={INK_SOFT} /><input value={cep} onChange={e => setCep(e.target.value)} placeholder="Digite seu CEP" inputMode="numeric" style={fieldInput} /><Button small loading={loading} onClick={buscarCep}>Buscar</Button></div>
      <button type="button" onClick={usarGps} style={{ border: "none", background: "none", padding: "14px 0", color: "var(--role-primary)", fontWeight: 700, cursor: "pointer" }}><MapPin size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} /> Usar minha localização atual</button>
      {historico.length > 0 && <><div style={{ fontSize: 11, fontWeight: 700, color: INK_SOFT, marginBottom: 6 }}>Bairros recentes</div>{historico.map(local => <button type="button" key={local} onClick={() => selecionar(local)} style={{ display: "block", width: "100%", textAlign: "left", border: "none", borderTop: "1px solid #EDEBE1", background: "#fff", padding: "10px 0", color: INK, cursor: "pointer" }}>{local}</button>)}</>}
    </div>
  </div>;
}

function usePullRefresh(reload, notify) {
  const [pull, setPull] = useState(0);
  const start = useRef(0);
  return { pull, onTouchStart: e => { if (e.currentTarget.parentElement?.parentElement?.scrollTop === 0) start.current = e.touches[0].clientY; }, onTouchMove: e => { if (start.current) setPull(Math.min(64, Math.max(0, e.touches[0].clientY - start.current))); }, onTouchEnd: () => { if (pull > 48) { reload(); notify("Atualizando conteúdo..."); } start.current = 0; setPull(0); } };
}
function HomeDoador({ go, usuario, compact, notify }) {
  const { loading, data: recebidas, reload } = useApiData(() => api.solicitacoesRecebidas(), [usuario?.id]);
  const { data: notificacoes } = useApiData(() => api.notificacoes(), [usuario?.id]);
  const [localizacao, setLocalizacao] = useState(() => localStorage.getItem("reviva_localizacao_atual") || "Perto de você");
  const [locationOpen, setLocationOpen] = useState(false);
  const pullProps = usePullRefresh(reload, notify);
  const destaque = (recebidas || [])[0];
  const pct = Math.min(1, (usuario?.kgResiduoEvitado || 0) / 100);

  return (
    <Screen>
      <div {...pullProps} style={{ position: "relative" }}>
      {pullProps.pull > 0 && <div style={{ height: pullProps.pull, textAlign: "center", fontSize: 11, color: INK_SOFT, paddingTop: 8 }}>Solte para atualizar</div>}
      <TopBar title={localizacao} compact={compact} right={<button type="button" onClick={() => setLocationOpen(true)} style={iconBtn} aria-label="Alterar localização"><MapPin size={16} color="var(--role-primary-dark)" /></button>} />
      <div style={{ padding: "4px 20px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12.5, color: INK_SOFT }}>Olá,</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: INK }}>{usuario?.nome?.split(" ")[0] || "Você"} 👋</div>
        </div>
        <button onClick={() => go("notificacoes")} style={{ ...iconBtn, position: "relative" }}><Bell size={18} color={INK} />{(notificacoes || []).filter(n => !n.lida).length > 0 && <span style={{ position: "absolute", top: -3, right: -3, minWidth: 15, height: 15, borderRadius: 8, background: "#D44D3B", color: "#fff", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>{(notificacoes || []).filter(n => !n.lida).length}</span>}</button>
      </div>
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ background: "linear-gradient(135deg,var(--role-primary),var(--role-primary-dark))", borderRadius: 22, padding: 18, color: "#fff", display: "flex", alignItems: "center", gap: 14 }}>
          <ImpactRing pct={pct} size={72} label="kg evitados" value={Math.round(usuario?.kgResiduoEvitado || 0)} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, opacity: .85 }}>Seu impacto até agora</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>{usuario?.itensDoados || 0} itens doados</div>
            <div onClick={() => go("dashboardImpacto")} style={{ marginTop: 6, fontSize: 12, fontWeight: 700, textDecoration: "underline", cursor: "pointer" }}>Ver painel completo →</div>
          </div>
        </div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <SectionTitle>Atalhos</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Cadastrar item", Icon: Plus, key: "cadastroItem" },
            { label: "Gerenciar itens", Icon: Gift, key: "gerenciarItens" },
            { label: "Mensagens", Icon: MessageCircle, key: "inbox" },
            { label: "Comunidades", Icon: Users, key: "comunidades" },
            { label: "Configurações", Icon: Settings, key: "perfil" },
          ].map(a => (
            <div key={a.key} onClick={() => go(a.key)} style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 8, cursor: "pointer" }}>
              <a.Icon size={19} color="var(--role-primary)" />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <SectionTitle right={<span onClick={() => go("gerenciarItens")} style={linkText}>ver tudo</span>}>Solicitações recentes</SectionTitle>
        {loading ? <Loading label="Buscando solicitações..." /> : destaque ? (
          <div onClick={() => go("gerenciarItens")} style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 12, display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
            <Avatar label={destaque.receptor?.nome} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: INK }}>{destaque.receptor?.nome} enviou uma mensagem sobre "{destaque.item?.titulo}"</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT }}>Abrir conversa · {timeAgo(destaque.criadaEm)}</div>
            </div>
            <ChevronRight size={16} color={INK_SOFT} />
          </div>
        ) : (
          <EmptyState Icon={Gift} text="Nenhuma solicitação pendente ainda. Publique um item para começar a receber pedidos." />
        )}
      {locationOpen && <LocationSheet onClose={() => setLocationOpen(false)} onSelect={setLocalizacao} notify={notify} />}
      </div>
      </div>
    </Screen>
  );
}

function HomeReceptor({ go, favorites, toggleFav, usuario, onlineIds, compact, notify }) {
  const { loading, error, data: itens, reload } = useApiData(() => api.listarItens(), []);
  const { data: notificacoes } = useApiData(() => api.notificacoes(), [usuario?.id]);
  const [localizacao, setLocalizacao] = useState(() => localStorage.getItem("reviva_localizacao_atual") || "Perto de você");
  const [locationOpen, setLocationOpen] = useState(false);
  const [quickItem, setQuickItem] = useState(null);
  const pullProps = usePullRefresh(reload, notify);
  const quickTimer = useRef(null);
  return (
    <Screen>
      <div {...pullProps} style={{ position: "relative" }}>
      {pullProps.pull > 0 && <div style={{ height: pullProps.pull, textAlign: "center", fontSize: 11, color: INK_SOFT, paddingTop: 8 }}>Solte para atualizar</div>}
      <TopBar title={localizacao} compact={compact} right={<button type="button" onClick={() => setLocationOpen(true)} style={iconBtn} aria-label="Alterar localização"><MapPin size={16} color="var(--role-primary-dark)" /></button>} />
      <div style={{ padding: "4px 20px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12.5, color: INK_SOFT }}>Perto de você</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: INK }}>Encontre um item 🔎</div>
        </div>
        <button onClick={() => go("notificacoes")} style={{ ...iconBtn, position: "relative" }}><Bell size={18} color={INK} />{(notificacoes || []).filter(n => !n.lida).length > 0 && <span style={{ position: "absolute", top: -3, right: -3, minWidth: 15, height: 15, borderRadius: 8, background: "#D44D3B", color: "#fff", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>{(notificacoes || []).filter(n => !n.lida).length}</span>}</button>
      </div>
      <div style={{ padding: "12px 20px 0" }} onClick={() => go("busca")}>
        <div style={{ background: "#fff", border: "1.5px solid #EDEBE1", borderRadius: 16, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", color: INK_SOFT }}>
          <Search size={17} /> Buscar roupas, livros, móveis...
        </div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <SectionTitle>Categorias</SectionTitle>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {Object.entries(CATS).map(([k, v]) => (
            <div key={k} onClick={() => go("listaItens", { categoria: k })} style={{ minWidth: 68, textAlign: "center", cursor: "pointer" }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                <v.Icon size={21} color="var(--role-primary-dark)" />
              </div>
              <div style={{ fontSize: 10.5, marginTop: 5, color: INK, fontWeight: 600 }}>{v.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <SectionTitle right={<span style={linkText} onClick={() => go("listaItens")}>ver tudo</span>}>Publicados recentemente</SectionTitle>
        {loading && <Loading label="Buscando itens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {(itens || []).slice(0, 4).map(it => (
            <div key={it.id} onContextMenu={e => { e.preventDefault(); setQuickItem(it); }} onTouchStart={() => { quickTimer.current = setTimeout(() => setQuickItem(it), 550); }} onTouchEnd={() => clearTimeout(quickTimer.current)}><ItemCard item={it} usuario={usuario} onlineIds={onlineIds} favorite={!!favorites[it.id]} onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: it.id })} /></div>
          ))}
          {!loading && !error && (itens || []).length === 0 && <EmptyState Icon={Search} text="Nenhum item publicado ainda." />}
        </div>
      </div>
      {locationOpen && <LocationSheet onClose={() => setLocationOpen(false)} onSelect={setLocalizacao} notify={notify} />}
      {quickItem && <div onClick={() => setQuickItem(null)} style={{ position: "absolute", inset: 0, zIndex: 35, background: "rgba(22,40,31,.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 18, width: "100%" }}><SectionTitle>Visualização rápida</SectionTitle><div style={{ fontWeight: 700, color: INK }}>{quickItem.titulo}</div><div style={{ fontSize: 12, color: INK_SOFT, marginTop: 5 }}>{quickItem.descricao || "Sem descrição"}</div><Button full style={{ marginTop: 14 }} onClick={() => go("detalhesItem", { itemId: quickItem.id })}>Ver item</Button></div></div>}
      </div>
    </Screen>
  );
}

/* ---- BUSCA ---- */
function Busca({ go, favorites, toggleFav, usuario, onlineIds }) {
  const [q, setQ] = useState("");
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [localizando, setLocalizando] = useState(false);
  const [localizacaoAuto, setLocalizacaoAuto] = useState(false);
  const [localizacaoErro, setLocalizacaoErro] = useState("");
  const qRef = useRef(q);
  const [resultado, setResultado] = useState(null);

  useEffect(() => { qRef.current = q; }, [q]);

  const { data: estados } = useApiData(() => api.listarEstados(), []);
  const { data: cidades, loading: cidadesLoading } = useApiData(
    () => (uf ? api.listarCidades(uf) : Promise.resolve([])),
    [uf]
  );

  const buscar = (ufParam = uf, cidadeParam = cidade, termoParam = q) =>
    setResultado({ termo: termoParam || undefined, uf: ufParam || undefined, cidade: cidadeParam || undefined });
  
  const detectarLocalizacao = () => {
    if (!("geolocation" in navigator)) {
      setLocalizacaoErro("Seu navegador não oferece localização automática.");
      return;
    }
    setLocalizando(true);
    setLocalizacaoErro("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await api.reverseGeo(pos.coords.latitude, pos.coords.longitude);
          if (!res?.uf) throw new Error("Não foi possível determinar sua região.");
          const cidadeAtual = res.cidade || "";
          setUf(res.uf);
          setCidade(cidadeAtual);
          setLocalizacaoAuto(true);
          buscar(res.uf, cidadeAtual, qRef.current);
        } catch (e) {
          setLocalizacaoErro(e.message || "Não foi possível detectar sua região automaticamente.");
        } finally {
          setLocalizando(false);
        }
      },
      () => { setLocalizando(false); setLocalizacaoErro("Permita o acesso à localização para buscar perto de você."); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  };

  // Detecta a localização automaticamente ao abrir a tela: pede a posição do
  // navegador (GPS/Wi-Fi), converte em cidade/UF via reverse geocoding e já
  // filtra os itens perto do usuário — sem precisar digitar ou selecionar
  // nada. Se a permissão for negada ou o GPS falhar, a busca manual segue
  // funcionando normalmente, sem travar a tela.
  useEffect(() => {
    detectarLocalizacao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <TopBar title="Buscar" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ ...fieldBox }}>
          <Search size={16} color={INK_SOFT} />
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && buscar()} placeholder="O que você está procurando?" style={fieldInput} autoFocus />
          {q && <button type="button" onClick={() => setQ("")} aria-label="Limpar busca" title="Limpar busca" style={{ border: "none", background: "none", padding: 0, color: INK_SOFT, cursor: "pointer", display: "flex" }}><X size={16} /></button>}
        </div>

        <label style={fieldLabel}>Região</label>
        {(localizando || localizacaoAuto || localizacaoErro) && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: localizacaoErro ? "#9C6B14" : "var(--role-primary-dark)", marginBottom: 6 }}>
            {localizando ? (
              <><Loader2 size={12} style={{ animation: "spin .8s linear infinite" }} /> Detectando sua localização...</>
            ) : localizacaoErro ? (
              <>{localizacaoErro}</>
            ) : null}
          </div>
        )}
        <button type="button" onClick={detectarLocalizacao} disabled={localizando} style={{ border: "none", background: "none", padding: 0, color: "var(--role-primary)", fontSize: 12, fontWeight: 700, cursor: localizando ? "wait" : "pointer" }}>
           <MapPin size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} /> {(localizando || localizacaoAuto) ? "Usando localização atual" : "Usar minha localização atual"}
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ ...fieldBox, flex: 1 }}>
            <select
              value={uf}
              onChange={e => { setUf(e.target.value); setCidade(""); setLocalizacaoAuto(false); }}
              style={{ ...fieldInput, appearance: "none", cursor: "pointer" }}
            >
              <option value="">Estado</option>
              {(estados || []).map(e => <option key={e.sigla} value={e.sigla}>{e.nome}</option>)}
            </select>
          </div>
          <div style={{ ...fieldBox, flex: 1 }}>
            <select
              value={cidade}
              onChange={e => { setCidade(e.target.value); setLocalizacaoAuto(false); }}
              disabled={!uf || cidadesLoading}
              style={{ ...fieldInput, appearance: "none", cursor: uf ? "pointer" : "not-allowed" }}
            >
              <option value="">{cidadesLoading ? "Carregando..." : "Cidade"}</option>
              {(cidades || []).map(c => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
        </div>

        <SectionTitle>Sugestões</SectionTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["Roupas","Livros","Eletrônicos","Móveis","Cozinha"].map(s => <Chip key={s} onClick={() => { setQ(s); buscar(uf, cidade, s); }}>{s}</Chip>))}
        </div>
        <div style={{ marginTop: 16 }}><Button full onClick={() => buscar()}>Buscar</Button></div>
      </div>
      {resultado && <ListaItens go={go} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} params={resultado} embedded />}
    </div>
  );
}

export { HomeDoador, HomeReceptor, Busca };
