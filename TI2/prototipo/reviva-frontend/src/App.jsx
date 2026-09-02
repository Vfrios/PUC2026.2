import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Home, Plus, Search, MapPin, User, Bell, Heart, MessageCircle, Star,
  QrCode, Users, Settings, ChevronLeft, Camera, Send,
  Award, Leaf, AlertTriangle, ChevronRight, Recycle, Gift,
  Share2, Flag, Shirt, BookOpen, Sofa, Baby, Zap,
  UtensilsCrossed, Calendar, Clock, LogIn, Mail, Lock, Sparkles,
  ShieldCheck, ArrowLeftRight, ImagePlus,
  LogOut, Loader2, UserPlus, Trash2, Pencil, CheckCircle2,
} from "lucide-react";
import { api, getToken, setToken, ApiError, wsUrl } from "./api.js";
import { Client as StompClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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

function ItemCard({ item, onClick, favorite, onFav }) {
  const cat = CATS[item.categoria] || CATS.OUTROS;
  const Icon = cat.Icon;
  const foto = item.fotosUrls?.[0];
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
              fill={favorite ? "#E0673F" : "none"} color={favorite ? "#E0673F" : "#C7C9C1"} />
          )}
        </div>
        <div style={{ fontSize: 12, color: INK_SOFT, margin: "3px 0 6px" }}>{cat.label} · {capitalize(item.estadoConservacao)}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
            background: item.tipoPublicacao === "DOAR" ? "var(--role-soft)" : "#FBE8E0",
            color: item.tipoPublicacao === "DOAR" ? "var(--role-primary-dark)" : "#9C4327",
          }}>{item.tipoPublicacao === "DOAR" ? "DOAÇÃO" : "TROCA"}</span>
          {item.bairro && (
            <span style={{ fontSize: 11, color: INK_SOFT, display: "flex", alignItems: "center", gap: 3 }}>
              <MapPin size={11} /> {item.bairro}
            </span>
          )}
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

function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "6px 14px 12px", gap: 8 }}>
      {onBack ? (
        <button onClick={onBack} style={{ background: "#F1EFE6", border: "none", borderRadius: 12, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronLeft size={18} color={INK} />
        </button>
      ) : <div style={{ width: 34 }} />}
      <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16.5, color: INK }}>{title}</div>
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

/* ============================================================
   TELAS
   ============================================================ */

function Splash({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }, []);
  return (
    <div onClick={onDone} style={{
      height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#1F6E43,#123F27)", color: "#fff", gap: 14, cursor: "pointer",
    }}>
      <div style={{ width: 72, height: 72, borderRadius: 22, background: "rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Recycle size={34} strokeWidth={1.8} />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, letterSpacing: 0.2 }}>Reviva</div>
      <div style={{ fontSize: 13, opacity: .85, fontFamily: "var(--font-ui)" }}>o que você não usa, alguém precisa</div>
      <div style={{ marginTop: 30, width: 26, height: 26, border: "2.5px solid rgba(255,255,255,.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    </div>
  );
}

/* ---- AUTENTICAÇÃO (login / registro reais) ---- */
function Auth({ go, onLogin, onRegister }) {
  const [mode, setMode] = useState("login"); // login | registro
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErro("");
    if (!email || !senha || (mode === "registro" && !nome)) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (mode === "registro" && senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") await onLogin(email, senha);
      else await onRegister(nome, email, senha);
    } catch (e) {
      setErro(e.message || "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "10px 22px 30px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginTop: 18, marginBottom: 22 }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Recycle size={22} color="var(--role-primary-dark)" />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: INK }}>
          {mode === "login" ? "Bem-vindo(a) de volta" : "Criar sua conta"}
        </div>
        <div style={{ fontSize: 13, color: INK_SOFT, marginTop: 4 }}>Entre para doar, trocar e reduzir o desperdício.</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        <Chip active={mode === "login"} onClick={() => { setMode("login"); setErro(""); }}>Entrar</Chip>
        <Chip active={mode === "registro"} onClick={() => { setMode("registro"); setErro(""); }}>Criar conta</Chip>
      </div>

      {/* Envolver os campos (principalmente o de senha) num <form> remove o aviso do
          Chrome/DevTools: "A form field element should have an id or name attribute"
          / "password field is not contained in a form" — e dá Enter-to-submit de graça. */}
      <form onSubmit={e => { e.preventDefault(); submit(); }} autoComplete="on">
        {mode === "registro" && (
          <>
            <label style={fieldLabel}>Nome</label>
            <div style={fieldBox}><User size={16} color={INK_SOFT} /><input name="nome" autoComplete="name" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" style={fieldInput} /></div>
          </>
        )}
        <label style={fieldLabel}>E-mail</label>
        <div style={fieldBox}><Mail size={16} color={INK_SOFT} /><input type="email" name="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" style={fieldInput} /></div>
        <label style={fieldLabel}>Senha</label>
        <div style={fieldBox}><Lock size={16} color={INK_SOFT} /><input type="password" name="senha" autoComplete={mode === "registro" ? "new-password" : "current-password"} value={senha} onChange={e => setSenha(e.target.value)} placeholder={mode === "registro" ? "mínimo 8 caracteres" : "••••••••"} style={fieldInput} /></div>

        {erro && <div style={{ marginTop: 10, fontSize: 12, color: "#9C4327", background: "#FBE8E0", padding: "8px 10px", borderRadius: 10 }}>{erro}</div>}

        <div style={{ marginTop: 18 }}>
          <Button full type="submit" icon={mode === "login" ? LogIn : UserPlus} loading={loading}>
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </div>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: "#E9E7DC" }} /><span style={{ fontSize: 11, color: INK_SOFT }}>demonstração</span><div style={{ flex: 1, height: 1, background: "#E9E7DC" }} />
      </div>
      <div style={{ fontSize: 11.5, color: INK_SOFT, lineHeight: 1.6, background: "#F7F6EE", borderRadius: 12, padding: 12 }}>
        Contas de demonstração já cadastradas no backend:<br />
        <b>doador@reviva.com</b> / receptor@reviva.com — senha <b>reviva123</b>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ textAlign: "center", fontSize: 13, color: INK_SOFT }}>
        {mode === "login" ? (
          <>Novo por aqui? <span style={{ color: "var(--role-primary-dark)", fontWeight: 700, cursor: "pointer" }} onClick={() => setMode("registro")}>Criar conta</span></>
        ) : (
          <>Já tem conta? <span style={{ color: "var(--role-primary-dark)", fontWeight: 700, cursor: "pointer" }} onClick={() => setMode("login")}>Entrar</span></>
        )}
      </div>
    </div>
  );
}

function Onboarding({ go }) {
  const [step, setStep] = useState(0);
  const slides = [
    { Icon: Gift, title: "Doe em poucos toques", text: "Fotografe, descreva e publique. Alguém perto de você pode precisar exatamente disso." },
    { Icon: ArrowLeftRight, title: "Doe ou troque", text: "Escolha entre doação simples ou troca por outro item que você precise." },
    { Icon: Leaf, title: "Veja seu impacto", text: "Acompanhe kg de resíduo evitado, pessoas ajudadas e conquiste selos." },
  ];
  const s = slides[step];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "26px 26px 30px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16 }}>
        <div style={{ width: 84, height: 84, borderRadius: 26, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <s.Icon size={38} color="var(--role-primary-dark)" strokeWidth={1.6} />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: INK }}>{s.title}</div>
        <div style={{ fontSize: 13.5, color: INK_SOFT, lineHeight: 1.5, maxWidth: 260 }}>{s.text}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
        {slides.map((_, i) => <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 4, background: i === step ? "var(--role-primary)" : "#E1DFD3", transition: "all .2s" }} />)}
      </div>
      <Button full onClick={() => step < slides.length - 1 ? setStep(step + 1) : go("homeDoador")}>
        {step < slides.length - 1 ? "Continuar" : "Escolher meu perfil"}
      </Button>
    </div>
  );
}

