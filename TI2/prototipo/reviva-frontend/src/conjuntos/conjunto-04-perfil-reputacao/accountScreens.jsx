import React, { useState, useEffect, useMemo, useRef } from "react";
import { api } from "../../api.js";
import { User, Bell, Heart, Star, Users, Camera, Send, Award, Leaf, ChevronRight, Recycle, Gift, Share2, Flag, Clock, ShieldCheck, LogOut, Trash2, Pencil, CheckCircle2, X, FileText, MapPin, Plus, Lock, Search, Calendar, Package, Trophy, AlertTriangle, Settings } from "lucide-react";
import { INK, INK_SOFT, CATS, BADGES, MOTIVOS_DENUNCIA, NOTIF_ICONS, timeAgo, badgeIndex, onlyDigits, formatCelular, comprimirImagem, useApiData, Button, Chip, Avatar, Stars, SectionTitle, ImpactRing, ItemCard, Loading, ErrorBox, TopBar, fieldLabel, fieldBox, fieldInput, EmptyState, StatBox, StatusBadge, statusDoItem, ETAPA_LABEL, compartilhar, FieldError, Checkbox, FotoPerfil, linkDoPerfil } from "../../shared/shared.jsx";

const card = { background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 };

const CATEGORIAS_AVALIACAO = [
  { key: "pontualidade", label: "Pontualidade" },
  { key: "comunicacao", label: "Comunicação" },
  { key: "estadoItem", label: "Item conforme anunciado" },
];

function MenuRow({ Icon, label, detail, onClick, danger }) {
  const cor = danger ? "#9C4327" : INK;
  return (
    <div onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && onClick?.()} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 14, padding: "12px 14px", cursor: "pointer" }}>
      <Icon size={17} color={danger ? cor : "var(--role-primary)"} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: cor }}>{label}</div>
        {detail && <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 2 }}>{detail}</div>}
      </div>
      {!danger && <ChevronRight size={15} color={INK_SOFT} />}
    </div>
  );
}

function BarraMedia({ label, valor }) {
  const pct = valor ? Math.min(1, valor / 5) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: INK, marginBottom: 4 }}>
        <span>{label}</span>
        <b>{valor ? valor.toFixed(1) : "—"}</b>
      </div>
      <div style={{ height: 7, borderRadius: 999, background: "#EDEBE1", overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: "var(--role-primary)", borderRadius: 999 }} />
      </div>
    </div>
  );
}

function AvaliacaoCard({ a }) {
  const categorias = CATEGORIAS_AVALIACAO.filter(c => a[c.key]);
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FotoPerfil usuario={a.avaliador} size={32} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{a.avaliador?.nome || "Usuário"}</div>
          <div style={{ fontSize: 11, color: INK_SOFT }}>{a.itemTitulo ? `"${a.itemTitulo}" · ` : ""}há {timeAgo(a.criadaEm)}</div>
        </div>
        <Stars value={a.nota} />
      </div>
      {a.comentario && <div style={{ fontSize: 12.5, color: INK, marginTop: 8, lineHeight: 1.45 }}>{a.comentario}</div>}
      {categorias.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {categorias.map(c => <span key={c.key} style={{ fontSize: 10.5, background: "var(--role-soft)", color: "var(--role-primary-dark)", borderRadius: 999, padding: "3px 8px", fontWeight: 600 }}>{c.label}: {a[c.key]}/5</span>)}
        </div>
      )}
    </div>
  );
}

/* ---- HISTÓRICO ---- */
const EVENTOS_HISTORICO = {
  PUBLICOU: { Icon: Plus, grupo: "doacoes" },
  DOOU: { Icon: Gift, grupo: "doacoes" },
  SOLICITOU: { Icon: Send, grupo: "solicitacoes" },
  RECEBEU: { Icon: CheckCircle2, grupo: "solicitacoes" },
  AVALIADO: { Icon: Star, grupo: "avaliacoes" },
};

function Historico({ go }) {
  const { loading, error, data: eventos, reload } = useApiData(() => api.meuHistorico(), []);
  const [filtro, setFiltro] = useState("todos");
  const lista = (eventos || []).filter(e => filtro === "todos" || EVENTOS_HISTORICO[e.tipo]?.grupo === filtro);

  const abrir = (e) => {
    if (e.solicitacaoId) go("solicitacao", { solicitacaoId: e.solicitacaoId, itemId: e.itemId });
    else if (e.itemId) go("detalhesItem", { itemId: e.itemId });
    else if (e.tipo === "AVALIADO") go("reputacao");
  };

  return (
    <div>
      <TopBar title="Histórico" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10 }}>
          {[["todos", "Tudo"], ["doacoes", "Anúncios e doações"], ["solicitacoes", "Solicitações"], ["avaliacoes", "Avaliações"]].map(([k, l]) => (
            <Chip key={k} active={filtro === k} onClick={() => setFiltro(k)}>{l}</Chip>
          ))}
        </div>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && lista.length === 0 && <EmptyState Icon={Clock} text={filtro === "todos" ? "Suas publicações, solicitações e avaliações aparecem aqui." : "Nada por aqui neste filtro."} />}
        <div style={{ position: "relative", paddingLeft: 18 }}>
          {lista.length > 0 && <div style={{ position: "absolute", left: 6, top: 8, bottom: 8, width: 2, background: "#EDEBE1" }} />}
          {lista.map((e, i) => {
            const Icon = EVENTOS_HISTORICO[e.tipo]?.Icon || Clock;
            const descricao = ETAPA_LABEL[e.descricao] || e.descricao;
            return (
              <div key={`${e.tipo}-${e.itemId || e.solicitacaoId || i}-${e.data}`} onClick={() => abrir(e)} style={{ position: "relative", marginBottom: 10, cursor: "pointer" }}>
                <div style={{ position: "absolute", left: -18, top: 14, width: 14, height: 14, borderRadius: "50%", background: "var(--role-primary)", border: "3px solid #FBFAF4" }} />
                <div style={{ ...card, display: "flex", gap: 10, alignItems: "center" }}>
                  <Icon size={16} color="var(--role-primary)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{e.titulo}</div>
                    <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 2 }}>{descricao}{e.data ? ` · ${new Date(e.data).toLocaleDateString("pt-BR")}` : ""}</div>
                  </div>
                  <ChevronRight size={15} color={INK_SOFT} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---- PERFIL ---- */
function checklistPerfil(usuario) {
  return [
    { ok: !!usuario?.fotoUrl, label: "Adicionar foto" },
    { ok: !!usuario?.telefone, label: "Informar celular" },
    { ok: !!(usuario?.cep && usuario?.cidade), label: "Cadastrar endereço", go: "enderecos" },
    { ok: !!usuario?.emailVerificado, label: "Verificar e-mail" },
  ];
}

async function dataUrlParaArquivo(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], "foto.jpg", { type: blob.type || "image/jpeg" });
}

