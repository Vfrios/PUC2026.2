import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../api.js";
import { AlertTriangle, Archive, ChevronLeft, ChevronRight, Clock, Heart, Leaf, MapPin, MessageCircle, Pencil, Search, Send, Share2, Truck, Users } from "lucide-react";
import { Avatar, BADGES, Button, CATS, Chip, compartilhar, CO2_ESTIMADO, ESTADOS, EmptyState, ErrorBox, ItemCard, INK, INK_SOFT, Loading, linkDoItem, MODOS_ENTREGA, SectionTitle, statusDoItem, StatusBadge, Stars, TopBar, useApiData, badgeIndex, capitalize, fmtDateTime, distanciaKm } from "../../shared/shared.jsx";
const POR_PAGINA = 8;

function pontuarRelevancia(item, termo) {
  if (!termo) return 0;
  const t = termo.toLowerCase();
  let pontos = 0;
  if (item.titulo?.toLowerCase().includes(t)) pontos += 3;
  if (item.titulo?.toLowerCase().startsWith(t)) pontos += 2;
  if (item.descricao?.toLowerCase().includes(t)) pontos += 1;
  return pontos;
}

function ListaItens({ go, favorites, toggleFav, usuario, onlineIds, params, embedded = false, onLimparFiltros }) {
  const [tipoFiltro, setTipoFiltro] = useState(null);
  const [condicao, setCondicao] = useState(null);
  const [pagina, setPagina] = useState(1);
  const categoria = params?.categoria || null;
  const termo = params?.termo || null;
  const uf = params?.uf || null;
  const cidade = params?.cidade || null;
  const origem = params?.origem || (usuario?.latitude != null ? { latitude: usuario.latitude, longitude: usuario.longitude } : null);

  const { loading, error, data: itens, reload } = useApiData(
    () => api.listarItens({ categoria, tipo: tipoFiltro, termo, uf, cidade, disponiveis: true }),
    [categoria, tipoFiltro, termo, uf, cidade]
  );
  const semResultados = !loading && !error && (itens || []).length === 0;
  const { data: sugestoes } = useApiData(() => api.listarItens({}), [semResultados], { skip: !semResultados });

  useEffect(() => {
    const intervalo = setInterval(() => reload({ silent: true }), 20000);
    return () => clearInterval(intervalo);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setPagina(1); }, [categoria, tipoFiltro, termo, uf, cidade, condicao]);

  const filtrados = useMemo(() => {
    let lista = [...(itens || [])];
    if (condicao) lista = lista.filter(it => it.estadoConservacao === condicao);
    const porData = (a, b) => new Date(b.publicadoEm) - new Date(a.publicadoEm);
    if (termo) lista.sort((a, b) => pontuarRelevancia(b, termo) - pontuarRelevancia(a, termo) || porData(a, b));
    else lista.sort(porData);
    return lista;
  }, [itens, condicao, termo]);

  const visiveis = filtrados.slice(0, pagina * POR_PAGINA);
  const tituloRegiao = cidade ? ` em ${cidade}` : uf ? ` em ${uf}` : "";
  const titulo = termo ? `Resultados para "${termo}"` : categoria ? `${CATS[categoria]?.label || "Itens"}${tituloRegiao}` : `Itens perto de você${tituloRegiao}`;

  const limparTudo = () => {
    setTipoFiltro(null); setCondicao(null);
    onLimparFiltros?.();
  };

  return (
    <div>
      {!embedded && <TopBar title={titulo} onBack={() => go(-1)} right={<MapPin size={18} color={INK} />} />}
      {embedded && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px" }}><SectionTitle>{titulo}</SectionTitle>{!loading && <span style={{ fontSize: 11.5, color: INK_SOFT }}>{filtrados.length} resultado(s)</span>}</div>}

      <div style={{ padding: "0 20px", display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 6 }}>
        <Chip active={!tipoFiltro} onClick={() => setTipoFiltro(null)}>Todos</Chip>
        <Chip active={tipoFiltro === "DOAR"} onClick={() => setTipoFiltro("DOAR")}>Doação</Chip>
        <Chip active={tipoFiltro === "TROCAR"} onClick={() => setTipoFiltro("TROCAR")}>Troca</Chip>
        {ESTADOS.map(e => <Chip key={e.value} active={condicao === e.value} onClick={() => setCondicao(condicao === e.value ? null : e.value)}>{e.label}</Chip>)}
      </div>
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading label="Buscando itens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && filtrados.length === 0 && (
          <div>
            <EmptyState Icon={Search} text="Nenhum item encontrado com esses filtros." />
            <Button full variant="ghost" onClick={limparTudo}>Limpar todos os filtros</Button>
            {(sugestoes || []).length > 0 && (
              <>
                <SectionTitle>Você também pode gostar</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sugestoes.slice(0, 4).map(it => <ItemCard key={it.id} item={it} usuario={usuario} onlineIds={onlineIds} favorite={!!favorites[it.id]} onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: it.id })} />)}
                </div>
              </>
            )}
          </div>
        )}
        {visiveis.map(it => <ItemCard key={it.id} item={it} usuario={origem || usuario} onlineIds={onlineIds} favorite={!!favorites[it.id]} onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: it.id })} />)}
        {visiveis.length < filtrados.length && (
          <Button full variant="soft" onClick={() => setPagina(p => p + 1)}>Carregar mais ({filtrados.length - visiveis.length} restantes)</Button>
        )}
      </div>
    </div>
  );
}

