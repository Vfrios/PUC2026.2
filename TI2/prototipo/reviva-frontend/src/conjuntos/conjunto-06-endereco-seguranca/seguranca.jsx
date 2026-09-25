import React, { useState, useEffect } from "react";
import { api, setToken } from "../../api.js";
import { Bell, ChevronRight, CheckCircle2, Eye, EyeOff, FileText, KeyRound, Lock, LogOut, Settings, ShieldCheck, Smartphone } from "lucide-react";
import { Button, Chip, EmptyState, ErrorBox, fieldBox, fieldInput, fieldLabel, FieldError, INK, INK_SOFT, Loading, NOTIF_ICONS, SectionTitle, timeAgo, Toggle, TopBar, useApiData } from "../../shared/shared.jsx";

const card = { background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 };
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
              <Toggle
                checked={permissaoNavegador === "granted"}
                disabled={permissaoNavegador !== "default"}
                onChange={ativar => { if (ativar) pedirPermissao(); }}
                label="Alertas do navegador"
              />
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

/* ---- NOTIFICAÇÕES ---- */
function Notificacoes({ go, usuario }) {
  const [aba, setAba] = useState("naoLidas");
  const { loading, error, data: notificacoes, reload } = useApiData(() => api.notificacoes({ todas: aba === "todas" }), [usuario?.id, aba]);
  const [acao, setAcao] = useState(false);
  const [acaoErro, setAcaoErro] = useState("");
  const lista = aba === "todas" ? (notificacoes || []) : (notificacoes || []).filter(n => !n.lida);
  const naoLidas = lista.filter(n => !n.lida);
  const expiradas = lista.filter(n => n.expirada);

  const abrirChat = (n) => {
    const souDoador = n.item?.doador?.id === usuario?.id;
    go(souDoador ? "chatDoador" : "chatReceptor", {
      solicitacaoId: n.solicitacaoId,
      otherId: souDoador ? n.receptor?.id : n.item?.doador?.id,
      otherName: souDoador ? n.receptor?.nome : n.item?.doador?.nome,
      itemTitulo: n.item?.titulo,
      itemId: n.item?.id,
    });
  };

  const abrir = async (n) => {
    try {
      if (!n.lida) await api.marcarNotificacaoLida(n.id);
      if (n.solicitacaoId) return abrirChat(n);
      if (n.tipo === "AVALIACAO") return go("reputacao");
      if (n.tipo === "COMUNIDADE") return go("comunidades");
      await reload({ silent: true });
    } catch (e) { setAcaoErro(e.message || "Não foi possível abrir a notificação."); }
  };

  const executar = async (fn) => {
    setAcao(true);
    setAcaoErro("");
    try { await fn(); await reload(); }
    catch (e) { setAcaoErro(e.message || "Não foi possível atualizar as notificações."); }
    finally { setAcao(false); }
  };

  return (
    <div>
      <TopBar title="Notificações" onBack={() => go(-1)} right={<Settings size={18} color={INK} style={{ cursor: "pointer" }} onClick={() => go("seguranca", { secao: "notificacoes" })} />} />
      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Chip active={aba === "naoLidas"} onClick={() => setAba("naoLidas")}>Não lidas</Chip>
          <Chip active={aba === "todas"} onClick={() => setAba("todas")}>Todas</Chip>
        </div>
        <div style={{ fontSize: 11.5, color: INK_SOFT, lineHeight: 1.4 }}>O histórico das conversas fica em <b>Mensagens</b>. Escolha o que quer receber no ícone de ajustes.</div>
        {!loading && !error && (naoLidas.length > 0 || expiradas.length > 0) && (
          <div style={{ display: "flex", gap: 8 }}>
            {naoLidas.length > 0 && <Button small variant="ghost" loading={acao} onClick={() => executar(() => api.marcarTodasNotificacoesLidas())}>Marcar todas como lidas</Button>}
            {expiradas.length > 0 && <Button small variant="soft" loading={acao} onClick={() => executar(() => api.excluirNotificacoesExpiradas())}>Excluir expiradas</Button>}
          </div>
        )}
        {acaoErro && <ErrorBox message={acaoErro} />}
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && lista.length === 0 && <EmptyState Icon={Bell} text={aba === "todas" ? "Você ainda não recebeu notificações." : "Nenhuma notificação não lida."} />}
        {lista.map(n => {
          const Icon = NOTIF_ICONS[n.tipo] || Bell;
          return (
            <div key={n.id} onClick={() => abrir(n)} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: n.lida ? "#fff" : "var(--role-soft)", border: "1px solid #EDEBE1", borderRadius: 14, padding: 12, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: n.lida ? "#F4F3EC" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color={n.lida ? INK_SOFT : "var(--role-primary-dark)"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: INK, fontWeight: n.lida ? 500 : 700, lineHeight: 1.35 }}>{n.titulo}</div>
                {n.item?.titulo && <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 2 }}>{n.item.titulo}</div>}
                <div style={{ fontSize: 11, color: n.expirada ? "#9C4327" : INK_SOFT, marginTop: 3 }}>{n.expirada ? "expirada" : `há ${timeAgo(n.criadaEm)}`}{n.lida ? " · lida" : ""}</div>
              </div>
              {!n.lida && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--role-primary)", marginTop: 6 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Seguranca, Termos, Privacidade, Notificacoes };
