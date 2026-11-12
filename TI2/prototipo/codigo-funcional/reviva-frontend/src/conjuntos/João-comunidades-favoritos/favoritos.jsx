import React, { useState, useMemo } from "react";
import { api } from "../../api.js";
import { AlertTriangle, Calendar, Heart, Package, Trash2 } from "lucide-react";
import { Button, CATS, Checkbox, Chip, EmptyState, ErrorBox, INK, INK_SOFT, ItemCard, Loading, StatusBadge, TopBar, useApiData } from "../../shared/shared.jsx";

const card = { background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 };
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

export { Favoritos };