function Perfil({ go, usuario, onLogout, favorites = {}, notify, refreshUsuario }) {
  const { data: meusItens } = useApiData(() => api.meusItens(), [usuario?.id]);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "" });
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const fotoRef = useRef(null);

  const salvarFoto = async (fotoUrl) => {
    await api.atualizarPerfil({ nome: usuario.nome, fotoUrl });
    await refreshUsuario?.();
  };

  // Fotos antigas ficavam só no navegador; envia para a conta uma única vez.
  useEffect(() => {
    const antiga = localStorage.getItem("reviva_foto_perfil");
    if (!antiga || !usuario?.id) return;
    if (usuario.fotoUrl) { localStorage.removeItem("reviva_foto_perfil"); return; }
    dataUrlParaArquivo(antiga)
      .then(arquivo => comprimirImagem(arquivo, 400, 0.8))
      .then(salvarFoto)
      .then(() => localStorage.removeItem("reviva_foto_perfil"))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id]);

  const escolherFoto = async (event) => {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;
    setEnviandoFoto(true);
    try {
      await salvarFoto(await comprimirImagem(arquivo, 400, 0.8));
      notify?.("Foto atualizada.");
    } catch (e) { notify?.(e.message || "Não foi possível atualizar a foto."); }
    finally { setEnviandoFoto(false); }
  };

  const removerFoto = async () => {
    if (!window.confirm("Remover sua foto de perfil?")) return;
    try { await salvarFoto(""); notify?.("Foto removida."); }
    catch (e) { notify?.(e.message || "Não foi possível remover a foto."); }
  };

  const abrirEdicao = () => {
    setForm({ nome: usuario?.nome || "", telefone: formatCelular(usuario?.telefone || "") });
    setErros({});
    setEditando(true);
  };

  const salvarDados = async () => {
    const e = {};
    if (form.nome.trim().length < 3) e.nome = "Informe seu nome completo.";
    const tel = onlyDigits(form.telefone);
    if (tel && tel.length !== 10 && tel.length !== 11) e.telefone = "Use DDD + número.";
    setErros(e);
    if (Object.keys(e).length) return;
    setSalvando(true);
    try {
      await api.atualizarPerfil({ nome: form.nome.trim(), telefone: tel });
      await refreshUsuario?.();
      setEditando(false);
      notify?.("Dados atualizados.");
    } catch (err) { setErros({ geral: err.message || "Não foi possível salvar." }); }
    finally { setSalvando(false); }
  };

  const sair = () => { if (window.confirm("Deseja realmente sair da sua conta?")) onLogout(); };

  const checklist = checklistPerfil(usuario);
  const completos = checklist.filter(c => c.ok).length;
  const pendentes = checklist.filter(c => !c.ok);
  const endereco = usuario?.cidade
    ? [usuario.logradouro && `${usuario.logradouro}${usuario.numero ? `, ${usuario.numero}` : ""}`, usuario.bairro, `${usuario.cidade}${usuario.uf ? `/${usuario.uf}` : ""}`].filter(Boolean).join(" · ")
    : null;
  const ativos = (meusItens || []).filter(i => statusDoItem(i) === "ATIVO").length;

  return (
    <div>
      <TopBar title="Perfil" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", opacity: enviandoFoto ? 0.5 : 1 }}>
            <FotoPerfil usuario={usuario} size={68} />
            <button type="button" onClick={() => fotoRef.current?.click()} disabled={enviandoFoto} aria-label="Alterar foto de perfil" title="Alterar foto de perfil" style={{ position: "absolute", right: -4, bottom: -2, width: 26, height: 26, borderRadius: "50%", border: "2px solid #fff", background: "var(--role-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Camera size={12} /></button>
            <input ref={fotoRef} type="file" accept="image/*" onChange={escolherFoto} style={{ display: "none" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: INK }}>{usuario?.nome}</div>
            <div style={{ fontSize: 12, color: INK_SOFT }}>{usuario?.email}</div>
            <div style={{ fontSize: 12, color: INK_SOFT, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><Stars value={usuario?.reputacaoScore} /> {(usuario?.reputacaoScore || 0).toFixed(1)}</div>
            {usuario?.fotoUrl && <span onClick={removerFoto} style={{ fontSize: 11, color: INK_SOFT, textDecoration: "underline", cursor: "pointer" }}>remover foto</span>}
          </div>
        </div>

        {pendentes.length > 0 && (
          <div style={{ ...card, marginTop: 16, background: "#FFF8EC", borderColor: "#F2D9A8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>Perfil {Math.round((completos / checklist.length) * 100)}% completo</div>
              <span style={{ fontSize: 11, color: INK_SOFT }}>{completos}/{checklist.length}</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: "#F2E6CC", margin: "8px 0 10px", overflow: "hidden" }}>
              <div style={{ width: `${(completos / checklist.length) * 100}%`, height: "100%", background: "#F2A93C" }} />
            </div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 6 }}>Perfis completos passam mais confiança e recebem mais respostas.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {pendentes.map(p => (
                <Chip key={p.label} onClick={() => {
                  if (p.go) go(p.go);
                  else if (p.label === "Adicionar foto") fotoRef.current?.click();
                  else if (p.label === "Informar celular") abrirEdicao();
                  else notify?.("A verificação de e-mail será liberada em breve.");
                }}>{p.label}</Chip>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
          {[
            { v: ativos, l: "Anúncios ativos", on: () => go("gerenciarItens") },
            { v: Object.keys(favorites).length, l: "Favoritos", on: () => go("favoritos") },
            { v: usuario?.itensDoados || 0, l: "Doações", on: () => go("historico") },
          ].map(s => (
            <button key={s.l} type="button" onClick={s.on} style={{ border: "1px solid #EDEBE1", borderRadius: 12, background: "#fff", padding: 10, color: INK, cursor: "pointer" }}>
              <b style={{ fontSize: 16 }}>{s.v}</b><br /><span style={{ fontSize: 10.5, color: INK_SOFT }}>{s.l}</span>
            </button>
          ))}
        </div>

        <div onClick={() => go("dashboardImpacto")} style={{ ...card, marginTop: 10, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "var(--role-soft)", borderColor: "transparent" }}>
          <Leaf size={22} color="var(--role-primary-dark)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--role-primary-dark)" }}>{(usuario?.kgResiduoEvitado || 0).toFixed(1)} kg de resíduo evitado</div>
            <div style={{ fontSize: 11.5, color: "var(--role-primary-dark)" }}>{usuario?.pontos || 0} pontos · selo {BADGES[badgeIndex(usuario?.seloAtual)].label}</div>
          </div>
          <ChevronRight size={15} color="var(--role-primary-dark)" />
        </div>

        <SectionTitle right={!editando && <span onClick={abrirEdicao} style={{ fontSize: 12, fontWeight: 700, color: "var(--role-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Pencil size={12} /> Editar</span>}>Dados pessoais</SectionTitle>
        {editando ? (
          <div style={card}>
            <label style={{ ...fieldLabel, marginTop: 0 }}>Nome completo</label>
            <div style={fieldBox}><input value={form.nome} maxLength={80} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} style={fieldInput} /></div>
            <FieldError>{erros.nome}</FieldError>
            <label style={fieldLabel}>Celular</label>
            <div style={fieldBox}><input value={form.telefone} inputMode="tel" placeholder="(31) 99999-9999" onChange={e => setForm(f => ({ ...f, telefone: formatCelular(e.target.value) }))} style={fieldInput} /></div>
            <FieldError>{erros.telefone}</FieldError>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 8 }}>E-mail e CPF não podem ser alterados por aqui.</div>
            {erros.geral && <FieldError>{erros.geral}</FieldError>}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button small variant="ghost" onClick={() => setEditando(false)}>Cancelar</Button>
              <Button small loading={salvando} onClick={salvarDados} icon={CheckCircle2}>Salvar</Button>
            </div>
          </div>
        ) : (
          <div style={{ ...card, display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: INK }}>
            <div><span style={{ color: INK_SOFT }}>Nome:</span> {usuario?.nome}</div>
            <div><span style={{ color: INK_SOFT }}>E-mail:</span> {usuario?.email} {usuario?.emailVerificado && <CheckCircle2 size={12} color="var(--role-primary)" />}</div>
            <div><span style={{ color: INK_SOFT }}>Celular:</span> {usuario?.telefone ? formatCelular(usuario.telefone) : <i style={{ color: INK_SOFT }}>não informado</i>}</div>
            {usuario?.criadoEm && <div><span style={{ color: INK_SOFT }}>Membro desde:</span> {new Date(usuario.criadoEm).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</div>}
          </div>
        )}

        <SectionTitle>Endereço</SectionTitle>
        <MenuRow Icon={MapPin} label={endereco ? "Endereço principal" : "Cadastrar endereço"} detail={endereco || "Usado para sugerir locais de retirada"} onClick={() => go("enderecos")} />

        <SectionTitle>Atividade</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <MenuRow Icon={Award} label="Reputação e selos" onClick={() => go("reputacao")} />
          <MenuRow Icon={Clock} label="Histórico" detail="Publicações, solicitações e avaliações" onClick={() => go("historico")} />
          <MenuRow Icon={Users} label="Comunidades" onClick={() => go("comunidades")} />
          <MenuRow Icon={Bell} label="Notificações" onClick={() => go("notificacoes")} />
          <MenuRow Icon={User} label="Ver meu perfil público" detail="Como outras pessoas veem você" onClick={() => go("perfilPublico", { usuarioId: usuario?.id })} />
        </div>

        <SectionTitle>Conta e segurança</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <MenuRow Icon={ShieldCheck} label="Segurança" detail="Senha, sessões e preferências de notificação" onClick={() => go("seguranca")} />
          <MenuRow Icon={FileText} label="Termos de uso" onClick={() => go("termos")} />
          <MenuRow Icon={Lock} label="Política de privacidade" onClick={() => go("privacidade")} />
          <MenuRow Icon={LogOut} label="Sair" danger onClick={sair} />
        </div>
      </div>
    </div>
  );
}

/* ---- PERFIL PÚBLICO ---- */
function PerfilPublico({ go, usuario, onlineIds, favorites, toggleFav, params, notify }) {
  const id = params?.usuarioId || params?.doador?.id;
  const perfil = useApiData(() => api.perfilPublico(id), [id], { skip: !id });
  const reputacao = useApiData(() => api.avaliacoesDe(id), [id], { skip: !id });
  const itens = useApiData(() => api.itensDeUsuario(id), [id], { skip: !id });
  const [todasAvaliacoes, setTodasAvaliacoes] = useState(false);

  if (!id || perfil.errorStatus === 404) {
    return <div><TopBar title="Perfil" onBack={() => go(-1)} /><EmptyState Icon={User} text="Este perfil não existe ou foi removido." /></div>;
  }

  const p = perfil.data || params?.doador;
  const souEu = usuario?.id === id;
  const resumo = reputacao.data?.resumo;
  const avaliacoes = reputacao.data?.avaliacoes || [];
  const disponiveis = (itens.data || []).filter(i => statusDoItem(i) === "ATIVO");
  const badge = BADGES[badgeIndex(p?.seloAtual)];

  return (
    <div>
      <TopBar title={souEu ? "Meu perfil público" : "Perfil do anunciante"} onBack={() => go(-1)} right={p && <Share2 size={18} color={INK} style={{ cursor: "pointer" }} onClick={() => compartilhar({ titulo: `${p.nome} no Reviva`, texto: `Veja os itens de ${p.nome} no Reviva`, url: linkDoPerfil(id) }, notify)} />} />
      <div style={{ padding: "0 20px 24px" }}>
        {perfil.loading && !p && <Loading />}
        {perfil.error && perfil.errorStatus !== 404 && <ErrorBox message={perfil.error} onRetry={perfil.reload} />}
        {p && (
          <>
            {souEu && <div style={{ fontSize: 11.5, color: INK_SOFT, marginBottom: 10 }}>É assim que outras pessoas veem seu perfil. E-mail, CPF, celular e endereço não aparecem aqui.</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <FotoPerfil usuario={p} size={64} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: INK }}>{p.nome}</div>
                <div style={{ fontSize: 11.5, color: INK_SOFT, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <Stars value={p.reputacaoScore} /> {(p.reputacaoScore || 0).toFixed(1)}
                  <span>({p.totalAvaliacoes ?? avaliacoes.length} avaliações)</span>
                  <span style={{ color: onlineIds?.has(id) ? "var(--role-primary)" : INK_SOFT, fontWeight: 600 }}>{onlineIds?.has(id) ? "● online" : "offline"}</span>
                </div>
                <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 2 }}>
                  {p.cidade ? `${p.cidade}${p.uf ? `/${p.uf}` : ""} · ` : ""}{p.criadoEm ? `no Reviva desde ${new Date(p.criadoEm).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}` : ""}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "4px 10px", background: badge.color + "22", color: badge.color }}><Award size={12} /> Selo {badge.label}</span>
              {p.emailVerificado && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "4px 10px", background: "var(--role-soft)", color: "var(--role-primary-dark)" }}><ShieldCheck size={12} /> E-mail verificado</span>}
              {p.telefoneVerificado && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "4px 10px", background: "var(--role-soft)", color: "var(--role-primary-dark)" }}><ShieldCheck size={12} /> Celular verificado</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
              <StatBox Icon={Gift} value={p.itensDoados || 0} label="doações" />
              <StatBox Icon={Recycle} value={`${(p.kgResiduoEvitado || 0).toFixed(0)} kg`} label="reaproveitados" />
              <StatBox Icon={Award} value={p.pontos || 0} label="pontos" />
            </div>
          </>
        )}

        <SectionTitle>Avaliações</SectionTitle>
        {reputacao.loading && <Loading label="Carregando avaliações..." />}
        {reputacao.error && <ErrorBox message={reputacao.error} onRetry={reputacao.reload} />}
        {resumo && resumo.total > 0 && (
          <div style={{ ...card, marginBottom: 10 }}>
            {CATEGORIAS_AVALIACAO.map(c => <BarraMedia key={c.key} label={c.label} valor={resumo.categorias?.[c.key]} />)}
          </div>
        )}
        {!reputacao.loading && !reputacao.error && avaliacoes.length === 0 && <EmptyState Icon={Star} text="Ainda sem avaliações." />}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(todasAvaliacoes ? avaliacoes : avaliacoes.slice(0, 3)).map(a => <AvaliacaoCard key={a.id} a={a} />)}
        </div>
        {avaliacoes.length > 3 && <div style={{ textAlign: "center", marginTop: 8 }}><Button small variant="ghost" onClick={() => setTodasAvaliacoes(v => !v)}>{todasAvaliacoes ? "Ver menos" : `Ver todas (${avaliacoes.length})`}</Button></div>}

        <SectionTitle>Itens disponíveis</SectionTitle>
        {itens.loading && <Loading label="Carregando itens..." />}
        {itens.error && <ErrorBox message={itens.error} onRetry={itens.reload} />}
        {!itens.loading && !itens.error && disponiveis.length === 0 && <EmptyState Icon={Gift} text="Nenhum item disponível no momento." />}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {disponiveis.map(item => <ItemCard key={item.id} item={item} usuario={usuario} onlineIds={onlineIds} favorite={!!favorites?.[item.id]} onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: item.id })} />)}
        </div>
      </div>
    </div>
  );
}

