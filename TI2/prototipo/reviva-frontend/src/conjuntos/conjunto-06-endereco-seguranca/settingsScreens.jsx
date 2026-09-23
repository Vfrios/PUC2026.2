import React, { useState, useEffect } from "react";
import { api, setToken } from "../../api.js";
import { MapPin, Plus, Star, Pencil, Trash2, CheckCircle2, Lock, Eye, EyeOff, Bell, Smartphone, ShieldCheck, LogOut, FileText, ChevronRight, KeyRound, Loader2, Home, Briefcase, GraduationCap } from "lucide-react";
import { INK, INK_SOFT, formatCep, onlyDigits, useApiData, Button, Chip, SectionTitle, Loading, ErrorBox, TopBar, fieldLabel, fieldBox, fieldInput, EmptyState, FieldError, Toggle, Checkbox } from "../../shared/shared.jsx";

const card = { background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 };

/* ---- ENDEREÇOS SALVOS ---- */
const APELIDOS = [
  { label: "Casa", Icon: Home },
  { label: "Trabalho", Icon: Briefcase },
  { label: "Faculdade", Icon: GraduationCap },
];

const VAZIO = { apelido: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", latitude: null, longitude: null, principal: false };

function iconeDoApelido(apelido) {
  return APELIDOS.find(a => a.label.toLowerCase() === (apelido || "").toLowerCase())?.Icon || MapPin;
}

function resumoEndereco(e) {
  return [
    e.logradouro && `${e.logradouro}${e.numero ? `, ${e.numero}` : ""}${e.complemento ? ` - ${e.complemento}` : ""}`,
    e.bairro,
    e.cidade && `${e.cidade}/${e.uf}`,
  ].filter(Boolean).join(" · ");
}

function FormEndereco({ inicial, primeiro, onCancelar, onSalvo, notify }) {
  const [form, setForm] = useState({ ...VAZIO, ...inicial, cep: formatCep(inicial?.cep || "") });
  const [erros, setErros] = useState({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  const consultarCep = async (cep) => {
    if (onlyDigits(cep).length !== 8) return;
    setBuscandoCep(true);
    setErros(e => ({ ...e, cep: undefined }));
    try {
      const r = await api.buscarCep(cep);
      setForm(f => ({ ...f, logradouro: r.logradouro || f.logradouro, bairro: r.bairro || f.bairro, cidade: r.cidade || f.cidade, uf: r.uf || f.uf, latitude: r.latitude, longitude: r.longitude }));
    } catch (e) { setErros(er => ({ ...er, cep: e.message || "CEP não encontrado." })); }
    finally { setBuscandoCep(false); }
  };

  const validar = () => {
    const e = {};
    if (!form.apelido.trim()) e.apelido = "Dê um apelido, como Casa ou Trabalho.";
    if (onlyDigits(form.cep).length !== 8) e.cep = "Informe um CEP com 8 dígitos.";
    if (!form.logradouro.trim()) e.logradouro = "Informe a rua.";
    if (!form.bairro.trim()) e.bairro = "Informe o bairro.";
    if (!form.cidade.trim()) e.cidade = "Informe a cidade.";
    if (!/^[A-Za-z]{2}$/.test(form.uf.trim())) e.uf = "UF com 2 letras.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const salvar = async () => {
    if (!validar()) return;
    setSalvando(true);
    const payload = { ...form, cep: onlyDigits(form.cep), uf: form.uf.toUpperCase() };
    try {
      const salvo = inicial?.id ? await api.editarEndereco(inicial.id, payload) : await api.criarEndereco(payload);
      notify(inicial?.id ? "Endereço atualizado." : "Endereço salvo.");
      onSalvo(salvo);
    } catch (e) { setErros({ geral: e.message || "Não foi possível salvar o endereço." }); }
    finally { setSalvando(false); }
  };

  return (
    <div style={card}>
      <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{inicial?.id ? "Editar endereço" : "Novo endereço"}</div>
      <label style={fieldLabel}>Apelido</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        {APELIDOS.map(a => <Chip key={a.label} active={form.apelido === a.label} onClick={() => set("apelido", a.label)}>{a.label}</Chip>)}
      </div>
      <div style={fieldBox}><input value={form.apelido} maxLength={30} onChange={e => set("apelido", e.target.value)} placeholder="Ex.: Casa da vó" style={fieldInput} /></div>
      <FieldError>{erros.apelido}</FieldError>

      <label style={fieldLabel}>CEP</label>
      <div style={fieldBox}>
        <input value={form.cep} inputMode="numeric" placeholder="00000-000" onChange={e => { const v = formatCep(e.target.value); set("cep", v); if (onlyDigits(v).length === 8) consultarCep(v); }} style={fieldInput} />
        {buscandoCep && <Loader2 size={15} color={INK_SOFT} style={{ animation: "spin 1s linear infinite" }} />}
      </div>
      <FieldError>{erros.cep}</FieldError>
      {!erros.cep && <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 4 }}>Rua, bairro e cidade são preenchidos pelo CEP.</div>}

      <label style={fieldLabel}>Rua</label>
      <div style={fieldBox}><input value={form.logradouro} maxLength={120} onChange={e => set("logradouro", e.target.value)} style={fieldInput} /></div>
      <FieldError>{erros.logradouro}</FieldError>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ width: 100 }}>
          <label style={fieldLabel}>Número</label>
          <div style={fieldBox}><input value={form.numero || ""} maxLength={10} onChange={e => set("numero", e.target.value)} style={fieldInput} /></div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={fieldLabel}>Complemento</label>
          <div style={fieldBox}><input value={form.complemento || ""} maxLength={60} placeholder="Apto, bloco..." onChange={e => set("complemento", e.target.value)} style={fieldInput} /></div>
        </div>
      </div>

      <label style={fieldLabel}>Bairro</label>
      <div style={fieldBox}><input value={form.bairro} maxLength={80} onChange={e => set("bairro", e.target.value)} style={fieldInput} /></div>
      <FieldError>{erros.bairro}</FieldError>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={fieldLabel}>Cidade</label>
          <div style={fieldBox}><input value={form.cidade} maxLength={80} onChange={e => set("cidade", e.target.value)} style={fieldInput} /></div>
          <FieldError>{erros.cidade}</FieldError>
        </div>
        <div style={{ width: 70 }}>
          <label style={fieldLabel}>UF</label>
          <div style={fieldBox}><input value={form.uf} maxLength={2} onChange={e => set("uf", e.target.value.toUpperCase())} style={fieldInput} /></div>
          <FieldError>{erros.uf}</FieldError>
        </div>
      </div>

      {!primeiro && !inicial?.principal && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <Checkbox checked={!!form.principal} onChange={v => set("principal", v)} label="Usar como endereço padrão" />
          <span style={{ fontSize: 12.5, color: INK }}>Usar como endereço padrão</span>
        </div>
      )}
      {primeiro && <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 10 }}>Seu primeiro endereço vira o padrão automaticamente.</div>}
      {erros.geral && <FieldError>{erros.geral}</FieldError>}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Button small variant="ghost" onClick={onCancelar}>Cancelar</Button>
        <Button small icon={CheckCircle2} loading={salvando} onClick={salvar}>Salvar endereço</Button>
      </div>
    </div>
  );
}

