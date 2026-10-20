import React, { useState } from "react";
import { api } from "../../api.js";
import { CheckCircle2, Gift, Pencil } from "lucide-react";
import { Button, CATS, EmptyState, ErrorBox, INK, INK_SOFT, Loading, StatusBadge, TopBar, statusDoItem, useApiData } from "../../shared/shared.jsx";

function GerenciarItens({ go, notify }) {
  const { loading, error, data: itens, reload } = useApiData(() => api.meusItens(), []);
  const [itemAtualizando, setItemAtualizando] = useState(null);
  const lista = (itens || []).slice().sort(
    (a, b) => new Date(b.atualizadoEm || b.publicadoEm) - new Date(a.atualizadoEm || a.publicadoEm)
  );

  const marcarComoDoado = async (item) => {
    if (!window.confirm(`Confirma que "${item.titulo}" foi doado? O anúncio deixará de aparecer como disponível.`)) return;
    setItemAtualizando(item.id);
    try {
      await api.marcarItemComoDoado(item.id);
      notify("Anúncio atualizado e removido das ofertas disponíveis.");
      await reload({ silent: true });
    } catch (e) {
      notify(e.message || "Não foi possível atualizar a disponibilidade do anúncio.");
    } finally {
      setItemAtualizando(null);
    }
  };

  return (
    <div style={{ paddingBottom: 16 }}>
      <TopBar
        title="Meus anúncios"
        onBack={() => go(-1)}
        right={<Button small icon={Gift} onClick={() => go("cadastroItem")}>Publicar</Button>}
      />
      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading label="Carregando seus anúncios..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && lista.length === 0 && (
          <EmptyState Icon={Gift} text="Você ainda não publicou anúncios. Cadastre um item para começar." />
        )}
        {lista.map(item => {
          const status = statusDoItem(item);
          const fotos = Array.isArray(item.fotosUrls) ? item.fotosUrls : [];
          return (
            <article key={item.id} style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {fotos[0] ? (
                  <img src={fotos[0]} alt="" style={{ width: 62, height: 62, borderRadius: 10, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 62, height: 62, borderRadius: 10, background: "var(--role-soft)", display: "grid", placeItems: "center" }}>
                    <Gift size={22} color="var(--role-primary-dark)" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: INK, fontSize: 13.5, fontWeight: 700 }}>{item.titulo}</div>
                  <div style={{ color: INK_SOFT, fontSize: 11.5, marginTop: 3 }}>
                    {CATS[item.categoria]?.label || item.categoria} · {item.tipoPublicacao === "DOAR" ? "Doação" : "Troca"}
                  </div>
                  <div style={{ marginTop: 6 }}><StatusBadge item={item} /></div>
                </div>
              </div>
              {item.descricao && <div style={{ color: INK_SOFT, fontSize: 12, lineHeight: 1.4, marginTop: 10 }}>{item.descricao}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Button small variant="ghost" icon={Pencil} onClick={() => go("cadastroItem", { item })}>Editar</Button>
                {status === "ATIVO" && (
                  <Button
                    small
                    variant="soft"
                    icon={CheckCircle2}
                    loading={itemAtualizando === item.id}
                    onClick={() => marcarComoDoado(item)}
                  >
                    Marcar como doado
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export { GerenciarItens };
