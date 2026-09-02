import React, { useState, useEffect, useRef, useCallback } from "react";
import { api, getToken, setToken, ApiError, wsUrl } from "../api.js";
import { Client as StompClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Home, Plus, Search, MapPin, User, Bell, Heart, MessageCircle, Star, QrCode, Users, Settings, ChevronLeft, Camera, Send, Award, Leaf, AlertTriangle, ChevronRight, Recycle, Gift, Share2, Flag, Shirt, BookOpen, Sofa, Baby, Zap, UtensilsCrossed, Calendar, Clock, LogIn, Mail, Lock, Sparkles, ShieldCheck, ArrowLeftRight, ImagePlus, LogOut, Loader2, UserPlus, Trash2, Pencil, CheckCircle2, Archive, RotateCcw, X } from "lucide-react";

/* ============================================================
   REVIVA — Plataforma de Doação e Troca de Objetos
   Frontend (React) conectado de verdade ao backend Java/Spring Boot.
   ============================================================ */

/* ---------------- Design tokens ---------------- */
const ROLE_COLORS = {
  doador:   { primary: "#1F6E43", primaryDark: "#123F27", soft: "#E4EFE7", ring: "#1F6E43" },
  receptor: { primary: "#E0673F", primaryDark: "#9C4327", soft: "#FBE8E0", ring: "#E0673F" },
};
const GOLD = "#F2A93C";
const INK = "#16281F";
const INK_SOFT = "#516357";

/* ---------------- Mapeamentos com o backend ----------------
   As chaves batem com os enums Java (Item.Categoria, EstadoConservacao,
   TipoPublicacao, Usuario.SeloTier) para não precisar traduzir nada. */

const CATS = {
  ROUPAS:      { label: "Roupas",      Icon: Shirt },
  LIVROS:      { label: "Livros",      Icon: BookOpen },
  MOVEIS:      { label: "Móveis",      Icon: Sofa },
  INFANTIL:    { label: "Infantil",    Icon: Baby },
  ELETRONICOS: { label: "Eletrônicos", Icon: Zap },
  COZINHA:     { label: "Cozinha",     Icon: UtensilsCrossed },
  OUTROS:      { label: "Outros",      Icon: Gift },
};

const ESTADOS = [
  { value: "NOVO", label: "Novo" },
  { value: "SEMINOVO", label: "Seminovo" },
  { value: "USADO", label: "Usado" },
];

// Estimativa automática de kg de resíduo evitado por categoria (o protótipo
// original não tinha um jeito do usuário medir isso na hora de cadastrar).
const CO2_ESTIMADO = {
  ROUPAS: 2.5, LIVROS: 1.5, MOVEIS: 10, INFANTIL: 5,
  ELETRONICOS: 4, COZINHA: 3, OUTROS: 2,
};

// Mesmos limiares usados no backend (AgendamentoService) para o selo.
// min = pontos necessários para alcançar o selo (ver PontuacaoService no backend:
// +15 pts por doação concluída, +5 pts por recebimento confirmado, +1 a +10 pts
// por avaliação recebida conforme a nota).
const BADGES = [
  { tier: "BRONZE",    label: "Bronze",    min: 0,   color: "#B08968" },
  { tier: "PRATA",     label: "Prata",     min: 50,  color: "#9CA3AF" },
  { tier: "OURO",      label: "Ouro",      min: 150, color: "#F2A93C" },
  { tier: "ESMERALDA", label: "Esmeralda", min: 350, color: "#1F6E43" },
];

const MOTIVOS_DENUNCIA = [
  { value: "ITEM_DIVERGENTE", label: "Item não corresponde ao anunciado" },
  { value: "COMPORTAMENTO_INADEQUADO", label: "Comportamento inadequado" },
  { value: "NAO_COMPARECIMENTO", label: "Não compareceu à retirada" },
  { value: "SUSPEITA_GOLPE", label: "Suspeita de golpe" },
  { value: "OUTRO", label: "Outro" },
];

const NOTIF_ICONS = {
  CHAT: MessageCircle, MATCH: Sparkles, WISHLIST: Heart,
  LEMBRETE: Clock, AVALIACAO: Star, MODERACAO: Flag,
};