function Enderecos({ go, notify, usuario, refreshUsuario }) {
  const { loading, error, data, reload } = useApiData(() => api.enderecos(), [usuario?.id]);
  const [editando, setEditando] = useState(null);
  const [processando, setProcessando] = useState(null);
  const lista = data || [];
  const temCadastroAntigo = lista.length === 0 && usuario?.cep && usuario?.cidade;

  const aposMudanca = async () => {
    setEditando(null);
    await reload({ silent: true });
    refreshUsuario?.();
  };

  const tornarPadrao = async (e) => {
    setProcessando(e.id);
    try { await api.definirEnderecoPrincipal(e.id); notify(`"${e.apelido}" agora é o endereço padrão.`); await aposMudanca(); }
    catch (err) { notify(err.message || "Não foi possível alterar o padrão."); }
    finally { setProcessando(null); }
  };

  const excluir = async (e) => {
    const aviso = e.principal && lista.length > 1 ? " Outro endereço vai virar o padrão." : "";
    if (!window.confirm(`Excluir o endereço "${e.apelido}"?${aviso}`)) return;
    setProcessando(e.id);
    try { await api.excluirEndereco(e.id); notify("Endereço excluído."); await aposMudanca(); }
    catch (err) { notify(err.message || "Não foi possível excluir."); }
    finally { setProcessando(null); }
  };

  return (
    <div>
      <TopBar title="Endereços salvos" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 12, color: INK_SOFT, lineHeight: 1.45 }}>Os endereços salvos aparecem como atalho ao publicar um item e ao agendar uma retirada. O endereço exato só é compartilhado quando você envia no chat.</div>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}

        {editando ? (
          <FormEndereco inicial={editando === "novo" ? null : editando} primeiro={lista.length === 0} notify={notify} onCancelar={() => setEditando(null)} onSalvo={aposMudanca} />
        ) : (
          <>
            {!loading && !error && lista.length === 0 && (
              <>
                <EmptyState Icon={MapPin} text="Você ainda não salvou nenhum endereço." />
                {temCadastroAntigo && (
                  <div style={{ ...card, background: "var(--role-soft)", borderColor: "transparent" }}>
                    <div style={{ fontSize: 12.5, color: "var(--role-primary-dark)" }}>Encontramos o endereço do seu cadastro: <b>{resumoEndereco(usuario)}</b></div>
                    <div style={{ marginTop: 8 }}>
                      <Button small variant="soft" onClick={() => setEditando({ ...VAZIO, apelido: "Casa", cep: usuario.cep, logradouro: usuario.logradouro || "", numero: usuario.numero || "", complemento: usuario.complemento || "", bairro: usuario.bairro || "", cidade: usuario.cidade, uf: usuario.uf || "", latitude: usuario.latitude, longitude: usuario.longitude })}>Salvar como "Casa"</Button>
                    </div>
                  </div>
                )}
              </>
            )}
            {lista.map(e => {
              const Icon = iconeDoApelido(e.apelido);
              return (
                <div key={e.id} style={{ ...card, borderColor: e.principal ? "var(--role-primary)" : "#EDEBE1" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={16} color="var(--role-primary-dark)" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{e.apelido}</span>
                        {e.principal && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--role-primary-dark)", background: "var(--role-soft)", borderRadius: 999, padding: "2px 8px" }}>padrão</span>}
                      </div>
                      <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 3, lineHeight: 1.4 }}>{resumoEndereco(e)}</div>
                      <div style={{ fontSize: 11, color: INK_SOFT }}>CEP {formatCep(e.cep)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {!e.principal && <Button small variant="soft" icon={Star} loading={processando === e.id} onClick={() => tornarPadrao(e)}>Tornar padrão</Button>}
                    <Button small variant="ghost" icon={Pencil} onClick={() => setEditando(e)}>Editar</Button>
                    <Button small variant="ghost" icon={Trash2} onClick={() => excluir(e)}>Excluir</Button>
                  </div>
                </div>
              );
            })}
            {!loading && !error && lista.length < 10 && <Button full variant="soft" icon={Plus} onClick={() => setEditando("novo")}>Adicionar endereço</Button>}
          </>
        )}
      </div>
    </div>
  );
}

