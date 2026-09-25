import React, { useState, useEffect } from "react";
import { api } from "../../api.js";
import { Bell, Heart, Search, Send, Share2, Users, X } from "lucide-react";
import { Button, CATS, Chip, compartilhar, EmptyState, ErrorBox, fieldBox, fieldInput, FotoPerfil, INK, INK_SOFT, Loading, SectionTitle, timeAgo, TopBar, useApiData } from "../../shared/shared.jsx";

const card = { background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 };
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

export { Comunidades };