function ChooseProfile({ go, setRole }) {
  const [loading, setLoading] = useState(null);
  const escolher = async (r) => {
    setLoading(r);
    try {
      await setRole(r);
      go(r === "doador" ? "homeDoador" : "homeReceptor");
    } finally {
      setLoading(null);
    }
  };
  return (
    <div style={{ height: "100%", padding: "40px 24px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: INK }}>Como você quer começar?</div>
        <div style={{ fontSize: 13, color: INK_SOFT, marginTop: 6 }}>Você pode alternar entre os dois perfis a qualquer momento.</div>
      </div>
      {[
        { role: "doador", title: "Quero doar / trocar", desc: "Publique itens que não usa mais.", Icon: Gift },
        { role: "receptor", title: "Quero receber / buscar", desc: "Encontre itens perto de você.", Icon: Search },
      ].map(o => (
        <div key={o.role} onClick={() => !loading && escolher(o.role)}
          style={{ border: "2px solid " + ROLE_COLORS[o.role].primary, background: ROLE_COLORS[o.role].soft, borderRadius: 20, padding: 18, display: "flex", gap: 14, alignItems: "center", cursor: "pointer", opacity: loading && loading !== o.role ? 0.5 : 1 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {loading === o.role ? <Loader2 size={20} color={ROLE_COLORS[o.role].primary} style={{ animation: "spin .8s linear infinite" }} /> : <o.Icon size={22} color={ROLE_COLORS[o.role].primary} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>{o.title}</div>
            <div style={{ fontSize: 12.5, color: INK_SOFT }}>{o.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- HOME DOADOR ---- */
function HomeDoador({ go, usuario }) {
  const { loading, data: recebidas } = useApiData(() => api.solicitacoesRecebidas(), [usuario?.id]);
  const pendentes = (recebidas || []).filter(s => s.status === "AGUARDANDO");
  const destaque = pendentes[0];
  const pct = Math.min(1, (usuario?.kgResiduoEvitado || 0) / 100);

  return (
    <Screen>
      <div style={{ padding: "4px 20px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12.5, color: INK_SOFT }}>Olá,</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: INK }}>{usuario?.nome?.split(" ")[0] || "Você"} 👋</div>
        </div>
        <button onClick={() => go("notificacoes")} style={iconBtn}><Bell size={18} color={INK} /></button>
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
              <div style={{ fontWeight: 700, fontSize: 13.5, color: INK }}>{destaque.receptor?.nome} quer "{destaque.item?.titulo}"</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT }}>{destaque.mensagem ? "Enviou uma mensagem" : "Sem mensagem"} · {timeAgo(destaque.criadaEm)}</div>
            </div>
            <ChevronRight size={16} color={INK_SOFT} />
          </div>
        ) : (
          <EmptyState Icon={Gift} text="Nenhuma solicitação pendente ainda. Publique um item para começar a receber pedidos." />
        )}
      </div>
    </Screen>
  );
}

/* ---- CADASTRO DE ITEM (também usado para editar, quando params.item vem preenchido) ---- */
function CadastroItem({ go, notify, params }) {
  const itemEditando = params?.item || null;
  const [tipo, setTipo] = useState(itemEditando?.tipoPublicacao || "DOAR");
  const [cat, setCat] = useState(itemEditando?.categoria || "ROUPAS");
  const [estado, setEstado] = useState(itemEditando?.estadoConservacao || "SEMINOVO");
  const [titulo, setTitulo] = useState(itemEditando?.titulo || "");
  const [descricao, setDescricao] = useState(itemEditando?.descricao || "");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // ---- Fotos (câmera ou galeria) — comprimidas no navegador e enviadas como
  // data URLs em fotosUrls (o backend já persiste isso no Item, ver model/Item.java) ----
  const [fotos, setFotos] = useState(itemEditando?.fotosUrls || []); // array de data URLs, até 3
  const [fotoEnviando, setFotoEnviando] = useState(false);
  const fileInputRef = useRef(null);

  const adicionarFoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (!file) return;
    setFotoEnviando(true);
    try {
      const dataUrl = await comprimirImagem(file);
      setFotos(f => [...f, dataUrl].slice(0, 3));
    } catch (err) {
      setErro(err.message || "Não foi possível processar a foto.");
    } finally {
      setFotoEnviando(false);
    }
  };

  const removerFoto = (idx) => setFotos(f => f.filter((_, i) => i !== idx));


  const [cep, setCep] = useState("");
  const [cepBuscando, setCepBuscando] = useState(false);
  const [cepErro, setCepErro] = useState("");
  const [endereco, setEndereco] = useState(itemEditando ? {
    logradouro: null, uf: itemEditando.uf, cidade: itemEditando.cidade, bairro: itemEditando.bairro,
    latitude: itemEditando.latitude, longitude: itemEditando.longitude,
  } : null); // { logradouro, bairro, cidade, uf, latitude, longitude }
  const [bairro, setBairro] = useState(itemEditando?.bairro || "");
  const [cidade, setCidade] = useState(itemEditando?.cidade || "");
  const cepDigits = cep.replace(/\D/g, "").slice(0, 8);

  const formatCep = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  useEffect(() => {
    if (cepDigits.length !== 8) { setCepErro(""); return; }
    let cancelado = false;
    setCepBuscando(true);
    setCepErro("");
    api.buscarCep(cepDigits)
      .then(res => {
        if (cancelado) return;
        setEndereco(res);
        setBairro(res.bairro || "");
        setCidade(res.cidade || "");
      })
      .catch(e => {
        if (cancelado) return;
        setEndereco(null);
        setCepErro(e.message || "CEP não encontrado. Preencha o bairro e a cidade manualmente.");
      })
      .finally(() => { if (!cancelado) setCepBuscando(false); });
    return () => { cancelado = true; };
  }, [cepDigits]);

  const submit = async () => {
    setErro("");
    if (!titulo.trim()) { setErro("Dê um título para o item."); return; }
    if (!bairro.trim() || !cidade.trim()) { setErro("Informe o CEP ou preencha bairro e cidade."); return; }
    setLoading(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria: cat,
        estadoConservacao: estado,
        tipoPublicacao: tipo,
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        uf: endereco?.uf || null,
        latitude: endereco?.latitude ?? null,
        longitude: endereco?.longitude ?? null,
        impactoCo2Kg: CO2_ESTIMADO[cat] || 2,
        fotosUrls: fotos,
      };
      if (itemEditando) {
        await api.editarItem(itemEditando.id, payload);
        notify("Item atualizado com sucesso ✏️");
        go(-1);
      } else {
        await api.criarItem(payload);
        notify("Item publicado com sucesso 🎉");
        go("homeDoador");
      }
    } catch (e) {
      setErro(e.message || "Não foi possível salvar o item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar title={itemEditando ? "Editar item" : "Cadastrar item"} onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {[0, 1, 2].map(i => {
            const foto = fotos[i];
            if (foto) {
              return (
                <div key={i} style={{ width: 78, height: 78, borderRadius: 16, flexShrink: 0, position: "relative" }}>
                  <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }} />
                  <div onClick={() => removerFoto(i)} style={{
                    position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%",
                    background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                  }}><Trash2 size={11} /></div>
                </div>
              );
            }
            const proximaVazia = fotos.length === i;
            return (
              <div key={i}
                onClick={() => proximaVazia && !fotoEnviando && fileInputRef.current?.click()}
                style={{
                  width: 78, height: 78, borderRadius: 16, background: "var(--role-soft)",
                  border: "1.5px dashed var(--role-primary)", flexShrink: 0, display: "flex",
                  alignItems: "center", justifyContent: "center", color: "var(--role-primary-dark)",
                  cursor: proximaVazia ? "pointer" : "default", opacity: proximaVazia ? 1 : 0.35,
                }}>
                {proximaVazia && fotoEnviando
                  ? <Loader2 size={20} style={{ animation: "spin .8s linear infinite" }} />
                  : <ImagePlus size={20} />}
              </div>
            );
          })}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={adicionarFoto} style={{ display: "none" }} />
        </div>
        <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 14 }}>Toque para tirar uma foto ou escolher da galeria — até 3 fotos por item.</div>

        <label style={fieldLabel}>Título</label>
        <div style={fieldBox}><input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Jaqueta jeans P/M" style={fieldInput} /></div>

        <label style={fieldLabel}>Descrição</label>
        <div style={{ ...fieldBox, alignItems: "flex-start" }}><textarea rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Conte detalhes, estado de uso, tamanho..." style={{ ...fieldInput, resize: "none" }} /></div>

        <label style={fieldLabel}>Categoria</label>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {Object.entries(CATS).map(([k, v]) => <Chip key={k} active={cat === k} onClick={() => setCat(k)}>{v.label}</Chip>)}
        </div>

        <label style={fieldLabel}>Estado de conservação</label>
        <div style={{ display: "flex", gap: 8 }}>
          {ESTADOS.map(e => <Chip key={e.value} active={estado === e.value} onClick={() => setEstado(e.value)}>{e.label}</Chip>)}
        </div>

        <label style={fieldLabel}>Tipo de publicação</label>
        <div style={{ display: "flex", gap: 8 }}>
          <Chip active={tipo==="DOAR"} onClick={() => setTipo("DOAR")}>🎁 Doar</Chip>
          <Chip active={tipo==="TROCAR"} onClick={() => setTipo("TROCAR")}>🔁 Trocar</Chip>
        </div>

        <label style={fieldLabel}>CEP</label>
        <div style={fieldBox}>
          <MapPin size={16} color={INK_SOFT} />
          <input
            value={formatCep(cep)}
            onChange={e => setCep(e.target.value)}
            placeholder="00000-000"
            inputMode="numeric"
            maxLength={9}
            style={fieldInput}
          />
          {cepBuscando && <Loader2 size={15} color={INK_SOFT} style={{ animation: "spin .8s linear infinite" }} />}
        </div>
        <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 4 }}>
          {itemEditando ? "Deixe em branco para manter o endereço atual, ou digite um novo CEP para atualizá-lo." : "Digite o CEP para preencher rua, bairro e cidade automaticamente."}
        </div>
        {cepErro && <div style={{ fontSize: 11.5, color: "#9C4327", marginTop: 4 }}>{cepErro}</div>}

        {endereco?.logradouro && (
          <div style={{ marginTop: 8, background: "var(--role-soft)", borderRadius: 12, padding: "9px 12px", fontSize: 12, color: "var(--role-primary-dark)" }}>
            {endereco.logradouro}{endereco.uf ? ` · ${endereco.uf}` : ""}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={fieldLabel}>Bairro</label>
            <div style={fieldBox}><input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Preenchido pelo CEP" style={fieldInput} /></div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={fieldLabel}>Cidade</label>
            <div style={fieldBox}><input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Preenchido pelo CEP" style={fieldInput} /></div>
          </div>
        </div>

        <div style={{ marginTop: 14, background: "var(--role-soft)", borderRadius: 14, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <QrCode size={22} color="var(--role-primary-dark)" />
          <div style={{ fontSize: 11.5, color: "var(--role-primary-dark)" }}>Um QR Code de retirada será gerado automaticamente após o agendamento, para confirmar a entrega com 1 toque.</div>
        </div>

        {erro && <div style={{ marginTop: 12, fontSize: 12, color: "#9C4327", background: "#FBE8E0", padding: "8px 10px", borderRadius: 10 }}>{erro}</div>}

        <div style={{ marginTop: 18 }}>
          <Button full loading={loading} onClick={submit}>{itemEditando ? "Salvar alterações" : "Publicar item"}</Button>
        </div>
      </div>
    </div>
  );
}

/* ---- GERENCIAR ITENS ---- */
function GerenciarItens({ go, notify }) {
  const { loading, error, data: itens, reload: reloadItens } = useApiData(() => api.meusItens(), []);
  const { data: solicitacoes, reload: reloadSolic } = useApiData(() => api.solicitacoesRecebidas(), []);
  const [expandido, setExpandido] = useState(null);
  const [acaoLoading, setAcaoLoading] = useState(null);

  const reload = () => { reloadItens(); reloadSolic(); };

  const statusLabel = { ATIVO: "Ativo", EM_NEGOCIACAO: "Em negociação", DOADO: "Doado", REMOVIDO: "Removido" };
  const statusStyle = (s) => ({
    background: s === "DOADO" ? "#EDEBE1" : s === "ATIVO" ? "var(--role-soft)" : s === "REMOVIDO" ? "#F1EFE6" : "#FDEFD9",
    color: s === "DOADO" || s === "REMOVIDO" ? INK_SOFT : s === "ATIVO" ? "var(--role-primary-dark)" : "#9C6B14",
  });

  const solicPorItem = (itemId) => (solicitacoes || []).filter(s => s.item?.id === itemId);

  const responder = async (s, aceitar) => {
    setAcaoLoading(s.id);
    try {
      if (aceitar) { await api.aceitarSolicitacao(s.id); notify("Solicitação aceita! Já pode conversar com " + s.receptor.nome); }
      else { await api.recusarSolicitacao(s.id); notify("Solicitação recusada."); }
      reload();
    } catch (e) {
      notify(e.message || "Não foi possível processar a solicitação.");
    } finally {
      setAcaoLoading(null);
    }
  };

  const remover = async (item) => {
    setAcaoLoading(item.id);
    try { await api.removerItem(item.id); notify("Item removido."); reload(); }
    catch (e) { notify(e.message || "Erro ao remover item."); }
    finally { setAcaoLoading(null); }
  };

  // Confirmação rápida de doação: marca o item como doado e já atualiza o
  // perfil do usuário (kg evitados, itens doados, pontos e selo — ver
  // ItemService.marcarComoDoado no backend), sem precisar passar pelo fluxo
  // completo de agendamento/QR Code.
  const confirmarDoacao = async (item) => {
    setAcaoLoading(item.id);
    try {
      await api.marcarItemComoDoado(item.id);
      notify("Doação confirmada! Seu impacto foi atualizado. 🎉");
      reload();
    } catch (e) {
      notify(e.message || "Não foi possível confirmar a doação.");
    } finally {
      setAcaoLoading(null);
    }
  };

  return (
    <div>
      <TopBar title="Gerenciar itens" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading label="Buscando seus itens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && (itens || []).length === 0 && (
          <EmptyState Icon={Gift} text="Você ainda não publicou nenhum item. Toque em 'Doar' para cadastrar o primeiro." />
        )}
        {(itens || []).map((it) => {
          const relacionadas = solicPorItem(it.id);
          const pendentes = relacionadas.filter(s => s.status === "AGUARDANDO");
          const aceitas = relacionadas.filter(s => s.status === "ACEITA");
          const aberto = expandido === it.id;
          return (
            <div key={it.id} style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 }}>
              <div onClick={() => setExpandido(aberto ? null : it.id)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: INK }}>{it.titulo}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, ...statusStyle(it.status) }}>{statusLabel[it.status] || it.status}</span>
                </div>
                <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 6 }}>{relacionadas.length} solicitações recebidas</div>
                <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 3 }}>
                  Publicado em {new Date(it.publicadoEm).toLocaleDateString("pt-BR")}
                  {it.expiraEm && <> · válido até {new Date(it.expiraEm).toLocaleDateString("pt-BR")}</>}
                  {it.expirado && <span style={{ marginLeft: 6, fontWeight: 700, color: "#9C4327" }}>Expirado</span>}
                </div>
              </div>
              {aberto && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #F0EEE4", paddingTop: 10 }}>
                  {relacionadas.length === 0 && <div style={{ fontSize: 12, color: INK_SOFT }}>Nenhuma solicitação ainda.</div>}
                  {pendentes.map(s => (
                    <div key={s.id} style={{ background: "#FAFAF4", borderRadius: 12, padding: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar label={s.receptor?.nome} size={26} />
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{s.receptor?.nome}</div>
                      </div>
                      {s.mensagem && <div style={{ fontSize: 12, color: INK_SOFT, margin: "6px 0" }}>"{s.mensagem}"</div>}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <Button small variant="primary" loading={acaoLoading === s.id} onClick={() => responder(s, true)}>Aceitar</Button>
                        <Button small variant="ghost" loading={acaoLoading === s.id} onClick={() => responder(s, false)}>Recusar</Button>
                      </div>
                    </div>
                  ))}
                  {aceitas.map(s => (
                    <div key={s.id} onClick={() => go("chatDoador", { solicitacaoId: s.id, otherName: s.receptor?.nome, itemTitulo: it.titulo, itemId: it.id })}
                      style={{ background: "var(--role-soft)", borderRadius: 12, padding: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar label={s.receptor?.nome} size={26} />
                      <div style={{ flex: 1, fontSize: 12.5, color: "var(--role-primary-dark)", fontWeight: 700 }}>{s.receptor?.nome} — abrir conversa</div>
                      <ChevronRight size={15} color="var(--role-primary-dark)" />
                    </div>
                  ))}
                  {(it.status === "ATIVO" || it.status === "EM_NEGOCIACAO") && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button small variant="ghost" icon={Pencil} onClick={() => go("cadastroItem", { item: it })}>Editar</Button>
                      <Button small variant="primary" icon={CheckCircle2} loading={acaoLoading === it.id} onClick={() => confirmarDoacao(it)}>Item doado</Button>
                    </div>
                  )}
                  {it.status !== "REMOVIDO" && it.status !== "DOADO" && (
                    <Button small variant="danger" icon={Trash2} loading={acaoLoading === it.id} onClick={() => remover(it)}>Remover anúncio</Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- CHAT (real, persistido no banco) ---- */
function Chat({ go, role, notify, params, usuario }) {
  const { solicitacaoId, otherName, itemTitulo } = params || {};
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

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

  if (!solicitacaoId) {
    return (
      <div>
        <TopBar title="Chat" onBack={() => go(-1)} />
        <EmptyState Icon={MessageCircle} text="Abra esta conversa a partir de uma solicitação aceita." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={otherName || "Conversa"} onBack={() => go(-1)} />
      <div style={{ padding: "0 16px 8px", display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar label={otherName} size={30} />
        <div style={{ fontSize: 11.5, color: INK_SOFT }}>{itemTitulo}</div>
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "6px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading && <Loading label="Carregando conversa..." />}
        {erro && <ErrorBox message={erro} onRetry={carregar} />}
        {!loading && messages.length === 0 && <EmptyState Icon={MessageCircle} text="Ainda não há mensagens. Diga oi 👋" />}
        {messages.map((m) => {
          const mine = usuario && m.remetente?.id === usuario.id;
          return (
            <div key={m.id} style={{
              alignSelf: mine ? "flex-end" : "flex-start",
              background: mine ? "var(--role-primary)" : "#F1EFE6",
              color: mine ? "#fff" : INK, padding: "9px 13px", borderRadius: 16,
              borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4,
              fontSize: 13.5, maxWidth: "78%",
            }}>{m.texto}</div>
          );
        })}
      </div>
      <div style={{ padding: 12, display: "flex", gap: 8, alignItems: "center", borderTop: "1px solid #EDEBE1" }}>
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
  const [data, setData] = useState("");
  const [hora, setHora] = useState("10:30");
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

  const confirmarManual = async () => {
    setLoading(true);
    try {
      await api.confirmarPorReceptor(agendamento.id);
      notify("Recebimento confirmado ✔");
      await irParaAvaliacao();
    } catch (e) {
      notify(e.message || "Não foi possível confirmar.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <Button full variant="soft" loading={loading} onClick={confirmarManual}>Confirmar manualmente (sem código)</Button>
        <Button full variant="ghost" icon={AlertTriangle} onClick={async () => { try { await api.reportarProblema(agendamento.id); } catch {} go("moderacao", params); }}>Relatar um problema</Button>
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
          <ImpactRing pct={Math.min(1, kg / 100)} size={110} value={`${Math.round(kg)} kg`} label="resíduo evitado" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
          <StatBox value={itens} label="itens doados" Icon={Gift} />
          <StatBox value={pontos} label="pontos" Icon={Award} />
          <StatBox value={(usuario?.reputacaoScore || 0).toFixed(1)} label="nota média" Icon={Star} />
        </div>
        <SectionTitle>Selo de impacto</SectionTitle>
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

/* ---- HOME RECEPTOR ---- */
function HomeReceptor({ go, favorites, toggleFav }) {
  const { loading, error, data: itens, reload } = useApiData(() => api.listarItens(), []);
  return (
    <Screen>
      <div style={{ padding: "4px 20px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12.5, color: INK_SOFT }}>Perto de você</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 600, color: INK }}>Encontre um item 🔎</div>
        </div>
        <button onClick={() => go("notificacoes")} style={iconBtn}><Bell size={18} color={INK} /></button>
      </div>
      <div style={{ padding: "12px 20px 0" }} onClick={() => go("busca")}>
        <div style={{ background: "#fff", border: "1.5px solid #EDEBE1", borderRadius: 16, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", color: INK_SOFT }}>
          <Search size={17} /> Buscar roupas, livros, móveis...
        </div>
      </div>
      <div style={{ padding: "0 20px" }}>
        <SectionTitle right={<span style={linkText} onClick={() => go("mapaItens")}>ver mapa</span>}>Categorias</SectionTitle>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(itens || []).slice(0, 4).map(it => (
            <ItemCard key={it.id} item={it} favorite={!!favorites[it.id]} onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: it.id })} />
          ))}
          {!loading && !error && (itens || []).length === 0 && <EmptyState Icon={Search} text="Nenhum item publicado ainda." />}
        </div>
      </div>
    </Screen>
  );
}

/* ---- BUSCA ---- */
function Busca({ go }) {
  const [q, setQ] = useState("");
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [localizando, setLocalizando] = useState(false);
  const [localizacaoAuto, setLocalizacaoAuto] = useState(false);
  const [localizacaoErro, setLocalizacaoErro] = useState("");
  const qRef = useRef(q);
  const pendingCidadeRef = useRef(null);
  const autoBuscouRef = useRef(false);

  useEffect(() => { qRef.current = q; }, [q]);

  const { data: estados } = useApiData(() => api.listarEstados(), []);
  const { data: cidades, loading: cidadesLoading } = useApiData(
    () => (uf ? api.listarCidades(uf) : Promise.resolve([])),
    [uf]
  );

  const buscar = (ufParam = uf, cidadeParam = cidade) =>
    go("listaItens", { termo: q || undefined, uf: ufParam || undefined, cidade: cidadeParam || undefined });

  // Detecta a localização automaticamente ao abrir a tela: pede a posição do
  // navegador (GPS/Wi-Fi), converte em cidade/UF via reverse geocoding e já
  // filtra os itens perto do usuário — sem precisar digitar ou selecionar
  // nada. Se a permissão for negada ou o GPS falhar, a busca manual segue
  // funcionando normalmente, sem travar a tela.
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await api.reverseGeo(pos.coords.latitude, pos.coords.longitude);
          if (res?.uf) {
            setUf(res.uf);
            setLocalizacaoAuto(true);
            if (res.cidade) {
              pendingCidadeRef.current = res.cidade;
            } else if (qRef.current.trim() === "") {
              autoBuscouRef.current = true;
              buscar(res.uf, "");
            }
          } else {
            setLocalizacaoErro("Não foi possível detectar sua região automaticamente.");
          }
        } catch {
          setLocalizacaoErro("Não foi possível detectar sua região automaticamente.");
        } finally {
          setLocalizando(false);
        }
      },
      () => setLocalizando(false), // permissão negada ou indisponível: segue no fluxo manual, sem erro visível
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quando a lista de cidades do estado detectado termina de carregar, seleciona
  // a cidade encontrada pelo GPS e dispara a busca automaticamente (uma única vez,
  // e só se o usuário ainda não tiver começado a digitar um termo por conta própria).
  useEffect(() => {
    if (!pendingCidadeRef.current || cidadesLoading || autoBuscouRef.current) return;
    const alvo = pendingCidadeRef.current.toLowerCase();
    const encontrada = (cidades || []).find(c => c.nome.toLowerCase() === alvo);
    const cidadeFinal = encontrada ? encontrada.nome : "";
    setCidade(cidadeFinal);
    pendingCidadeRef.current = null;
    if (qRef.current.trim() === "") {
      autoBuscouRef.current = true;
      buscar(uf, cidadeFinal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidades, cidadesLoading]);

  return (
    <div>
      <TopBar title="Buscar" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ ...fieldBox }}>
          <Search size={16} color={INK_SOFT} />
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && buscar()} placeholder="O que você está procurando?" style={fieldInput} autoFocus />
        </div>

        <label style={fieldLabel}>Região</label>
        {(localizando || localizacaoAuto || localizacaoErro) && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: localizacaoErro ? "#9C6B14" : "var(--role-primary-dark)", marginBottom: 6 }}>
            {localizando ? (
              <><Loader2 size={12} style={{ animation: "spin .8s linear infinite" }} /> Detectando sua localização...</>
            ) : localizacaoErro ? (
              <>{localizacaoErro}</>
            ) : (
              <><MapPin size={12} /> Região preenchida automaticamente pela sua localização</>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ ...fieldBox, flex: 1 }}>
            <select
              value={uf}
              onChange={e => { setUf(e.target.value); setCidade(""); setLocalizacaoAuto(false); pendingCidadeRef.current = null; }}
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
          {["Roupas","Livros","Eletrônicos","Móveis","Cozinha"].map(s => <Chip key={s} onClick={() => go("listaItens", { termo: s, uf: uf || undefined, cidade: cidade || undefined })}>{s}</Chip>)}
        </div>
        <div style={{ marginTop: 16 }}><Button full onClick={() => buscar()}>Buscar</Button></div>
      </div>
    </div>
  );
}

/* ---- LISTA / MAPA ---- */
function ListaItens({ go, favorites, toggleFav, params }) {
  const [view, setView] = useState("lista");
  const [tipoFiltro, setTipoFiltro] = useState(null);
  const categoria = params?.categoria || null;
  const termo = params?.termo || null;
  const uf = params?.uf || null;
  const cidade = params?.cidade || null;

  const { loading, error, data: itens, reload } = useApiData(
    () => api.listarItens({ categoria, tipo: tipoFiltro, termo, uf, cidade }),
    [categoria, tipoFiltro, termo, uf, cidade]
  );

  if (view === "mapa") return <MapaItens go={go} setView={setView} embedded />;

  const tituloRegiao = cidade ? ` em ${cidade}` : uf ? ` em ${uf}` : "";

  return (
    <div>
      <TopBar title={termo ? `Resultados: "${termo}"` : `Itens perto de você${tituloRegiao}`} onBack={() => go(-1)} right={<MapPin size={18} color={INK} onClick={() => setView("mapa")} style={{ cursor: "pointer" }} />} />
      <div style={{ padding: "0 20px", display: "flex", gap: 8, marginBottom: 10 }}>
        <Chip active={!tipoFiltro} onClick={() => setTipoFiltro(null)}>Todos</Chip>
        <Chip active={tipoFiltro === "DOAR"} onClick={() => setTipoFiltro("DOAR")}>Doação</Chip>
        <Chip active={tipoFiltro === "TROCAR"} onClick={() => setTipoFiltro("TROCAR")}>Troca</Chip>
      </div>
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading label="Buscando itens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && (itens || []).length === 0 && <EmptyState Icon={Search} text="Nenhum item encontrado com esses filtros." />}
        {(itens || []).map(it => <ItemCard key={it.id} item={it} favorite={!!favorites[it.id]} onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: it.id })} />)}
      </div>
    </div>
  );
}

function MapaItens({ go, setView, embedded }) {
  const { data: itens } = useApiData(() => api.listarItens(), []);
  return (
    <div style={{ height: embedded ? "auto" : "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title="Mapa de itens" onBack={() => embedded ? setView("lista") : go(-1)} />
      <div style={{ margin: "0 20px", borderRadius: 20, overflow: "hidden", position: "relative", height: 380, background: "linear-gradient(135deg,#DCE7DA,#EFEBDD)" }}>
        <svg width="100%" height="100%" viewBox="0 0 300 380">
          {[...Array(9)].map((_,i)=><path key={i} d={`M ${i*35} 0 L ${i*35} 380`} stroke="#CBD6C7" strokeWidth="1"/>)}
          {[...Array(11)].map((_,i)=><path key={i} d={`M 0 ${i*35} L 300 ${i*35}`} stroke="#CBD6C7" strokeWidth="1"/>)}
        </svg>
        {(itens || []).map((it, i) => {
          const PinIcon = (CATS[it.categoria] || CATS.OUTROS).Icon;
          return (
            <div key={it.id} onClick={() => go("detalhesItem", { itemId: it.id })} style={{
              position: "absolute", left: 30 + (i * 47) % 240, top: 40 + (i * 63) % 300,
              width: 34, height: 34, borderRadius: "50% 50% 50% 0", background: "var(--role-primary)",
              transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,.2)",
            }}>
              <div style={{ transform: "rotate(45deg)" }}><PinIcon size={14} color="#fff" /></div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 12, bottom: 12, background: "#fff", borderRadius: 10, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, color: INK }}>mapa ilustrativo</div>
      </div>
      <div style={{ padding: "12px 20px" }}><Button full variant="soft" onClick={() => embedded ? setView("lista") : go("listaItens")}>Ver como lista</Button></div>
    </div>
  );
}

/* ---- DETALHES DO ITEM ---- */
function DetalhesItem({ go, notify, favorites, toggleFav, usuario, params }) {
  const itemId = params?.itemId;
  const { loading, error, data: item, reload } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const [fotoAtiva, setFotoAtiva] = useState(0);

  if (!itemId) return <div><TopBar title="Detalhes" onBack={() => go(-1)} /><EmptyState Icon={Search} text="Nenhum item selecionado." /></div>;
  if (loading) return <div><TopBar title="Detalhes" onBack={() => go(-1)} /><Loading /></div>;
  if (error) return <div><TopBar title="Detalhes" onBack={() => go(-1)} /><ErrorBox message={error} onRetry={reload} /></div>;
  if (!item) return null;

  const cat = CATS[item.categoria] || CATS.OUTROS;
  const Icon = cat.Icon;
  const souEuOItem = usuario && item.doador?.id === usuario.id;
  const fotos = item.fotosUrls || [];

  return (
    <div>
      <TopBar title="Detalhes" onBack={() => go(-1)} right={<Share2 size={17} color={INK} />} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ height: 190, borderRadius: 20, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          {fotos.length > 0
            ? <img src={fotos[fotoAtiva] || fotos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Icon size={64} color="var(--role-primary-dark)" strokeWidth={1.3} />}
          <Heart onClick={() => toggleFav(item)} size={20} style={{ position: "absolute", top: 12, right: 12, cursor: "pointer" }} fill={favorites[item.id] ? "#E0673F" : "#fff"} color="#E0673F" />
        </div>
        {fotos.length > 1 && (
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {fotos.map((f, i) => (
              <div key={i} onClick={() => setFotoAtiva(i)} style={{
                width: 48, height: 48, borderRadius: 10, overflow: "hidden", cursor: "pointer",
                border: i === fotoAtiva ? "2px solid var(--role-primary)" : "2px solid transparent",
              }}>
                <img src={f} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 14 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: INK }}>{item.titulo}</div>
            <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 3 }}>{cat.label} · {capitalize(item.estadoConservacao)}{item.bairro ? ` · ${item.bairro}` : ""}</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: item.tipoPublicacao === "DOAR" ? "var(--role-soft)" : "#FBE8E0", color: item.tipoPublicacao === "DOAR" ? "var(--role-primary-dark)" : "#9C4327" }}>{item.tipoPublicacao === "DOAR" ? "DOAÇÃO" : "TROCA"}</span>
        </div>
        {item.descricao && <div style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.55, marginTop: 12 }}>{item.descricao}</div>}
        {item.doador && (
          <div style={{ marginTop: 14, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => go("reputacao")}>
            <Avatar label={item.doador.nome} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: INK }}>{item.doador.nome}</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT, display: "flex", alignItems: "center", gap: 4 }}><Stars value={item.doador.reputacaoScore} /> {(item.doador.reputacaoScore || 0).toFixed(1)}</div>
            </div>
            <ChevronRight size={16} color={INK_SOFT} />
          </div>
        )}
        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <Button full variant="soft" icon={Heart} onClick={() => toggleFav(item)}>{favorites[item.id] ? "Favoritado" : "Favoritar"}</Button>
          {souEuOItem ? (
            <Button full variant="ghost" disabled>Este é o seu item</Button>
          ) : item.status !== "ATIVO" ? (
            <Button full variant="ghost" disabled>Indisponível</Button>
          ) : (
            <Button full onClick={() => go("solicitacao", { itemId: item.id })}>Solicitar item</Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- SOLICITAÇÃO ---- */
function Solicitacao({ go, notify, params }) {
  const itemId = params?.itemId;
  const { data: item } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const enviar = async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const solicitacao = await api.solicitar(itemId, mensagem);
      notify("Solicitação enviada! Aguardando resposta...");
      go("chatReceptor", {
        solicitacaoId: solicitacao.id,
        otherName: solicitacao.item?.doador?.nome,
        itemTitulo: solicitacao.item?.titulo,
        itemId,
      });
    } catch (e) {
      notify(e.message || "Não foi possível enviar a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100%", padding: "30px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: 84, height: 84, borderRadius: "50%", background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Send size={32} color="var(--role-primary-dark)" />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: INK, marginTop: 16 }}>Enviar solicitação</div>
      <div style={{ fontSize: 13, color: INK_SOFT, marginTop: 6 }}>Adicione uma mensagem opcional para {item?.doador?.nome || "o doador"}.</div>
      <div style={{ ...fieldBox, width: "100%", alignItems: "flex-start", marginTop: 16 }}>
        <textarea rows={3} value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder={`Olá! Tenho interesse em "${item?.titulo || "..."}"`} style={{ ...fieldInput, resize: "none" }} />
      </div>
      <div style={{ marginTop: 20, width: "100%" }}>
        <Button full loading={loading} onClick={enviar}>Enviar e aguardar resposta</Button>
      </div>
    </div>
  );
}

/* ---- HISTÓRICO ---- */
function Historico({ go }) {
  const { loading, error, data: enviadas, reload } = useApiData(() => api.solicitacoesEnviadas(), []);
  return (
    <div>
      <TopBar title="Histórico de solicitações" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && (enviadas || []).length === 0 && <EmptyState Icon={Clock} text="Você ainda não solicitou nenhum item." />}
        {(enviadas || []).map(s => (
          <div key={s.id} onClick={() => go("detalhesItem", { itemId: s.item?.id })} style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14, cursor: "pointer" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: INK }}>{s.item?.titulo}</div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, margin: "4px 0 8px" }}>Solicitado em {new Date(s.criadaEm).toLocaleDateString("pt-BR")} · doador {s.item?.doador?.nome}</div>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "var(--role-soft)", color: "var(--role-primary-dark)" }}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- PERFIL ---- */
function Perfil({ go, usuario, onLogout }) {
  return (
    <div>
      <TopBar title="Perfil" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar label={usuario?.nome} size={64} tone="var(--role-primary)" />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: INK }}>{usuario?.nome}</div>
            <div style={{ fontSize: 12, color: INK_SOFT }}>{usuario?.email}</div>
            <div style={{ fontSize: 12, color: INK_SOFT, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><Stars value={usuario?.reputacaoScore} /> {(usuario?.reputacaoScore || 0).toFixed(1)}</div>
          </div>
        </div>
        <SectionTitle>Configurações</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Notificações", Icon: Bell, go: "notificacoes" },
            { label: "Reputação e selos", Icon: Award, go: "reputacao" },
            { label: "Histórico de solicitações", Icon: Clock, go: "historico" },
            { label: "Comunidades", Icon: Users, go: "comunidades" },
          ].map(o => (
            <div key={o.label} onClick={() => o.go && go(o.go)} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 14, padding: "12px 14px", cursor: "pointer" }}>
              <o.Icon size={17} color="var(--role-primary)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: INK, flex: 1 }}>{o.label}</span>
              <ChevronRight size={15} color={INK_SOFT} />
            </div>
          ))}
          <div onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 14, padding: "12px 14px", cursor: "pointer" }}>
            <LogOut size={17} color="#9C4327" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#9C4327", flex: 1 }}>Sair</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- REPUTAÇÃO ---- */
function Reputacao({ go, usuario }) {
  const idx = badgeIndex(usuario?.seloAtual);
  const pontos = usuario?.pontos || 0;
  return (
    <div>
      <TopBar title="Reputação e selos" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px", textAlign: "center" }}>
        <ImpactRing pct={Math.min(1, (usuario?.reputacaoScore || 0) / 5)} size={100} value={(usuario?.reputacaoScore || 0).toFixed(1)} label="nota média" />
        <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 8 }}>Score calculado a partir das avaliações recebidas nas suas trocas e doações.</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--role-soft)", borderRadius: 999, padding: "6px 14px", marginTop: 12, fontSize: 12.5, fontWeight: 700, color: "var(--role-primary-dark)" }}>
          <Award size={14} /> {pontos} pontos
        </div>
        <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 6 }}>
          +15 ao concluir uma doação · +5 ao confirmar um recebimento · até +10 por avaliação recebida
        </div>
        <SectionTitle>Selos conquistados</SectionTitle>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {BADGES.map((b, i) => (
            <div key={b.tier} style={{ width: 58, height: 58, borderRadius: "50%", background: b.color + "22", border: `2px solid ${b.color}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: i <= idx ? 1 : 0.35 }}>
              <Award size={22} color={b.color} />
            </div>
          ))}
        </div>
        <SectionTitle>Verificação</SectionTitle>
        <div style={{ background: "var(--role-soft)", borderRadius: 14, padding: 12, display: "flex", gap: 10, alignItems: "center", textAlign: "left" }}>
          <ShieldCheck size={20} color="var(--role-primary-dark)" />
          <div style={{ fontSize: 12, color: "var(--role-primary-dark)" }}>
            {usuario?.emailVerificado ? "E-mail verificado." : "E-mail ainda não verificado."} {usuario?.telefoneVerificado ? "Telefone verificado." : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- COMUNIDADES / FEED ---- */
function Comunidades({ go, notify, usuario }) {
  const { loading, error, data: comunidades, reload } = useApiData(() => api.comunidades(), []);
  const [entrando, setEntrando] = useState(null);

  const participar = async (c) => {
    setEntrando(c.id);
    try { await api.participarComunidade(c.id); notify(`Você entrou em ${c.nome}!`); reload(); }
    catch (e) { notify(e.message || "Não foi possível entrar."); }
    finally { setEntrando(null); }
  };

  return (
    <div>
      <TopBar title="Comunidades" onBack={() => go(-1)} right={<Bell size={18} color={INK} onClick={() => go("notificacoes")} style={{ cursor: "pointer" }} />} />
      <div style={{ padding: "0 20px" }}>
        <SectionTitle>Grupos</SectionTitle>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
          {(comunidades || []).map(c => {
            const jaEntrou = usuario && (c.membros || []).some(m => m.id === usuario.id);
            return (
              <div key={c.id} onClick={() => !jaEntrou && participar(c)} style={{ minWidth: 150, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 14, padding: 12, cursor: jaEntrou ? "default" : "pointer" }}>
                <Users size={16} color="var(--role-primary)" />
                <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginTop: 6 }}>{c.nome}</div>
                <div style={{ fontSize: 10.5, color: INK_SOFT }}>{(c.membros || []).length} membros</div>
                <div style={{ fontSize: 10.5, color: "var(--role-primary-dark)", fontWeight: 700, marginTop: 4 }}>
                  {entrando === c.id ? "entrando..." : jaEntrou ? "✓ você participa" : "toque para entrar"}
                </div>
              </div>
            );
          })}
        </div>
        <SectionTitle>No feed <span style={{ fontSize: 10, fontWeight: 600, color: INK_SOFT }}>(ilustrativo)</span></SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {COMMUNITY_POSTS.map(p => (
            <div key={p.id} style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Avatar label={p.user} size={30} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{p.user}</span>
              </div>
              <div style={{ fontSize: 13, color: INK, marginTop: 8, lineHeight: 1.45 }}>{p.text}</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 8, display: "flex", gap: 4, alignItems: "center" }}><Heart size={13} /> {p.likes} apoios</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- FAVORITOS ---- */
function Favoritos({ go, favorites, toggleFav }) {
  const list = Object.values(favorites);
  return (
    <div>
      <TopBar title="Favoritos" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        {list.length === 0 ? (
          <EmptyState Icon={Heart} text="Você ainda não favoritou nenhum item. Toque no ❤ de um item para salvá-lo aqui." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map(it => <ItemCard key={it.id} item={it} favorite onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: it.id })} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- NOTIFICAÇÕES ---- */
function Notificacoes({ go, role }) {
  const { loading, error, data: notificacoes, reload } = useApiData(() => api.notificacoes(), []);
  const marcar = async (n) => {
    try { await api.marcarNotificacaoLida(n.id); reload(); } catch {}
  };
  return (
    <div>
      <TopBar title="Notificações" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && (notificacoes || []).length === 0 && <EmptyState Icon={Bell} text="Nenhuma notificação por aqui ainda." />}
        {(notificacoes || []).map(n => {
          const Icon = NOTIF_ICONS[n.tipo] || Bell;
          return (
            <div key={n.id} onClick={() => marcar(n)} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: n.lida ? "#fff" : "var(--role-soft)", border: "1px solid #EDEBE1", borderRadius: 14, padding: 12, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color="var(--role-primary-dark)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: INK, fontWeight: n.lida ? 500 : 700, lineHeight: 1.35 }}>{n.titulo}</div>
                <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 3 }}>há {timeAgo(n.criadaEm)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- MODERAÇÃO ---- */
function Moderacao({ go, notify, params }) {
  const [motivo, setMotivo] = useState(MOTIVOS_DENUNCIA[0].value);
  const [detalhes, setDetalhes] = useState("");
  const [loading, setLoading] = useState(false);

  const enviar = async () => {
    setLoading(true);
    try {
      await api.denunciar(motivo, detalhes);
      notify("Denúncia enviada. Obrigado por ajudar a manter a comunidade segura.");
      go(-1);
    } catch (e) {
      notify(e.message || "Não foi possível enviar a denúncia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar title="Reportar problema" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        {params?.otherName && <div style={{ fontSize: 12, color: INK_SOFT, marginBottom: 10 }}>Sobre o combinado com <b>{params.otherName}</b>{params.itemTitulo ? ` — "${params.itemTitulo}"` : ""}</div>}
        <div style={{ fontSize: 13, color: INK_SOFT, marginBottom: 10 }}>Selecione o motivo da denúncia. Nossa equipe revisa em até 24h.</div>
        {MOTIVOS_DENUNCIA.map(m => (
          <div key={m.value} onClick={() => setMotivo(m.value)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 4px", borderBottom: "1px solid #F0EEE4", cursor: "pointer" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${motivo===m.value ? "var(--role-primary)" : "#D6D6D0"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {motivo === m.value && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--role-primary)" }} />}
            </div>
            <span style={{ fontSize: 13, color: INK }}>{m.label}</span>
          </div>
        ))}
        <div style={{ ...fieldBox, alignItems: "flex-start", marginTop: 12 }}>
          <textarea rows={3} value={detalhes} onChange={e => setDetalhes(e.target.value)} placeholder="Descreva o que aconteceu (opcional)" style={{ ...fieldInput, resize: "none" }} />
        </div>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <Button full variant="danger" icon={Flag} loading={loading} onClick={enviar}>Enviar denúncia</Button>
          <Button full variant="ghost" onClick={() => go(-1)}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   APP SHELL
   ============================================================ */

const SCREEN_LABELS = {
  splash:"Abertura", auth:"Login", onboarding:"Onboarding", chooseProfile:"Escolha de perfil",
  homeDoador:"Home · Doador", cadastroItem:"Cadastro de item", gerenciarItens:"Gerenciar itens",
  chatDoador:"Chat", agendamentoDoador:"Agendamento", confirmDoacao:"Confirmação de doação",
  avaliarReceptor:"Avaliar receptor", dashboardImpacto:"Dashboard de impacto",
  homeReceptor:"Home · Receptor", busca:"Busca", listaItens:"Lista de itens", mapaItens:"Mapa",
  detalhesItem:"Detalhes do item", solicitacao:"Solicitação", chatReceptor:"Chat",
  agendamentoReceptor:"Agendamento", confirmRecebimento:"Confirmação de recebimento",
  avaliarDoador:"Avaliar doador", historico:"Histórico", perfil:"Perfil", reputacao:"Reputação",
  comunidades:"Comunidades", favoritos:"Favoritos",
  notificacoes:"Notificações", moderacao:"Moderação",
};

const NAV_SCREENS_UNIFICADAS = ["homeDoador", "busca", "cadastroItem", "gerenciarItens", "perfil", "comunidades", "mapaItens", "favoritos", "listaItens"];

export default function RevivaApp() {
  const [nav, setNav] = useState({ screen: "splash", params: {} });
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("reviva_favoritos") || "{}"); } catch { return {}; }
  });
  const [toast, setToast] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const usuarioRef = useRef(null);
  useEffect(() => { usuarioRef.current = usuario; }, [usuario]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    localStorage.setItem("reviva_favoritos", JSON.stringify(favorites));
  }, [favorites]);

  const notify = (text) => { setToast(text); setTimeout(() => setToast(null), 2400); };

  const go = (key, params = {}) => {
    if (key === -1) {
      setHistory(h => {
        const n = [...h];
        const prev = n.pop();
        setNav(prev || { screen: "perfil", params: {} });
        return n;
      });
      return;
    }
    setHistory(h => [...h, nav]);
    setNav({ screen: key, params });
  };

  const screen = nav.screen;
  const params = nav.params;

  const refreshUsuario = async () => {
    if (!getToken()) return;
    try {
      const u = await api.me();
      setUsuario(u);
      return u;
    } catch (e) {
      // 401 = token ausente/expirado; 403 = token não corresponde a nenhum
      // usuário válido (ex.: sessão salva de um banco que já foi reiniciado).
      // Nos dois casos o certo é encerrar a sessão local e voltar ao login,
      // em vez de deixar o app "preso" tentando usar um token inválido.
      if (e.status === 401 || e.status === 403) logout();
    }
  };

  const finishSplash = () => {
    if (usuarioRef.current) {
      go("homeDoador"); // perfil unificado: sempre a mesma home, sem escolher Doador/Receptor
    } else {
      go("auth");
    }
  };

  useEffect(() => {
    if (!getToken()) return;
    refreshUsuario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (email, senha) => {
    const res = await api.login(email, senha);
    setToken(res.token);
    const u = await refreshUsuario();
    setHistory([]);
    setNav({ screen: "homeDoador", params: {} }); // perfil unificado: sempre a mesma home
    notify(`Bem-vindo(a) de volta, ${u?.nome?.split(" ")[0] || ""}!`);
  };

  const handleRegister = async (nome, email, senha) => {
    const res = await api.registrar(nome, email, senha);
    setToken(res.token);
    await refreshUsuario();
    setHistory([]);
    setNav({ screen: "onboarding", params: {} });
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    setHistory([]);
    setNav({ screen: "auth", params: {} });
  };

  const setRole = async (r) => {
    setUsuario(u => u ? { ...u, perfilAtivo: r.toUpperCase() } : u);
    try { await api.trocarPerfilAtivo(r.toUpperCase()); }
    catch (e) { notify("Não foi possível trocar o perfil: " + e.message); }
  };

  const toggleFav = (item) => setFavorites(f => {
    const n = { ...f };
    if (n[item.id]) delete n[item.id];
    else n[item.id] = item;
    return n;
  });

  // Perfil unificado: uma conta só, sem alternância Doador/Receptor.
  // Mantido como constante para não quebrar as chamadas de tema/navegação
  // abaixo que ainda recebem `role` (ex.: Chat/Agendamento por transação).
  const role = "doador";
  const colors = ROLE_COLORS[role];
  const showNav = usuario && NAV_SCREENS_UNIFICADAS.includes(screen);

  let ScreenView;
  switch (screen) {
    case "splash": ScreenView = <Splash onDone={finishSplash} />; break;
    case "auth": ScreenView = <Auth go={go} onLogin={handleLogin} onRegister={handleRegister} />; break;
    case "onboarding": ScreenView = <Onboarding go={go} />; break;
    case "chooseProfile": ScreenView = <ChooseProfile go={go} setRole={setRole} />; break;
    case "homeDoador": ScreenView = <HomeDoador go={go} usuario={usuario} />; break;
    case "cadastroItem": ScreenView = <CadastroItem go={go} notify={notify} params={params} />; break;
    case "gerenciarItens": ScreenView = <GerenciarItens go={go} notify={notify} />; break;
    case "chatDoador": ScreenView = <Chat go={go} role="doador" notify={notify} params={params} usuario={usuario} />; break;
    case "agendamentoDoador": ScreenView = <Agendamento go={go} role="doador" notify={notify} params={params} />; break;
    case "confirmDoacao": ScreenView = <ConfirmDoacao go={go} notify={notify} params={params} refreshUsuario={refreshUsuario} />; break;
    case "avaliarReceptor": ScreenView = <Avaliar go={go} notify={notify} params={params} />; break;
    case "dashboardImpacto": ScreenView = <DashboardImpacto go={go} usuario={usuario} />; break;
    case "homeReceptor": ScreenView = <HomeReceptor go={go} favorites={favorites} toggleFav={toggleFav} />; break;
    case "busca": ScreenView = <Busca go={go} />; break;
    case "listaItens": ScreenView = <ListaItens go={go} favorites={favorites} toggleFav={toggleFav} params={params} />; break;
    case "mapaItens": ScreenView = <MapaItens go={go} />; break;
    case "detalhesItem": ScreenView = <DetalhesItem go={go} notify={notify} favorites={favorites} toggleFav={toggleFav} usuario={usuario} params={params} />; break;
    case "solicitacao": ScreenView = <Solicitacao go={go} notify={notify} params={params} />; break;
    case "chatReceptor": ScreenView = <Chat go={go} role="receptor" notify={notify} params={params} usuario={usuario} />; break;
    case "agendamentoReceptor": ScreenView = <Agendamento go={go} role="receptor" notify={notify} params={params} />; break;
    case "confirmRecebimento": ScreenView = <ConfirmRecebimento go={go} notify={notify} params={params} refreshUsuario={refreshUsuario} />; break;
    case "avaliarDoador": ScreenView = <Avaliar go={go} notify={notify} params={params} />; break;
    case "historico": ScreenView = <Historico go={go} />; break;
    case "perfil": ScreenView = <Perfil go={go} usuario={usuario} onLogout={logout} />; break;
    case "reputacao": ScreenView = <Reputacao go={go} usuario={usuario} />; break;
    case "comunidades": ScreenView = <Comunidades go={go} notify={notify} usuario={usuario} />; break;
    case "favoritos": ScreenView = <Favoritos go={go} favorites={favorites} toggleFav={toggleFav} />; break;
    case "notificacoes": ScreenView = <Notificacoes go={go} role={role} />; break;
    case "moderacao": ScreenView = <Moderacao go={go} notify={notify} params={params} />; break;
    default: ScreenView = <div />;
  }

  return (
    <div className="reviva-shell" style={{
      "--role-primary": colors.primary, "--role-primary-dark": colors.primaryDark, "--role-soft": colors.soft,
      "--font-display": "'Fraunces', ui-serif, Georgia, serif", "--font-ui": "'Inter', ui-sans-serif, system-ui, sans-serif",
      minHeight: "100vh", background: "radial-gradient(circle at 20% 10%, #F3F1E6, #E9ECE3 60%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 20px", fontFamily: "var(--font-ui)",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #B7BBAF; }

        .reviva-phone-outer {
          width: 390px; height: 812px; border-radius: 46px; background: #0E120F; padding: 12px;
          box-shadow: 0 30px 60px -12px rgba(20,30,20,.35), 0 0 0 1px rgba(0,0,0,.05);
          position: relative;
        }
        .reviva-notch {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 120px; height: 26px; background: #0E120F; border-radius: 14px; margin-top: 8px; z-index: 50;
        }

        /* Em telas de celular a moldura decorativa vira a própria tela do app,
           ocupando 100% da viewport, sem padding/borda e sem precisar rolar
           pra enxergar o app inteiro. */
        @media (max-width: 480px) {
          html, body, #root { height: 100%; }
          .reviva-shell { min-height: 100dvh; padding: 0 !important; }
          .reviva-phone-outer {
            width: 100vw; height: 100dvh; border-radius: 0; padding: 0; box-shadow: none;
          }
          .reviva-phone-inner { border-radius: 0 !important; }
          .reviva-notch { display: none; }
        }
      `}</style>

      <div className="reviva-phone-outer">
        <div className="reviva-phone-inner" style={{ width: "100%", height: "100%", borderRadius: 34, background: "var(--role-primary)", overflow: "hidden", position: "relative", transition: "background .3s" }}>
          <div style={{ width: "100%", height: "100%", background: "#FBFAF4", display: "flex", flexDirection: "column", position: "relative" }}>
            <div className="reviva-notch" />
            <StatusBar />
            <div style={{ flex: 1, overflowY: "auto" }}>
              {ScreenView}
            </div>
            {showNav && <BottomNav active={screen} go={go} />}
            <Toast text={toast} show={!!toast} />
          </div>
        </div>
      </div>
    </div>
  );
}
