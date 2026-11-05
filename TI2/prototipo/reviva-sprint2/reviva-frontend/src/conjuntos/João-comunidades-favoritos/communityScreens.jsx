import React, { useState, useEffect } from "react";
import { api } from "../../api.js";
import { Bell, Search, Share2, Users, X } from "lucide-react";
import { Button, CATS, Chip, compartilhar, EmptyState, ErrorBox, fieldBox, fieldInput, INK, INK_SOFT, Loading, TopBar, useApiData } from "../../shared/shared.jsx";

const card = { background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 };
/* ---- COMUNIDADES ---- */
const CATEGORIAS_COMUNIDADE = { GERAL: "Geral", ...Object.fromEntries(Object.entries(CATS).map(([k, v]) => [k, v.label])) };

function Comunidades({ go, notify, usuario }) {
  const { loading, error, data, reload } = useApiData(() => api.comunidades(), [usuario?.id]);
  const [comunidades, setComunidades] = useState([]);
  const [termo, setTermo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [minhaRegiao, setMinhaRegiao] = useState(false);
  const [soMinhas, setSoMinhas] = useState(false);
  const [processando, setProcessando] = useState(null);
  useEffect(() => { if (data) setComunidades(data); }, [data]);

  const atualizar = (c) => {
    setComunidades(l => l.map(x => x.id === c.id ? c : x));
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
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={17} color="var(--role-primary-dark)" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{c.nome}</div>
                    <div style={{ fontSize: 11, color: INK_SOFT }}>{CATEGORIAS_COMUNIDADE[c.categoria] || "Geral"} · {c.bairroReferencia || c.cidade || "Online"}</div>
                  </div>
                  {c.participando && <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--role-primary-dark)", background: "var(--role-soft)", borderRadius: 999, padding: "3px 8px" }}>participando</span>}
                </div>
                {c.descricao && <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 8, lineHeight: 1.4 }}>{c.descricao}</div>}
                <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>{c.totalMembros} {c.totalMembros === 1 ? "membro" : "membros"}</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Button small variant={c.participando ? "ghost" : "primary"} loading={processando === c.id} onClick={() => alternar(c)}>{c.participando ? "Sair" : "Participar"}</Button>
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