/* ---- SEGURANÇA ---- */
const PREFERENCIAS = [
  { key: "chat", label: "Mensagens", desc: "Novas mensagens nas suas conversas" },
  { key: "agendamentos", label: "Agendamentos", desc: "Retiradas agendadas, confirmadas ou canceladas" },
  { key: "avaliacoes", label: "Avaliações", desc: "Quando alguém avaliar você" },
  { key: "comunidades", label: "Comunidades", desc: "Publicações nos grupos que você participa" },
  { key: "novidades", label: "Sugestões e novidades", desc: "Itens que combinam com você e novidades do Reviva" },
];

function descreverDispositivo() {
  const ua = navigator.userAgent;
  const navegador = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navegador";
  const sistema = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "dispositivo";
  return `${navegador} no ${sistema}`;
}

function forcaSenha(s) {
  let pontos = 0;
  if (s.length >= 8) pontos++;
  if (s.length >= 12) pontos++;
  if (/[A-Za-z]/.test(s) && /\d/.test(s)) pontos++;
  if (/[^A-Za-z0-9]/.test(s) || (/[a-z]/.test(s) && /[A-Z]/.test(s))) pontos++;
  return [
    { label: "muito fraca", cor: "#C0392B" }, { label: "fraca", cor: "#E67E22" }, { label: "razoável", cor: "#F2A93C" },
    { label: "boa", cor: "#6AA84F" }, { label: "forte", cor: "#1F6E43" },
  ][pontos];
}