// Feed de comunidade e desafio do mês: o backend ainda não tem um modelo de
// "post" nem de "desafio" — fica como conteúdo ilustrativo (ver README).
const COMMUNITY_POSTS = [
  { id: 1, user: "ONG Reviver", text: "Mutirão de doação de agasalhos neste sábado no Parque Municipal ❄️🧥", likes: 58 },
  { id: 2, user: "Marina S.",   text: "Consegui doar 12 peças esse mês! Comunidade incrível 💚", likes: 34 },
  { id: 3, user: "Comunidade BH Solidária", text: "Ranking do mês: quem mais reaproveitou objetos na sua região", likes: 91 },
];

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0) + s.slice(1).toLowerCase();
}
function timeAgo(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} d`;
}
function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function badgeIndex(tier) {
  const i = BADGES.findIndex(b => b.tier === tier);
  return i < 0 ? 0 : i;
}

function onlyDigits(v) {
  return (v || "").replace(/\D/g, "");
}

function distanciaKm(origem, destino) {
  if (origem?.latitude == null || origem?.longitude == null || destino?.latitude == null || destino?.longitude == null) return null;
  const rad = Math.PI / 180;
  const dLat = (destino.latitude - origem.latitude) * rad;
  const dLon = (destino.longitude - origem.longitude) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(origem.latitude * rad) * Math.cos(destino.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatCpf(v) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

function formatCep(v) {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function cpfValido(valor) {
  const cpf = onlyDigits(valor);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (base) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(cpf[i]) * (base + 1 - i);
    const d = 11 - (soma % 11);
    return d >= 10 ? 0 : d;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

/**
 * Redimensiona e comprime uma imagem no navegador antes de enviar pro backend.
 * O Item guarda fotos como texto (data URL em fotosUrls, ver model/Item.java),
 * então comprimir aqui evita payloads gigantes indo pro banco.
 */
function comprimirImagem(file, maxDim = 900, qualidade = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const escala = maxDim / Math.max(width, height);
          width = Math.round(width * escala);
          height = Math.round(height * escala);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", qualidade));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ---------------- Hook genérico de fetch ---------------- */
function useApiData(fetcher, deps, { skip = false } = {}) {
  const [state, setState] = useState({ loading: !skip, error: null, data: null });
  const reloadRef = useRef(0);
  const reload = () => { reloadRef.current += 1; setState(s => ({ ...s, loading: true, error: null })); };

  useEffect(() => {
    if (skip) { setState({ loading: false, error: null, data: null }); return; }
    let alive = true;
    setState(s => ({ ...s, loading: true, error: null }));
    fetcher()
      .then(data => { if (alive) setState({ loading: false, error: null, data }); })
      .catch(err => { if (alive) setState({ loading: false, error: err.message || "Erro ao carregar", data: null }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skip, reloadRef.current]);

  return { ...state, reload };
}

/* ---------------- Small UI atoms ---------------- */

function Button({ children, onClick, variant = "primary", full, style, small, icon: Icon, disabled, loading, type = "button" }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: small ? 13 : 15,
    padding: small ? "8px 14px" : "13px 18px", borderRadius: 14, border: "none",
    cursor: disabled || loading ? "default" : "pointer", width: full ? "100%" : "auto",
    transition: "transform .15s ease, opacity .15s ease", letterSpacing: 0.1,
    opacity: disabled ? 0.55 : 1,
  };
  const variants = {
    primary:   { background: "var(--role-primary)", color: "#fff" },
    ghost:     { background: "transparent", color: "var(--role-primary)", border: "1.5px solid var(--role-primary)" },
    soft:      { background: "var(--role-soft)", color: "var(--role-primary-dark)" },
    dark:      { background: INK, color: "#fff" },
    gold:      { background: GOLD, color: "#3A2705" },
    danger:    { background: "#FBE8E0", color: "#9C4327" },
  };
  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      onMouseDown={(e) => { if (!disabled && !loading) e.currentTarget.style.transform = "scale(.97)"; }}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {loading ? <Loader2 size={small ? 14 : 16} style={{ animation: "spin .8s linear infinite" }} /> : (Icon && <Icon size={small ? 14 : 16} strokeWidth={2.3} />)}
      {children}
    </button>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 13px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap",
      border: active ? "1.5px solid var(--role-primary)" : "1.5px solid #E1E4DE",
      background: active ? "var(--role-soft)" : "#fff",
      color: active ? "var(--role-primary-dark)" : INK_SOFT, cursor: "pointer",
      fontFamily: "var(--font-ui)",
    }}>{children}</button>
  );
}

function Avatar({ label, size = 40, tone }) {
  const initials = (label || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: tone || "var(--role-soft)",
      color: tone ? "#fff" : "var(--role-primary-dark)", display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 700, fontSize: size * 0.38, fontFamily: "var(--font-ui)",
      flexShrink: 0,
    }}>{initials}</div>
  );
}

function Stars({ value = 0, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(value) ? GOLD : "none"} color={i <= Math.round(value) ? GOLD : "#D6D6D0"} />
      ))}
    </span>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 0 10px" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, margin: 0, color: INK, fontWeight: 600 }}>{children}</h3>
      {right}
    </div>
  );
}

function ImpactRing({ pct = 0, size = 84, label, value }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#EAE7DC" strokeWidth={8} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={GOLD} strokeWidth={8} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - clamped)} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.22, color: INK }}>{value}</div>
        <div style={{ fontSize: size * 0.1, color: INK_SOFT, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

function ItemCard({ item, onClick, favorite, onFav, usuario, onlineIds = new Set() }) {
  const cat = CATS[item.categoria] || CATS.OUTROS;
  const Icon = cat.Icon;
  const foto = item.fotosUrls?.[0];
  const distancia = distanciaKm(usuario, item);
  const anuncianteOnline = item.doador?.id ? onlineIds.has(item.doador.id) : false;
  const localizacao = [item.bairro, item.cidade].filter(Boolean).join(" · ");
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 18, padding: 12, display: "flex", gap: 12, cursor: "pointer",
      border: "1px solid #EDEBE1", position: "relative",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 14, background: "var(--role-soft)", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        {foto ? <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon size={26} color="var(--role-primary-dark)" strokeWidth={1.8} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: INK, fontFamily: "var(--font-ui)" }}>{item.titulo}</div>
          {onFav && (
            <Heart size={17} onClick={(e) => { e.stopPropagation(); onFav(item); }}
              style={{ animation: favorite ? "favorite-pulse .45s ease" : "none" }}
              fill={favorite ? "#E0673F" : "none"} color={favorite ? "#E0673F" : "#C7C9C1"} />
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: INK_SOFT, margin: "3px 0 4px" }}>
          <span>{item.doador?.nome || "Anunciante"}</span>
          {item.doador && <><Stars value={item.doador.reputacaoScore} size={11} /><span>{(item.doador.reputacaoScore || 0).toFixed(1)}</span></>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
            background: item.tipoPublicacao === "DOAR" ? "var(--role-soft)" : "#FBE8E0",
            color: item.tipoPublicacao === "DOAR" ? "var(--role-primary-dark)" : "#9C4327",
          }}>{item.tipoPublicacao === "DOAR" ? "DOAÇÃO" : "TROCA"}</span>
          {localizacao && <span style={{ fontSize: 11, color: INK_SOFT }}><MapPin size={11} style={{ verticalAlign: "-2px" }} /> {localizacao}</span>}
          {distancia != null && <span style={{ fontSize: 11, color: INK_SOFT }}>{distancia < 1 ? "menos de 1 km" : `${Math.round(distancia)} km`}</span>}
          <span style={{ fontSize: 11, color: anuncianteOnline ? "#2D8A57" : INK_SOFT, display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: anuncianteOnline ? "#2D8A57" : "#A7ADA3" }} /> {anuncianteOnline ? "online" : "offline"}</span>
        </div>
      </div>
    </div>
  );
}

function Toast({ text, show }) {
  return (
    <div style={{
      position: "absolute", left: 16, right: 16, bottom: 88, background: INK, color: "#fff",
      padding: "12px 16px", borderRadius: 14, fontSize: 13.5, fontWeight: 600, textAlign: "center",
      zIndex: 60, boxShadow: "0 10px 24px rgba(0,0,0,.25)",
      transform: show ? "translateY(0)" : "translateY(30px)", opacity: show ? 1 : 0,
      transition: "all .3s cubic-bezier(.2,.9,.3,1)", pointerEvents: "none", fontFamily: "var(--font-ui)",
    }}>{text}</div>
  );
}

function Loading({ label = "Carregando..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 20px", gap: 10, color: INK_SOFT }}>
      <Loader2 size={24} style={{ animation: "spin .8s linear infinite" }} />
      <div style={{ fontSize: 12.5 }}>{label}</div>
    </div>
  );
}

function ErrorBox({ message, onRetry }) {
  return (
    <div style={{ margin: "10px 20px", background: "#FBE8E0", border: "1px solid #F0C6B4", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <AlertTriangle size={16} color="#9C4327" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12.5, color: "#9C4327", lineHeight: 1.4 }}>{message}</div>
      </div>
      {onRetry && <Button small variant="ghost" onClick={onRetry} style={{ borderColor: "#9C4327", color: "#9C4327" }}>Tentar de novo</Button>}
    </div>
  );
}

/* ---------------- Chrome: status bar / top bar / bottom nav ---------------- */

function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 22px 4px", fontSize: 12.5, fontWeight: 700, color: INK }}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span>••••</span><span>Wi-Fi</span><span>72%</span>
      </span>
    </div>
  );
}

function TopBar({ title, onBack, right, compact = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: compact ? "2px 14px 6px" : "6px 14px 12px", gap: 8, transition: "padding .2s" }}>
      {onBack ? (
        <button onClick={onBack} style={{ background: "#F1EFE6", border: "none", borderRadius: 12, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronLeft size={18} color={INK} />
        </button>
      ) : <div style={{ width: 34 }} />}
      <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: compact ? 15 : 16.5, color: INK, transition: "font-size .2s" }}>{title}</div>
      <div style={{ width: 34, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

// Perfil unificado (estilo OLX): o mesmo usuário doa e recebe com a mesma conta,
// então existe UM único menu com os destinos das duas pontas — não há mais
// troca de "role" para decidir quais abas aparecem.
const TABS_UNIFICADAS = [
  { key: "homeDoador", label: "Início", Icon: Home },
  { key: "busca", label: "Buscar", Icon: Search },
  { key: "cadastroItem", label: "Doar", Icon: Plus },
  { key: "gerenciarItens", label: "Minhas trocas", Icon: Gift },
  { key: "perfil", label: "Perfil", Icon: User },
];

function BottomNav({ active, go }) {
  const tabs = TABS_UNIFICADAS;
  return (
    <div style={{
      display: "flex", borderTop: "1px solid #EDEBE1", background: "#fff", padding: "8px 6px 14px",
      position: "sticky", bottom: 0,
    }}>
      {tabs.map(t => {
        const isActive = active === t.key;
        return (
          <button key={t.key} onClick={() => go(t.key)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex",
            flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0",
            color: isActive ? "var(--role-primary)" : "#A7ADA3",
          }}>
            <t.Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, fontFamily: "var(--font-ui)" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Screen({ children }) {
  return <div style={{ paddingBottom: 22, display: "flex", flexDirection: "column", gap: 4 }}>{children}</div>;
}
const iconBtn = { width: 36, height: 36, borderRadius: 12, background: "#F1EFE6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" };
const linkText = { fontSize: 12, fontWeight: 700, color: "var(--role-primary)", cursor: "pointer" };
const fieldLabel = { fontSize: 11.5, fontWeight: 700, color: INK_SOFT, marginBottom: 6, marginTop: 12, fontFamily: "var(--font-ui)", display: "block" };
const fieldBox = { display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #E9E7DC", borderRadius: 12, padding: "11px 13px" };
const fieldInput = { border: "none", outline: "none", fontSize: 14, width: "100%", fontFamily: "var(--font-ui)", background: "transparent" };

function EmptyState({ Icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "30px 10px", color: INK_SOFT }}>
      <Icon size={30} style={{ marginBottom: 10, opacity: .5 }} />
      <div style={{ fontSize: 13, maxWidth: 220, margin: "0 auto" }}>{text}</div>
    </div>
  );
}
function StatBox({ value, label, Icon }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
      <Icon size={18} color="var(--role-primary)" />
      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: INK }}>{value}</div>
      <div style={{ fontSize: 11.5, color: INK_SOFT }}>{label}</div>
    </div>
  );
}

export { ROLE_COLORS, GOLD, INK, INK_SOFT, CATS, ESTADOS, CO2_ESTIMADO, BADGES, MOTIVOS_DENUNCIA, NOTIF_ICONS, COMMUNITY_POSTS, capitalize, timeAgo, fmtDateTime, badgeIndex, onlyDigits, distanciaKm, formatCpf, formatCep, cpfValido, comprimirImagem, useApiData, Button, Chip, Avatar, Stars, SectionTitle, ImpactRing, ItemCard, Toast, Loading, ErrorBox, StatusBar, TopBar, BottomNav, Screen, iconBtn, linkText, fieldLabel, fieldBox, fieldInput, EmptyState, StatBox };
