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

export { Historico, Perfil, PerfilPublico, Reputacao, Moderacao };