/* ---- DETALHES DO ITEM ---- */
const AVISO_STATUS = {
  EM_NEGOCIACAO: { texto: "Reservado: já existe uma retirada agendada para este item.", bg: "#FDEFD9", color: "#9C6B14" },
  DOADO: { texto: "Este item já foi doado.", bg: "#EDEBE1", color: INK_SOFT },
  REMOVIDO: { texto: "O anunciante removeu este anúncio.", bg: "#F1EFE6", color: INK_SOFT },
  EXPIRADO: { texto: "Este anúncio expirou e não aceita novas solicitações.", bg: "#FBE8E0", color: "#9C4327" },
};

function DetalhesItem({ go, notify, favorites, toggleFav, usuario, onlineIds, params }) {
  const itemId = params?.itemId;
  const { loading, error, errorStatus, data: item, reload } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const { data: enviadas } = useApiData(() => api.solicitacoesEnviadas(), [usuario?.id, itemId], { skip: !usuario?.id || !itemId });
  const [fotoAtiva, setFotoAtiva] = useState(0);

  useEffect(() => {
    if (!itemId) return undefined;
    const id = setInterval(() => reload({ silent: true }), 20000);
    return () => clearInterval(id);
  }, [itemId]); // eslint-disable-line react-hooks/exhaustive-deps

  const voltar = () => go(-1);
  if (!itemId) return <div><TopBar title="Detalhes" onBack={voltar} /><EmptyState Icon={Search} text="Nenhum item selecionado." /></div>;
  if (loading && !item) return <div><TopBar title="Detalhes" onBack={voltar} /><Loading /></div>;
  if (errorStatus === 404 || (error && /não encontrado/i.test(error))) {
    return (
      <div>
        <TopBar title="Detalhes" onBack={voltar} />
        <EmptyState Icon={AlertTriangle} text="Este item não existe mais ou foi removido pelo anunciante." />
        <div style={{ padding: "0 20px" }}><Button full onClick={() => go("busca")}>Buscar outros itens</Button></div>
      </div>
    );
  }
  if (error) return <div><TopBar title="Detalhes" onBack={voltar} /><ErrorBox message={error} onRetry={reload} /></div>;
  if (!item) return null;

  const cat = CATS[item.categoria] || CATS.OUTROS;
  const Icon = cat.Icon;
  const souEuOItem = usuario && item.doador?.id === usuario.id;
  const fotos = item.fotosUrls || [];
  const fotoIdx = Math.min(fotoAtiva, Math.max(0, fotos.length - 1));
  const distancia = distanciaKm(usuario, item);
  const localizacao = [item.bairro, item.cidade, item.uf].filter(Boolean).join(" · ");
  const status = statusDoItem(item);
  const aviso = AVISO_STATUS[status];
  const minhaSolicitacao = (enviadas || []).find(s => s.item?.id === item.id && !["CANCELADA", "RECUSADA"].includes(s.etapa));
  const pesoImpacto = item.pesoKg || item.impactoCo2Kg || CO2_ESTIMADO[item.categoria] || 2;
  const selo = item.doador?.seloAtual ? BADGES[badgeIndex(item.doador.seloAtual)] : null;
  const modo = MODOS_ENTREGA[item.modoEntrega] || MODOS_ENTREGA.RETIRADA;
  const favoritado = !!favorites[item.id];
  const online = item.doador?.id && onlineIds.has(item.doador.id);

  const compartilharItem = () => compartilhar({
    titulo: item.titulo,
    texto: `${item.tipoPublicacao === "DOAR" ? "Doação" : "Troca"} no Reviva: ${item.titulo}${item.cidade ? ` (${item.cidade})` : ""}`,
    url: linkDoItem(item.id),
  }, notify);

  const navFoto = (delta) => setFotoAtiva(i => (i + delta + fotos.length) % fotos.length);

  return (
    <div style={{ paddingBottom: 16 }}>
      <TopBar title="Detalhes" onBack={voltar} right={<button type="button" onClick={compartilharItem} aria-label="Compartilhar item" title="Compartilhar item" style={{ width: 34, height: 34, borderRadius: 12, background: "#F1EFE6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Share2 size={17} color={INK} /></button>} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ height: 220, borderRadius: 20, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          {fotos.length > 0
            ? <img src={fotos[fotoIdx]} alt={`${item.titulo} — foto ${fotoIdx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", filter: status === "ATIVO" ? "none" : "grayscale(.5)" }} />
            : <Icon size={64} color="var(--role-primary-dark)" strokeWidth={1.3} />}
          <button type="button" onClick={() => toggleFav(item)} aria-label={favoritado ? "Remover dos favoritos" : "Favoritar"} style={{ position: "absolute", top: 12, right: 12, width: 38, height: 38, borderRadius: "50%", border: "none", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,.15)" }}>
            <Heart size={19} fill={favoritado ? "#E0673F" : "none"} color="#E0673F" style={{ animation: favoritado ? "favorite-pulse .45s ease" : "none" }} />
          </button>
          <div style={{ position: "absolute", top: 12, left: 12 }}><StatusBadge item={item} label={status === "EM_NEGOCIACAO" ? "Reservado" : undefined} /></div>
          {fotos.length > 1 && (
            <>
              <button type="button" onClick={() => navFoto(-1)} aria-label="Foto anterior" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.85)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={16} /></button>
              <button type="button" onClick={() => navFoto(1)} aria-label="Próxima foto" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.85)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={16} /></button>
              <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, fontWeight: 700, color: "#fff", background: "rgba(22,40,31,.6)", borderRadius: 999, padding: "2px 8px" }}>{fotoIdx + 1}/{fotos.length}</span>
            </>
          )}
        </div>
        {fotos.length > 1 && (
          <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
            {fotos.map((f, i) => (
              <button type="button" key={i} onClick={() => setFotoAtiva(i)} aria-label={`Ver foto ${i + 1}`} style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", cursor: "pointer", padding: 0, flexShrink: 0, border: i === fotoIdx ? "2px solid var(--role-primary)" : "2px solid transparent" }}>
                <img src={f} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}

        {aviso && <div role="status" style={{ marginTop: 12, background: aviso.bg, color: aviso.color, borderRadius: 12, padding: "10px 12px", fontSize: 12.5, fontWeight: 600 }}>{aviso.texto}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 14, gap: 8 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: INK }}>{item.titulo}</div>
            <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 3 }}>{cat.label} · {capitalize(item.estadoConservacao)}</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: item.tipoPublicacao === "DOAR" ? "var(--role-soft)" : "#FBE8E0", color: item.tipoPublicacao === "DOAR" ? "var(--role-primary-dark)" : "#9C4327" }}>{item.tipoPublicacao === "DOAR" ? "DOAÇÃO" : "TROCA"}</span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <Button full variant={favoritado ? "soft" : "ghost"} icon={Heart} onClick={() => toggleFav(item)}>{favoritado ? "Favoritado" : "Favoritar"}</Button>
          {souEuOItem ? (
            <Button full variant="soft" onClick={() => go("gerenciarItens")}>Gerenciar item</Button>
          ) : minhaSolicitacao ? (
            <Button full icon={MessageCircle} onClick={() => go("solicitacao", { itemId: item.id, solicitacaoId: minhaSolicitacao.id })}>Minha solicitação</Button>
          ) : status !== "ATIVO" ? (
            <Button full variant="ghost" disabled>Indisponível</Button>
          ) : (
            <Button full icon={Send} onClick={() => go("solicitacao", { itemId: item.id })}>Solicitar item</Button>
          )}
        </div>

        {item.descricao && (
          <>
            <SectionTitle>Descrição</SectionTitle>
            <div style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{item.descricao}</div>
          </>
        )}

        <SectionTitle>Retirada e localização</SectionTitle>
        <div style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: INK }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><MapPin size={15} color="var(--role-primary)" /> {localizacao || "Localização não informada"}{distancia != null && <span style={{ color: INK_SOFT }}> · {distancia < 1 ? "menos de 1 km" : `${Math.round(distancia)} km de você`}</span>}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Truck size={15} color="var(--role-primary)" /> {modo.label}</div>
          {item.regrasRetirada && <div style={{ display: "flex", gap: 8, alignItems: "flex-start", color: INK_SOFT }}><Clock size={15} color="var(--role-primary)" style={{ flexShrink: 0, marginTop: 1 }} /> {item.regrasRetirada}</div>}
          <div style={{ fontSize: 11, color: INK_SOFT }}>O endereço exato é combinado no chat depois da solicitação.</div>
        </div>

        <SectionTitle>Impacto estimado</SectionTitle>
        <div style={{ background: "var(--role-soft)", borderRadius: 16, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <Leaf size={22} color="var(--role-primary-dark)" />
          <div style={{ fontSize: 12.5, color: "var(--role-primary-dark)" }}>
            Reaproveitar este item evita o descarte de cerca de <b>{Number(pesoImpacto).toFixed(1)} kg</b> de material{item.pesoKg ? "" : " (estimativa pela categoria)"}.
          </div>
        </div>

        {item.doador && (
          <>
            <SectionTitle>Anunciante</SectionTitle>
            <div style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => go("perfilPublico", { doador: item.doador })}>
              {item.doador.fotoUrl ? <img src={item.doador.fotoUrl} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} /> : <Avatar label={item.doador.nome} size={44} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: INK }}>{item.doador.nome}</div>
                <div style={{ fontSize: 11.5, color: INK_SOFT, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <Stars value={item.doador.reputacaoScore} /> {item.doador.reputacaoScore ? item.doador.reputacaoScore.toFixed(1) : "sem avaliações"}
                </div>
                <div style={{ fontSize: 11, marginTop: 3, display: "flex", gap: 8 }}>
                  {selo && <span style={{ color: selo.color, fontWeight: 700 }}>Selo {selo.label}</span>}
                  <span style={{ color: online ? "#2D8A57" : INK_SOFT }}>{online ? "online agora" : "offline"}</span>
                </div>
              </div>
              <ChevronRight size={16} color={INK_SOFT} />
            </div>
          </>
        )}

        <SectionTitle>Atividade do anúncio</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: INK_SOFT }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Users size={14} /> {item.interessados ? `${item.interessados} pessoa(s) já demonstraram interesse` : "Ninguém solicitou ainda — seja o primeiro!"}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Clock size={14} /> Publicado em {new Date(item.publicadoEm).toLocaleDateString("pt-BR")}</div>
          {item.atualizadoEm && <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Pencil size={14} /> Atualizado em {fmtDateTime(item.atualizadoEm)}</div>}
          {status === "ATIVO" && item.expiraEm && <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Archive size={14} /> Disponível até {new Date(item.expiraEm).toLocaleDateString("pt-BR")}</div>}
        </div>
      </div>
    </div>
  );
}

export { ListaItens, DetalhesItem };