function CampoSenha({ label, value, onChange, erro, autoComplete }) {
  const [ver, setVer] = useState(false);
  return (
    <>
      <label style={fieldLabel}>{label}</label>
      <div style={fieldBox}>
        <Lock size={15} color={INK_SOFT} />
        <input type={ver ? "text" : "password"} value={value} autoComplete={autoComplete} onChange={e => onChange(e.target.value)} style={fieldInput} />
        <button type="button" onClick={() => setVer(v => !v)} aria-label={ver ? "Ocultar senha" : "Mostrar senha"} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex" }}>{ver ? <EyeOff size={15} color={INK_SOFT} /> : <Eye size={15} color={INK_SOFT} />}</button>
      </div>
      <FieldError>{erro}</FieldError>
    </>
  );
}

function AlterarSenha({ notify }) {
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ atual: "", nova: "", confirmar: "" });
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const forca = form.nova ? forcaSenha(form.nova) : null;

  const salvar = async () => {
    const e = {};
    if (!form.atual) e.atual = "Informe sua senha atual.";
    if (form.nova.length < 8) e.nova = "Mínimo de 8 caracteres.";
    else if (!/[A-Za-z]/.test(form.nova) || !/\d/.test(form.nova)) e.nova = "Use letras e números.";
    else if (form.nova === form.atual) e.nova = "A nova senha precisa ser diferente da atual.";
    if (form.confirmar !== form.nova) e.confirmar = "As senhas não coincidem.";
    setErros(e);
    if (Object.keys(e).length) return;
    setSalvando(true);
    try {
      const res = await api.alterarSenha(form.atual, form.nova);
      if (res?.token) setToken(res.token);
      setForm({ atual: "", nova: "", confirmar: "" });
      setAberto(false);
      notify("Senha alterada. Outros dispositivos foram desconectados.");
    } catch (err) {
      setErros(err.status === 400 && /atual/i.test(err.message) ? { atual: err.message } : { geral: err.message || "Não foi possível alterar a senha." });
    } finally { setSalvando(false); }
  };

  if (!aberto) {
    return (
      <div onClick={() => setAberto(true)} style={{ ...card, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <KeyRound size={17} color="var(--role-primary)" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>Alterar senha</div>
          <div style={{ fontSize: 11, color: INK_SOFT }}>Recomendado a cada poucos meses</div>
        </div>
        <ChevronRight size={15} color={INK_SOFT} />
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>Alterar senha</div>
      <CampoSenha label="Senha atual" value={form.atual} autoComplete="current-password" onChange={v => setForm(f => ({ ...f, atual: v }))} erro={erros.atual} />
      <CampoSenha label="Nova senha" value={form.nova} autoComplete="new-password" onChange={v => setForm(f => ({ ...f, nova: v }))} erro={erros.nova} />
      {forca && <div style={{ fontSize: 11, color: forca.cor, marginTop: 4, fontWeight: 600 }}>Força: {forca.label}</div>}
      <CampoSenha label="Confirmar nova senha" value={form.confirmar} autoComplete="new-password" onChange={v => setForm(f => ({ ...f, confirmar: v }))} erro={erros.confirmar} />
      {erros.geral && <FieldError>{erros.geral}</FieldError>}
      <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 8 }}>Ao trocar a senha, as sessões em outros dispositivos são encerradas.</div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Button small variant="ghost" onClick={() => { setAberto(false); setErros({}); }}>Cancelar</Button>
        <Button small icon={CheckCircle2} loading={salvando} onClick={salvar}>Salvar nova senha</Button>
      </div>
    </div>
  );
}

