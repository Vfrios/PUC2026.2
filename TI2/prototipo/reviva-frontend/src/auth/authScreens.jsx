import React, { useState, useEffect, useRef, useCallback } from "react";
import { api, getToken, setToken, ApiError, wsUrl } from "../api.js";
import { Client as StompClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Home, Plus, Search, MapPin, User, Bell, Heart, MessageCircle, Star, QrCode, Users, Settings, ChevronLeft, Camera, Send, Award, Leaf, AlertTriangle, ChevronRight, Recycle, Gift, Share2, Flag, Shirt, BookOpen, Sofa, Baby, Zap, UtensilsCrossed, Calendar, Clock, LogIn, Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, ArrowLeftRight, ImagePlus, LogOut, Loader2, UserPlus, Trash2, Pencil, CheckCircle2, Archive, RotateCcw, X } from "lucide-react";
import { ROLE_COLORS, GOLD, INK, INK_SOFT, CATS, ESTADOS, CO2_ESTIMADO, BADGES, MOTIVOS_DENUNCIA, NOTIF_ICONS, COMMUNITY_POSTS, capitalize, timeAgo, fmtDateTime, badgeIndex, onlyDigits, distanciaKm, formatDocumento, formatCep, formatCelular, documentoValido, comprimirImagem, useApiData, Button, Chip, Avatar, Stars, SectionTitle, ImpactRing, ItemCard, Toast, Loading, ErrorBox, StatusBar, TopBar, BottomNav, Screen, iconBtn, linkText, fieldLabel, fieldBox, fieldInput, EmptyState, StatBox } from "../shared/shared.jsx";
function Splash({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); }, []);
  return (
    <div onClick={onDone} style={{
      height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#1F6E43,#123F27)", color: "#fff", gap: 14, cursor: "pointer",
    }}>
      <TopBar title="Reviva" />
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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [endereco, setEndereco] = useState(null);
  const [cepBuscando, setCepBuscando] = useState(false);
  const [cepErro, setCepErro] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const cepDigits = onlyDigits(cep).slice(0, 8);

  useEffect(() => {
    if (mode !== "registro" || cepDigits.length !== 8) {
      setEndereco(null);
      setCepErro("");
      setCepBuscando(false);
      return;
    }
    let cancelado = false;
    setCepBuscando(true);
    setCepErro("");
    api.buscarCep(cepDigits)
      .then(res => {
        if (cancelado) return;
        setEndereco(res);
        if (res) {
          setLogradouro(res.logradouro || "");
          setBairro(res.bairro || "");
          setCidade(res.cidade || "");
          setUf((res.uf || "").toUpperCase());
        }
      })
      .catch(e => {
        if (cancelado) return;
        setEndereco(null);
        setCepErro(e.message || "CEP não encontrado. Confira o CEP informado.");
      })
      .finally(() => { if (!cancelado) setCepBuscando(false); });
    return () => { cancelado = true; };
  }, [mode, cepDigits]);

  const submit = async () => {
    setErro("");
    if (!email || !senha || (mode === "registro" && (!nome || !documento || !telefone || !numero))) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    if (mode === "registro" && senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (mode === "registro" && !documentoValido(documento)) {
      setErro("Informe um CPF ou CNPJ válido.");
      return;
    }
    if (mode === "registro" && onlyDigits(telefone).length < 10) {
      setErro("Informe um celular válido com DDD e número.");
      return;
    }
    if (mode === "registro" && cepDigits.length !== 8 && (!logradouro.trim() || !bairro.trim() || !cidade.trim() || !uf.trim())) {
      setErro("Informe o CEP ou preencha rua, bairro, cidade e UF manualmente.");
      return;
    }
    if (mode === "registro" && cepDigits.length !== 0 && cepDigits.length !== 8) {
      setErro("Informe um CEP válido com 8 dígitos.");
      return;
    }
    if (mode === "registro" && !/^\d+$/.test(numero.trim())) {
      setErro("O número do endereço deve conter apenas dígitos.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") await onLogin(email, senha);
      else await onRegister({
        nome: nome.trim(),
        email: email.trim(),
        cpf: onlyDigits(documento),
        celular: onlyDigits(telefone),
        telefone: onlyDigits(telefone),
        tipoPessoa: onlyDigits(documento).length === 11 ? "PF" : "PJ",
        cep: onlyDigits(cep),
        rua: logradouro.trim(),
        logradouro: logradouro.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        uf: uf.trim(),
        numero: numero.trim(),
        complemento: complemento.trim(),
        senha,
      });
    } catch (e) {
      setErro(e.status === 409
        ? "Este e-mail ou documento já está cadastrado. Troque para Entrar e use sua senha."
        : e.message || "Não foi possível continuar.");
      if (e.status === 409) setMode("login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "10px 22px 30px", height: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar title={mode === "login" ? "Entrar" : "Criar conta"} />
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
            <label style={fieldLabel}>CPF / CNPJ</label>
            <div style={fieldBox}><User size={16} color={INK_SOFT} /><input name="documento" autoComplete="off" value={formatDocumento(documento)} onChange={e => setDocumento(e.target.value)} placeholder="CPF ou CNPJ" inputMode="numeric" maxLength={18} style={fieldInput} /></div>
            <label style={fieldLabel}>Celular</label>
            <div style={fieldBox}><User size={16} color={INK_SOFT} /><input name="telefone" autoComplete="tel" value={formatCelular(telefone)} onChange={e => setTelefone(e.target.value)} placeholder="(31) 99999-9999" inputMode="tel" maxLength={15} style={fieldInput} /></div>
            <label style={fieldLabel}>CEP</label>
            <div style={fieldBox}>
              <MapPin size={16} color={INK_SOFT} />
              <input name="cep" autoComplete="postal-code" value={formatCep(cep)} onChange={e => setCep(e.target.value)} placeholder="00000-000" inputMode="numeric" maxLength={9} style={fieldInput} />
              {cepBuscando && <Loader2 size={15} color={INK_SOFT} style={{ animation: "spin .8s linear infinite" }} />}
            </div>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 4 }}>Digite o CEP para preencher automaticamente.</div>
            {cepErro && <div style={{ fontSize: 11.5, color: "#9C4327", marginTop: 4 }}>{cepErro}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              <div>
                <label style={fieldLabel}>UF</label>
                <div style={fieldBox}>
                  <input
                    name="uf"
                    autoComplete="address-level1"
                    value={uf}
                    onChange={e => setUf(e.target.value.toUpperCase())}
                    placeholder={endereco?.uf || "MG"}
                    maxLength={2}
                    disabled={cepBuscando || (!!cepDigits && !cepErro && !!endereco)}
                    style={{ ...fieldInput, opacity: (cepBuscando || (!!cepDigits && !cepErro && !!endereco)) ? 0.7 : 1 }}
                  />
                </div>
              </div>
              <div>
                <label style={fieldLabel}>Cidade</label>
                <div style={fieldBox}>
                  <input
                    name="cidade"
                    autoComplete="address-level2"
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    placeholder={endereco?.cidade || "Cidade"}
                    disabled={cepBuscando || (!!cepDigits && !cepErro && !!endereco)}
                    style={{ ...fieldInput, opacity: (cepBuscando || (!!cepDigits && !cepErro && !!endereco)) ? 0.7 : 1 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              <div>
                <label style={fieldLabel}>Bairro</label>
                <div style={fieldBox}><input name="bairro" autoComplete="address-level2" value={bairro} onChange={e => setBairro(e.target.value)} placeholder={endereco?.bairro || "Bairro"} style={fieldInput} /></div>
              </div>
              <div>
                <label style={fieldLabel}>Rua</label>
                <div style={fieldBox}><input name="logradouro" autoComplete="street-address" value={logradouro} onChange={e => setLogradouro(e.target.value)} placeholder={endereco?.logradouro || "Rua / Avenida"} style={fieldInput} /></div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              <div>
                <label style={fieldLabel}>Número</label>
                <div style={fieldBox}><input name="numero" autoComplete="address-line2" value={numero} onChange={e => setNumero(onlyDigits(e.target.value))} placeholder="Ex: 120" inputMode="numeric" pattern="[0-9]*" style={fieldInput} /></div>
              </div>
              <div>
                <label style={fieldLabel}>Complemento</label>
                <div style={fieldBox}><input name="complemento" autoComplete="address-line3" value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Opcional" style={fieldInput} /></div>
              </div>
            </div>
          </>
        )}
        <label style={fieldLabel}>E-mail</label>
        <div style={fieldBox}><Mail size={16} color={INK_SOFT} /><input type="email" name="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" style={fieldInput} /></div>
        <label style={fieldLabel}>Senha</label>
        <div style={fieldBox}>
          <Lock size={16} color={INK_SOFT} />
          <input type={mostrarSenha ? "text" : "password"} name="senha" autoComplete={mode === "registro" ? "new-password" : "current-password"} value={senha} onChange={e => setSenha(e.target.value)} placeholder={mode === "registro" ? "mínimo 8 caracteres" : "••••••••"} style={fieldInput} />
          <button type="button" onClick={() => setMostrarSenha(visivel => !visivel)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} style={{ border: "none", background: "none", padding: 0, color: INK_SOFT, cursor: "pointer", display: "flex" }}>
            {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {erro && <div style={{ marginTop: 10, fontSize: 12, color: "#9C4327", background: "#FBE8E0", padding: "8px 10px", borderRadius: 10 }}>{erro}</div>}

        <div style={{ marginTop: 18 }}>
          <Button full type="submit" icon={mode === "login" ? LogIn : UserPlus} loading={loading}>
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </div>
      </form>

      <div style={{ flex: 1 }} />
      <div style={{ textAlign: "center", fontSize: 13, color: INK_SOFT, marginTop: 20, marginBottom: 6 }}>
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
    { Icon: Leaf, title: "Veja seu impacto", text: "Acompanhe os quilos de materiais reutilizados, pessoas ajudadas e conquiste selos." },
  ];
  const s = slides[step];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "26px 26px 30px" }}>
      <TopBar title="Boas-vindas" />
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
      <TopBar title="Escolha seu perfil" />
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

export { Splash, Auth, Onboarding, ChooseProfile };