/* ---- REPUTAÇÃO ---- */
function conquistas(usuario, resumo) {
  const doados = usuario?.itensDoados || 0;
  const kg = usuario?.kgResiduoEvitado || 0;
  return [
    { Icon: Gift, titulo: "Primeira doação", desc: "Conclua sua primeira doação", ok: doados >= 1 },
    { Icon: Package, titulo: "Doador frequente", desc: "Conclua 5 doações", ok: doados >= 5, progresso: Math.min(1, doados / 5) },
    { Icon: Recycle, titulo: "10 kg salvos", desc: "Evite 10 kg de resíduo", ok: kg >= 10, progresso: Math.min(1, kg / 10) },
    { Icon: Leaf, titulo: "Guardião verde", desc: "Evite 50 kg de resíduo", ok: kg >= 50, progresso: Math.min(1, kg / 50) },
    { Icon: Star, titulo: "Bem avaliado", desc: "Média 4,5+ com 3 avaliações", ok: (resumo?.total || 0) >= 3 && (resumo?.media || 0) >= 4.5 },
    { Icon: ShieldCheck, titulo: "Conta verificada", desc: "Verifique e-mail e celular", ok: !!(usuario?.emailVerificado && usuario?.telefoneVerificado) },
  ];
}

function Reputacao({ go, usuario, refreshUsuario }) {
  useEffect(() => { refreshUsuario?.(); /* pontos/selo podem ter mudado após uma troca */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { loading, error, data, reload } = useApiData(() => api.avaliacoesDe(usuario.id), [usuario?.id], { skip: !usuario?.id });
  const resumo = data?.resumo;
  const avaliacoes = data?.avaliacoes || [];
  const idx = badgeIndex(usuario?.seloAtual);
  const pontos = usuario?.pontos || 0;
  const proximo = BADGES[idx + 1];
  const atual = BADGES[idx];
  const progresso = proximo ? (pontos - atual.min) / (proximo.min - atual.min) : 1;
  const lista = conquistas(usuario, resumo);

  return (
    <div>
      <TopBar title="Reputação e selos" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ textAlign: "center" }}>
          <ImpactRing pct={Math.min(1, (usuario?.reputacaoScore || 0) / 5)} size={100} value={(usuario?.reputacaoScore || 0).toFixed(1)} label="nota média" />
          <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 8 }}>
            {resumo?.total ? `Média de ${resumo.total} avaliação(ões) recebida(s) nas suas trocas e doações.` : "Sua nota aparece depois da primeira avaliação recebida."}
          </div>
        </div>

        <div style={{ ...card, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: atual.color + "22", border: `2px solid ${atual.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Award size={20} color={atual.color} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>Selo {atual.label} · {pontos} pontos</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT }}>{proximo ? `Faltam ${Math.max(0, proximo.min - pontos)} pontos para o selo ${proximo.label}` : "Você chegou ao selo máximo!"}</div>
            </div>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: "#EDEBE1", marginTop: 10, overflow: "hidden" }}>
            <div style={{ width: `${Math.max(0, Math.min(1, progresso)) * 100}%`, height: "100%", background: proximo?.color || atual.color }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            {BADGES.map((b, i) => (
              <div key={b.tier} style={{ textAlign: "center", opacity: i <= idx ? 1 : 0.4 }}>
                <Award size={18} color={b.color} />
                <div style={{ fontSize: 10, fontWeight: 700, color: INK }}>{b.label}</div>
                <div style={{ fontSize: 9.5, color: INK_SOFT }}>{b.min}+ pts</div>
              </div>
            ))}
          </div>
        </div>

        <SectionTitle>Como ganhar pontos</SectionTitle>
        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: INK }}>
          <div style={{ display: "flex", gap: 8 }}><Gift size={15} color="var(--role-primary)" /> <span><b>+15</b> ao concluir uma doação</span></div>
          <div style={{ display: "flex", gap: 8 }}><CheckCircle2 size={15} color="var(--role-primary)" /> <span><b>+5</b> ao confirmar um recebimento</span></div>
          <div style={{ display: "flex", gap: 8 }}><Star size={15} color="var(--role-primary)" /> <span><b>até +10</b> por avaliação recebida (depende da nota)</span></div>
          <div style={{ fontSize: 11, color: INK_SOFT }}>Cada troca só pode ser avaliada uma vez por cada participante, então pontos de avaliação não se repetem.</div>
        </div>

        <SectionTitle>Por categoria</SectionTitle>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {resumo && (
          <div style={card}>
            {CATEGORIAS_AVALIACAO.map(c => <BarraMedia key={c.key} label={c.label} valor={resumo.categorias?.[c.key]} />)}
            {resumo.total > 0 && (
              <div style={{ marginTop: 6 }}>
                {[5, 4, 3, 2, 1].map(n => {
                  const qtd = resumo.distribuicao?.[n] || 0;
                  return (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: INK_SOFT, marginBottom: 3 }}>
                      <span style={{ width: 22 }}>{n}★</span>
                      <div style={{ flex: 1, height: 5, borderRadius: 999, background: "#EDEBE1", overflow: "hidden" }}><div style={{ width: `${(qtd / resumo.total) * 100}%`, height: "100%", background: "#F2A93C" }} /></div>
                      <span style={{ width: 18, textAlign: "right" }}>{qtd}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <SectionTitle>Conquistas</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {lista.map(c => (
            <div key={c.titulo} style={{ ...card, padding: 12, opacity: c.ok ? 1 : 0.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <c.Icon size={15} color={c.ok ? "var(--role-primary)" : INK_SOFT} />
                <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{c.titulo}</span>
                {c.ok && <Trophy size={12} color="#F2A93C" />}
              </div>
              <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 4 }}>{c.desc}</div>
              {!c.ok && c.progresso !== undefined && <div style={{ height: 4, borderRadius: 999, background: "#EDEBE1", marginTop: 6, overflow: "hidden" }}><div style={{ width: `${c.progresso * 100}%`, height: "100%", background: "var(--role-primary)" }} /></div>}
            </div>
          ))}
        </div>

        <SectionTitle>Avaliações recebidas</SectionTitle>
        {!loading && !error && avaliacoes.length === 0 && <EmptyState Icon={Star} text="Conclua uma troca para receber sua primeira avaliação." />}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {avaliacoes.map(a => <AvaliacaoCard key={a.id} a={a} />)}
        </div>

        <SectionTitle>Verificação</SectionTitle>
        <div style={{ background: "var(--role-soft)", borderRadius: 14, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <ShieldCheck size={20} color="var(--role-primary-dark)" />
          <div style={{ fontSize: 12, color: "var(--role-primary-dark)" }}>
            {usuario?.emailVerificado ? "E-mail verificado." : "E-mail ainda não verificado."} {usuario?.telefoneVerificado ? "Celular verificado." : "Celular ainda não verificado."}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- COMUNIDADES ---- */
const CATEGORIAS_COMUNIDADE = { GERAL: "Geral", ...Object.fromEntries(Object.entries(CATS).map(([k, v]) => [k, v.label])) };

function MuralComunidade({ comunidade, go, notify, onVoltar, onAtualizada }) {
  const { loading, error, data: posts, reload } = useApiData(() => api.postsComunidade(comunidade.id), [comunidade.id]);
  const [texto, setTexto] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [lista, setLista] = useState([]);
  useEffect(() => { if (posts) setLista(posts); }, [posts]);

  const publicar = async () => {
    if (!texto.trim()) return;
    setPublicando(true);
    try {
      const novo = await api.publicarNaComunidade(comunidade.id, texto.trim());
      setLista(l => [novo, ...l]);
      setTexto("");
      onAtualizada?.({ ...comunidade, totalPosts: (comunidade.totalPosts || 0) + 1 });
    } catch (e) { notify(e.message || "Não foi possível publicar."); }
    finally { setPublicando(false); }
  };

  const apoiar = async (post) => {
    const otimista = { ...post, apoiei: !post.apoiei, apoios: post.apoios + (post.apoiei ? -1 : 1) };
    setLista(l => l.map(p => p.id === post.id ? otimista : p));
    try {
      const atualizado = await api.apoiarPost(comunidade.id, post.id);
      setLista(l => l.map(p => p.id === post.id ? atualizado : p));
    } catch (e) {
      setLista(l => l.map(p => p.id === post.id ? post : p));
      notify(e.message || "Não foi possível apoiar.");
    }
  };

  return (
    <div>
      <TopBar title={comunidade.nome} onBack={onVoltar} right={<Share2 size={18} color={INK} style={{ cursor: "pointer" }} onClick={() => compartilhar({ titulo: comunidade.nome, texto: `Participe da comunidade ${comunidade.nome} no Reviva!`, url: window.location.origin }, notify)} />} />
      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ fontSize: 12.5, color: INK_SOFT, lineHeight: 1.45 }}>{comunidade.descricao}</div>
        <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 6 }}>{comunidade.totalMembros} membros · {CATEGORIAS_COMUNIDADE[comunidade.categoria] || "Geral"}{comunidade.cidade ? ` · ${comunidade.cidade}` : ""}</div>
        {comunidade.participando ? (
          <div style={{ ...card, marginTop: 14 }}>
            <textarea rows={3} maxLength={500} value={texto} onChange={e => setTexto(e.target.value)} placeholder="Compartilhe uma doação, pedido ou dica com o grupo..." style={{ ...fieldInput, resize: "none" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <span style={{ fontSize: 10.5, color: INK_SOFT }}>{texto.length}/500</span>
              <Button small icon={Send} loading={publicando} disabled={!texto.trim()} onClick={publicar}>Publicar</Button>
            </div>
          </div>
        ) : (
          <div style={{ ...card, marginTop: 14, fontSize: 12, color: INK_SOFT }}>Participe da comunidade para publicar no mural.</div>
        )}
        <SectionTitle>Mural</SectionTitle>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && lista.length === 0 && <EmptyState Icon={Users} text="Ninguém publicou ainda. Que tal começar?" />}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lista.map(p => (
            <div key={p.id} style={card}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <FotoPerfil usuario={{ nome: p.autorNome, fotoUrl: p.autorFotoUrl }} size={30} />
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => go("perfilPublico", { usuarioId: p.autorId })}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{p.autorNome}</div>
                  <div style={{ fontSize: 10.5, color: INK_SOFT }}>há {timeAgo(p.criadoEm)}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: INK, marginTop: 8, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{p.texto}</div>
              <button type="button" onClick={() => apoiar(p)} style={{ marginTop: 8, border: "none", background: "transparent", padding: 0, fontSize: 11.5, color: p.apoiei ? "#C0392B" : INK_SOFT, display: "flex", gap: 4, alignItems: "center", cursor: "pointer", fontWeight: p.apoiei ? 700 : 500 }}>
                <Heart size={13} fill={p.apoiei ? "#C0392B" : "none"} /> {p.apoios} {p.apoios === 1 ? "apoio" : "apoios"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Comunidades({ go, notify, usuario }) {
  const { loading, error, data, reload } = useApiData(() => api.comunidades(), [usuario?.id]);
  const [comunidades, setComunidades] = useState([]);
  const [termo, setTermo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [minhaRegiao, setMinhaRegiao] = useState(false);
  const [soMinhas, setSoMinhas] = useState(false);
  const [processando, setProcessando] = useState(null);
  const [aberta, setAberta] = useState(null);
  useEffect(() => { if (data) setComunidades(data); }, [data]);

  const atualizar = (c) => {
    setComunidades(l => l.map(x => x.id === c.id ? c : x));
    setAberta(a => a && a.id === c.id ? c : a);
  };

  const alternar = async (c) => {
    if (c.participando && !window.confirm(`Sair da comunidade ${c.nome}?`)) return;
    setProcessando(c.id);
    try {
      const atualizada = c.participando ? await api.sairComunidade(c.id) : await api.participarComunidade(c.id);
      atualizar(atualizada);
      notify(atualizada.participando ? `Você entrou em ${c.nome}!` : `Você saiu de ${c.nome}.`);
    } catch (e) { notify(e.message || "Não foi possível atualizar sua participação."); }
    finally { setProcessando(null); }
  };

  const categoriasPresentes = [...new Set(comunidades.map(c => c.categoria).filter(Boolean))];
  const busca = termo.trim().toLowerCase();
  const filtradas = comunidades.filter(c =>
    (!categoria || c.categoria === categoria)
    && (!soMinhas || c.participando)
    && (!minhaRegiao || !usuario?.cidade || (c.cidade || "").toLowerCase() === usuario.cidade.toLowerCase())
    && (!busca || [c.nome, c.descricao, c.bairroReferencia, c.cidade].some(v => (v || "").toLowerCase().includes(busca))));
  const temFiltro = termo || categoria || minhaRegiao || soMinhas;

  if (aberta) {
    return <MuralComunidade comunidade={aberta} go={go} notify={notify} onVoltar={() => setAberta(null)} onAtualizada={atualizar} />;
  }

  return (
    <div>
      <TopBar title="Comunidades" onBack={() => go(-1)} right={<Bell size={18} color={INK} onClick={() => go("notificacoes")} style={{ cursor: "pointer" }} />} />
      <div style={{ padding: "0 20px 24px" }}>
        <div style={fieldBox}>
          <Search size={16} color={INK_SOFT} />
          <input value={termo} onChange={e => setTermo(e.target.value)} placeholder="Buscar por nome, bairro ou cidade" style={fieldInput} />
          {termo && <X size={15} color={INK_SOFT} style={{ cursor: "pointer" }} onClick={() => setTermo("")} />}
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 0 4px" }}>
          <Chip active={soMinhas} onClick={() => setSoMinhas(v => !v)}>Minhas</Chip>
          {usuario?.cidade && <Chip active={minhaRegiao} onClick={() => setMinhaRegiao(v => !v)}>📍 {usuario.cidade}</Chip>}
          <Chip active={!categoria} onClick={() => setCategoria("")}>Todas</Chip>
          {categoriasPresentes.map(k => <Chip key={k} active={categoria === k} onClick={() => setCategoria(categoria === k ? "" : k)}>{CATEGORIAS_COMUNIDADE[k] || k}</Chip>)}
        </div>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && filtradas.length === 0 && (
          <div>
            <EmptyState Icon={Users} text={temFiltro ? "Nenhuma comunidade com esses filtros." : "Ainda não há comunidades cadastradas."} />
            {temFiltro && <div style={{ textAlign: "center" }}><Button small variant="ghost" onClick={() => { setTermo(""); setCategoria(""); setMinhaRegiao(false); setSoMinhas(false); }}>Limpar filtros</Button></div>}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          {filtradas.map(c => (
            <div key={c.id} style={card}>
              <div onClick={() => setAberta(c)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={17} color="var(--role-primary-dark)" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{c.nome}</div>
                    <div style={{ fontSize: 11, color: INK_SOFT }}>{CATEGORIAS_COMUNIDADE[c.categoria] || "Geral"} · {c.bairroReferencia || c.cidade || "Online"}</div>
                  </div>
                  {c.participando && <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--role-primary-dark)", background: "var(--role-soft)", borderRadius: 999, padding: "3px 8px" }}>participando</span>}
                </div>
                {c.descricao && <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 8, lineHeight: 1.4 }}>{c.descricao}</div>}
                <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>{c.totalMembros} {c.totalMembros === 1 ? "membro" : "membros"} · {c.totalPosts || 0} publicações</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Button small variant={c.participando ? "ghost" : "primary"} loading={processando === c.id} onClick={() => alternar(c)}>{c.participando ? "Sair" : "Participar"}</Button>
                <Button small variant="soft" onClick={() => setAberta(c)}>Ver mural</Button>
                <Button small variant="ghost" icon={Share2} onClick={() => compartilhar({ titulo: c.nome, texto: `Participe da comunidade ${c.nome} no Reviva!`, url: window.location.origin }, notify)}>Compartilhar</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- FAVORITOS ---- */
function Favoritos({ go, favorites, toggleFav, usuario, onlineIds, notify, onFavoritosRemovidos }) {
  const { loading, error, data, reload } = useApiData(() => api.favoritos(), [usuario?.id, Object.keys(favorites || {}).length]);
  const [ordem, setOrdem] = useState("recentes");
  const [categoria, setCategoria] = useState("");
  const [selecionando, setSelecionando] = useState(false);
  const [selecionados, setSelecionados] = useState(() => new Set());
  const [removendo, setRemovendo] = useState(false);

  const lista = data || [];
  const categorias = [...new Set(lista.map(f => f.item?.categoria).filter(Boolean))];
  const indisponiveis = lista.filter(f => !f.disponivel);
  const visiveis = useMemo(() => {
    const filtrados = lista.filter(f => !categoria || f.item?.categoria === categoria);
    const porData = (a, b) => new Date(b.salvoEm) - new Date(a.salvoEm);
    if (ordem === "antigos") return [...filtrados].sort((a, b) => -porData(a, b));
    if (ordem === "titulo") return [...filtrados].sort((a, b) => (a.item?.titulo || "").localeCompare(b.item?.titulo || "", "pt-BR"));
    if (ordem === "disponiveis") return [...filtrados].sort((a, b) => Number(b.disponivel) - Number(a.disponivel) || porData(a, b));
    return [...filtrados].sort(porData);
  }, [lista, categoria, ordem]);

  const alternarSelecao = (id) => setSelecionados(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const removerEmLote = async (ids) => {
    if (!ids.length) return;
    if (!window.confirm(`Remover ${ids.length} ${ids.length === 1 ? "item" : "itens"} dos favoritos?`)) return;
    setRemovendo(true);
    try {
      await api.removerFavoritosLote(ids);
      onFavoritosRemovidos?.(ids);
      setSelecionados(new Set());
      setSelecionando(false);
      notify?.(`${ids.length} ${ids.length === 1 ? "favorito removido" : "favoritos removidos"}.`);
      reload({ silent: true });
    } catch (e) { notify?.(e.message || "Não foi possível remover."); }
    finally { setRemovendo(false); }
  };

  return (
    <div>
      <TopBar title="Favoritos" onBack={() => go(-1)} right={lista.length > 0 && <span onClick={() => { setSelecionando(v => !v); setSelecionados(new Set()); }} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--role-primary)", cursor: "pointer" }}>{selecionando ? "Cancelar" : "Selecionar"}</span>} />
      <div style={{ padding: "0 20px 90px" }}>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && lista.length === 0 && <EmptyState Icon={Heart} text="Você ainda não favoritou nenhum item. Toque no ❤ de um item para salvá-lo aqui." />}
        {lista.length > 0 && (
          <>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: INK_SOFT }}>Ordenar:</span>
              <select value={ordem} onChange={e => setOrdem(e.target.value)} style={{ border: "1px solid #E9E7DC", borderRadius: 10, padding: "6px 8px", fontSize: 12.5, background: "#fff", color: INK }}>
                <option value="recentes">Salvos recentemente</option>
                <option value="antigos">Mais antigos</option>
                <option value="titulo">Nome (A–Z)</option>
                <option value="disponiveis">Disponíveis primeiro</option>
              </select>
            </div>
            {categorias.length > 1 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                <Chip active={!categoria} onClick={() => setCategoria("")}>Todas</Chip>
                {categorias.map(k => <Chip key={k} active={categoria === k} onClick={() => setCategoria(k)}>{CATS[k]?.label || k}</Chip>)}
              </div>
            )}
            {indisponiveis.length > 0 && !selecionando && (
              <div style={{ ...card, background: "#FFF8EC", borderColor: "#F2D9A8", display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <AlertTriangle size={16} color="#B7791F" />
                <div style={{ flex: 1, fontSize: 12, color: INK }}>{indisponiveis.length} {indisponiveis.length === 1 ? "item não está mais disponível" : "itens não estão mais disponíveis"}.</div>
                <Button small variant="ghost" loading={removendo} onClick={() => removerEmLote(indisponiveis.map(f => f.itemId))}>Limpar</Button>
              </div>
            )}
          </>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visiveis.map(f => (
            <div key={f.itemId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {selecionando && <Checkbox checked={selecionados.has(f.itemId)} onChange={() => alternarSelecao(f.itemId)} label={`Selecionar ${f.item?.titulo || "item"}`} />}
              <div style={{ flex: 1, minWidth: 0, opacity: f.disponivel ? 1 : 0.6 }}>
                {f.item ? (
                  <ItemCard item={f.item} usuario={usuario} onlineIds={onlineIds} favorite onFav={toggleFav}
                    onClick={() => selecionando ? alternarSelecao(f.itemId) : go("detalhesItem", { itemId: f.itemId })} />
                ) : (
                  <div style={{ ...card, display: "flex", alignItems: "center", gap: 10 }}>
                    <Package size={18} color={INK_SOFT} />
                    <div style={{ flex: 1, fontSize: 12.5, color: INK_SOFT }}>Este anúncio foi removido pelo anunciante.</div>
                    {!selecionando && <Trash2 size={16} color="#9C4327" style={{ cursor: "pointer" }} onClick={() => removerEmLote([f.itemId])} />}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: INK_SOFT, marginTop: 4, paddingLeft: 4 }}>
                  <Calendar size={11} /> Salvo em {new Date(f.salvoEm).toLocaleDateString("pt-BR")}
                  {f.item && !f.disponivel && <StatusBadge item={f.item} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selecionando && (
        <div style={{ position: "sticky", bottom: 70, margin: "0 16px", background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 10, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 20px rgba(0,0,0,.08)" }}>
          <span style={{ flex: 1, fontSize: 12.5, color: INK }}>{selecionados.size} selecionado(s)</span>
          <Button small variant="ghost" onClick={() => setSelecionados(new Set(visiveis.map(f => f.itemId)))}>Todos</Button>
          <Button small variant="danger" icon={Trash2} loading={removendo} disabled={!selecionados.size} onClick={() => removerEmLote([...selecionados])}>Remover</Button>
        </div>
      )}
    </div>
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

export { Historico, Perfil, PerfilPublico, Reputacao, Comunidades, Favoritos, Notificacoes, Moderacao };