function Seguranca({ go, notify, usuario }) {
  const prefs = useApiData(() => api.preferencias(), [usuario?.id]);
  const [preferencias, setPreferencias] = useState(null);
  const [permissaoNavegador, setPermissaoNavegador] = useState(() => (typeof Notification !== "undefined" ? Notification.permission : "unsupported"));
  const [encerrando, setEncerrando] = useState(false);
  useEffect(() => { if (prefs.data) setPreferencias(prefs.data); }, [prefs.data]);

  const alterarPreferencia = async (key, valor) => {
    const anterior = preferencias;
    const proximo = { ...preferencias, [key]: valor };
    setPreferencias(proximo);
    try { setPreferencias(await api.salvarPreferencias(proximo)); }
    catch (e) { setPreferencias(anterior); notify(e.message || "Não foi possível salvar a preferência."); }
  };

  const pedirPermissao = async () => {
    if (typeof Notification === "undefined") return;
    const r = await Notification.requestPermission();
    setPermissaoNavegador(r);
    notify(r === "granted" ? "Alertas do navegador ativados." : "Permissão não concedida. Você pode liberar nas configurações do navegador.");
  };

  const encerrarSessoes = async () => {
    if (!window.confirm("Desconectar sua conta de todos os outros dispositivos? Este aparelho continua conectado.")) return;
    setEncerrando(true);
    try {
      const res = await api.encerrarOutrasSessoes();
      if (res?.token) setToken(res.token);
      notify("Outros dispositivos foram desconectados.");
    } catch (e) { notify(e.message || "Não foi possível encerrar as sessões."); }
    finally { setEncerrando(false); }
  };

  return (
    <div>
      <TopBar title="Segurança e privacidade" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 24px" }}>
        <SectionTitle>Acesso à conta</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ ...card, fontSize: 12.5, color: INK, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: INK_SOFT }}>E-mail</span><span>{usuario?.email} {usuario?.emailVerificado ? <CheckCircle2 size={12} color="var(--role-primary)" /> : <span style={{ fontSize: 10.5, color: "#B7791F" }}>(não verificado)</span>}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: INK_SOFT }}>Celular</span><span>{usuario?.telefone ? (usuario.telefoneVerificado ? "verificado" : "não verificado") : "não informado"}</span></div>
          </div>
          <AlterarSenha notify={notify} />
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 12, opacity: 0.75 }}>
            <ShieldCheck size={17} color={INK_SOFT} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>Verificação em duas etapas</div>
              <div style={{ fontSize: 11, color: INK_SOFT }}>Ainda não disponível neste protótipo.</div>
            </div>
            <Toggle checked={false} disabled onChange={() => {}} label="Verificação em duas etapas" />
          </div>
        </div>

        <SectionTitle>Sessões e dispositivos</SectionTitle>
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Smartphone size={18} color="var(--role-primary)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{descreverDispositivo()}</div>
              <div style={{ fontSize: 11, color: "var(--role-primary-dark)", fontWeight: 600 }}>Este dispositivo · ativo agora</div>
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: INK_SOFT, margin: "10px 0" }}>Entrou em outro celular ou computador e esqueceu de sair? Encerre todas as outras sessões de uma vez.</div>
          <Button small variant="ghost" icon={LogOut} loading={encerrando} onClick={encerrarSessoes}>Sair de todos os outros dispositivos</Button>
        </div>

        <SectionTitle>Notificações</SectionTitle>
        {prefs.loading && <Loading />}
        {prefs.error && <ErrorBox message={prefs.error} onRetry={prefs.reload} />}
        {preferencias && (
          <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
            {PREFERENCIAS.map(p => (
              <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: INK_SOFT }}>{p.desc}</div>
                </div>
                <Toggle checked={!!preferencias[p.key]} onChange={v => alterarPreferencia(p.key, v)} label={p.label} />
              </div>
            ))}
            <div style={{ borderTop: "1px solid #F0EEE4", paddingTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <Bell size={16} color="var(--role-primary)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>Alertas do navegador</div>
                <div style={{ fontSize: 11, color: INK_SOFT }}>
                  {permissaoNavegador === "granted" ? "Ativados: avisamos novas mensagens mesmo com a aba em segundo plano."
                    : permissaoNavegador === "denied" ? "Bloqueados nas configurações do navegador."
                    : permissaoNavegador === "unsupported" ? "Este navegador não suporta alertas."
                    : "Receba um aviso quando chegar mensagem com o app em segundo plano."}
                </div>
              </div>
              {permissaoNavegador === "default" && <Button small variant="soft" onClick={pedirPermissao}>Ativar</Button>}
            </div>
          </div>
        )}

        <SectionTitle>Termos e privacidade</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ label: "Termos de uso", to: "termos" }, { label: "Política de privacidade", to: "privacidade" }].map(l => (
            <div key={l.to} onClick={() => go(l.to)} style={{ ...card, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <FileText size={17} color="var(--role-primary)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: INK, flex: 1 }}>{l.label}</span>
              <ChevronRight size={15} color={INK_SOFT} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- TERMOS / PRIVACIDADE ---- */
function Documento({ go, titulo, atualizadoEm, secoes, rodape }) {
  return (
    <div>
      <TopBar title={titulo} onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 28px" }}>
        <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 12 }}>Última atualização: {atualizadoEm}</div>
        {secoes.map((s, i) => (
          <div key={s.t} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 6 }}>{i + 1}. {s.t}</div>
            {s.p.map((p, j) => <p key={j} style={{ fontSize: 12.5, color: INK, lineHeight: 1.55, margin: "0 0 6px" }}>{p}</p>)}
          </div>
        ))}
        {rodape}
      </div>
    </div>
  );
}

function Termos({ go }) {
  return (
    <Documento go={go} titulo="Termos de uso" atualizadoEm="22/09/2026" secoes={[
      { t: "Sobre o Reviva", p: ["O Reviva conecta pessoas que querem doar ou trocar itens usados com quem precisa deles, reduzindo o descarte e fortalecendo a vizinhança.", "Este é um protótipo acadêmico (PUC Minas · Trabalho Interdisciplinar II)."] },
      { t: "Cadastro e conta", p: ["Você precisa ter 18 anos ou mais e informar dados verdadeiros.", "Sua conta é pessoal. Guarde sua senha e use \"Sair de todos os outros dispositivos\" se suspeitar de acesso indevido."] },
      { t: "Anúncios", p: ["Anuncie apenas itens que são seus, em condições de uso e descritos com honestidade (fotos reais, estado de conservação correto).", "É proibido anunciar itens ilegais, perigosos, falsificados, alimentos perecíveis, medicamentos ou animais.", "Doações são gratuitas: não é permitido cobrar pelo item ou pela retirada."] },
      { t: "Solicitações e retiradas", p: ["O anunciante escolhe para quem doar e pode recusar solicitações.", "Combine a retirada em local público e movimentado sempre que possível. Confirme a retirada no app para registrar o impacto.", "Cancelamentos devem ser avisados pelo chat com antecedência."] },
      { t: "Avaliações e reputação", p: ["Cada participante pode avaliar a outra pessoa uma única vez por troca concluída.", "Avaliações devem refletir a experiência real. Ofensas, ameaças ou avaliações combinadas podem ser removidas."] },
      { t: "Conduta e denúncias", p: ["Respeite as outras pessoas. Assédio, discriminação e golpes resultam em suspensão.", "Use \"Reportar problema\" no chat para denunciar; nossa equipe analisa em até 24h."] },
      { t: "Responsabilidade", p: ["O Reviva não é parte das trocas e não garante o estado dos itens, mas colabora com a apuração de denúncias."] },
    ]} rodape={<div style={{ fontSize: 12, color: INK_SOFT }}>Veja também a <span onClick={() => go("privacidade")} style={{ color: "var(--role-primary)", fontWeight: 700, cursor: "pointer" }}>Política de privacidade</span>.</div>} />
  );
}

function Privacidade({ go }) {
  return (
    <Documento go={go} titulo="Política de privacidade" atualizadoEm="22/09/2026" secoes={[
      { t: "Quais dados coletamos", p: ["Cadastro: nome, e-mail, CPF, celular e senha (guardada apenas como hash criptográfico).", "Uso: itens publicados, solicitações, mensagens, agendamentos, avaliações, favoritos e comunidades.", "Localização: CEP, endereços salvos e, se você permitir, a localização do navegador para sugerir itens próximos."] },
      { t: "Para que usamos", p: ["Operar o app: mostrar itens perto de você, permitir conversas e retiradas, calcular reputação e impacto ambiental.", "Segurança: prevenir fraudes, anúncios duplicados e acessos indevidos.", "Notificações: somente as categorias que você mantiver ativas em Segurança e privacidade."] },
      { t: "O que outras pessoas veem", p: ["No perfil público: nome, foto, cidade, selo, nota, número de doações e avaliações recebidas.", "Nunca exibimos e-mail, CPF, celular ou endereço completo. O local de retirada só é compartilhado quando você o envia no chat."] },
      { t: "Compartilhamento", p: ["Não vendemos seus dados. Usamos serviços públicos de CEP (ViaCEP) e de localidades (IBGE) apenas com o CEP ou as coordenadas, sem identificar você."] },
      { t: "Seus direitos (LGPD)", p: ["Você pode acessar e corrigir seus dados no Perfil, gerenciar endereços e preferências de notificação, e encerrar sessões.", "Para excluir sua conta ou exportar seus dados, entre em contato com a equipe do projeto."] },
      { t: "Retenção", p: ["Notificações expiram após 30 dias. Mensagens e avaliações ficam guardadas enquanto a conta existir, para segurança das trocas."] },
    ]} rodape={<div style={{ fontSize: 12, color: INK_SOFT }}>Veja também os <span onClick={() => go("termos")} style={{ color: "var(--role-primary)", fontWeight: 700, cursor: "pointer" }}>Termos de uso</span>.</div>} />
  );
}

export { Enderecos, Seguranca, Termos, Privacidade };
