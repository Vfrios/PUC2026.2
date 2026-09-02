import React, { useState, useEffect, useRef, useCallback } from "react";
import { api, getToken, setToken, ApiError, wsUrl } from "../api.js";
import { Client as StompClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Home, Plus, Search, MapPin, User, Bell, Heart, MessageCircle, Star, QrCode, Users, Settings, ChevronLeft, Camera, Send, Award, Leaf, AlertTriangle, ChevronRight, Recycle, Gift, Share2, Flag, Shirt, BookOpen, Sofa, Baby, Zap, UtensilsCrossed, Calendar, Clock, LogIn, Mail, Lock, Sparkles, ShieldCheck, ArrowLeftRight, ImagePlus, LogOut, Loader2, UserPlus, Trash2, Pencil, CheckCircle2, Archive, RotateCcw, X } from "lucide-react";
import { ROLE_COLORS, GOLD, INK, INK_SOFT, CATS, ESTADOS, CO2_ESTIMADO, BADGES, MOTIVOS_DENUNCIA, NOTIF_ICONS, COMMUNITY_POSTS, capitalize, timeAgo, fmtDateTime, badgeIndex, onlyDigits, distanciaKm, formatCpf, formatCep, cpfValido, comprimirImagem, useApiData, Button, Chip, Avatar, Stars, SectionTitle, ImpactRing, ItemCard, Toast, Loading, ErrorBox, StatusBar, TopBar, BottomNav, Screen, iconBtn, linkText, fieldLabel, fieldBox, fieldInput, EmptyState, StatBox } from "./shared.jsx";
function CadastroItem({ go, notify, params, usuario }) {
  const itemEditando = params?.item || null;
  const [tipo, setTipo] = useState(itemEditando?.tipoPublicacao || "DOAR");
  const [cat, setCat] = useState(itemEditando?.categoria || "ROUPAS");
  const [estado, setEstado] = useState(itemEditando?.estadoConservacao || "SEMINOVO");
  const [titulo, setTitulo] = useState(itemEditando?.titulo || "");
  const [descricao, setDescricao] = useState(itemEditando?.descricao || "");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // ---- Fotos (câmera ou galeria) — comprimidas no navegador e enviadas como
  // data URLs em fotosUrls (o backend já persiste isso no Item, ver model/Item.java) ----
  const [fotos, setFotos] = useState(itemEditando?.fotosUrls || []); // array de data URLs, até 3
  const [fotoEnviando, setFotoEnviando] = useState(false);
  const fileInputRef = useRef(null);

  const adicionarFoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (!file) return;
    setFotoEnviando(true);
    try {
      const dataUrl = await comprimirImagem(file);
      setFotos(f => [...f, dataUrl].slice(0, 3));
    } catch (err) {
      setErro(err.message || "Não foi possível processar a foto.");
    } finally {
      setFotoEnviando(false);
    }
  };

  const removerFoto = (idx) => setFotos(f => f.filter((_, i) => i !== idx));


  const [cep, setCep] = useState(itemEditando?.cep || usuario?.cep || "");
  const [numero, setNumero] = useState(itemEditando?.numero || usuario?.numero || "");
  const [complemento, setComplemento] = useState(itemEditando?.complemento || usuario?.complemento || "");
  const [cepBuscando, setCepBuscando] = useState(false);
  const [cepErro, setCepErro] = useState("");
  const [endereco, setEndereco] = useState(itemEditando ? {
    logradouro: null, uf: itemEditando.uf, cidade: itemEditando.cidade, bairro: itemEditando.bairro,
    latitude: itemEditando.latitude, longitude: itemEditando.longitude,
  } : null); // { logradouro, bairro, cidade, uf, latitude, longitude }
  const [bairro, setBairro] = useState(itemEditando?.bairro || "");
  const [cidade, setCidade] = useState(itemEditando?.cidade || "");
  const cepDigits = onlyDigits(cep).slice(0, 8);

  useEffect(() => {
    if (cepDigits.length !== 8) { setCepErro(""); return; }
    let cancelado = false;
    setCepBuscando(true);
    setCepErro("");
    api.buscarCep(cepDigits)
      .then(res => {
        if (cancelado) return;
        setEndereco(res);
        setBairro(res.bairro || "");
        setCidade(res.cidade || "");
      })
      .catch(e => {
        if (cancelado) return;
        setEndereco(null);
        setCepErro(e.message || "CEP não encontrado. Preencha o bairro e a cidade manualmente.");
      })
      .finally(() => { if (!cancelado) setCepBuscando(false); });
    return () => { cancelado = true; };
  }, [cepDigits]);

  const submit = async () => {
    setErro("");
    if (!titulo.trim()) { setErro("Dê um título para o item."); return; }
    if (!numero.trim()) { setErro("Informe o numero do endereco."); return; }
    if (!bairro.trim() || !cidade.trim()) { setErro("Informe o CEP ou preencha bairro e cidade."); return; }
    setLoading(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria: cat,
        estadoConservacao: estado,
        tipoPublicacao: tipo,
        cep: cepDigits || null,
        numero: numero.trim(),
        complemento: complemento.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        uf: endereco?.uf || null,
        latitude: endereco?.latitude ?? null,
        longitude: endereco?.longitude ?? null,
        impactoCo2Kg: CO2_ESTIMADO[cat] || 2,
        fotosUrls: fotos,
      };
      if (itemEditando) {
        await api.editarItem(itemEditando.id, payload);
        notify("Item atualizado com sucesso ✏️");
        go(-1);
      } else {
        await api.criarItem(payload);
        notify("Item publicado com sucesso 🎉");
        go("homeDoador");
      }
    } catch (e) {
      setErro(e.message || "Não foi possível salvar o item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar title={itemEditando ? "Editar item" : "Cadastrar item"} onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {[0, 1, 2].map(i => {
            const foto = fotos[i];
            if (foto) {
              return (
                <div key={i} style={{ width: 78, height: 78, borderRadius: 16, flexShrink: 0, position: "relative" }}>
                  <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }} />
                  <div onClick={() => removerFoto(i)} style={{
                    position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%",
                    background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,.25)",
                  }}><Trash2 size={11} /></div>
                </div>
              );
            }
            const proximaVazia = fotos.length === i;
            return (
              <div key={i}
                onClick={() => proximaVazia && !fotoEnviando && fileInputRef.current?.click()}
                style={{
                  width: 78, height: 78, borderRadius: 16, background: "var(--role-soft)",
                  border: "1.5px dashed var(--role-primary)", flexShrink: 0, display: "flex",
                  alignItems: "center", justifyContent: "center", color: "var(--role-primary-dark)",
                  cursor: proximaVazia ? "pointer" : "default", opacity: proximaVazia ? 1 : 0.35,
                }}>
                {proximaVazia && fotoEnviando
                  ? <Loader2 size={20} style={{ animation: "spin .8s linear infinite" }} />
                  : <ImagePlus size={20} />}
              </div>
            );
          })}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={adicionarFoto} style={{ display: "none" }} />
        </div>
        <div style={{ fontSize: 11, color: INK_SOFT, marginBottom: 14 }}>Toque para tirar uma foto ou escolher da galeria — até 3 fotos por item.</div>

        <label style={fieldLabel}>Título</label>
        <div style={fieldBox}><input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Jaqueta jeans P/M" style={fieldInput} /></div>

        <label style={fieldLabel}>Descrição</label>
        <div style={{ ...fieldBox, alignItems: "flex-start" }}><textarea rows={3} value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Conte detalhes, estado de uso, tamanho..." style={{ ...fieldInput, resize: "none" }} /></div>

        <label style={fieldLabel}>Categoria</label>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {Object.entries(CATS).map(([k, v]) => <Chip key={k} active={cat === k} onClick={() => setCat(k)}>{v.label}</Chip>)}
        </div>

        <label style={fieldLabel}>Estado de conservação</label>
        <div style={{ display: "flex", gap: 8 }}>
          {ESTADOS.map(e => <Chip key={e.value} active={estado === e.value} onClick={() => setEstado(e.value)}>{e.label}</Chip>)}
        </div>

        <label style={fieldLabel}>Tipo de publicação</label>
        <div style={{ display: "flex", gap: 8 }}>
          <Chip active={tipo==="DOAR"} onClick={() => setTipo("DOAR")}>🎁 Doar</Chip>
          <Chip active={tipo==="TROCAR"} onClick={() => setTipo("TROCAR")}>🔁 Trocar</Chip>
        </div>

        <label style={fieldLabel}>CEP</label>
        <div style={fieldBox}>
          <MapPin size={16} color={INK_SOFT} />
          <input
            value={formatCep(cep)}
            onChange={e => setCep(e.target.value)}
            placeholder="00000-000"
            inputMode="numeric"
            maxLength={9}
            style={fieldInput}
          />
          {cepBuscando && <Loader2 size={15} color={INK_SOFT} style={{ animation: "spin .8s linear infinite" }} />}
        </div>
        <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 4 }}>
          {itemEditando ? "Deixe em branco para manter o endereço atual, ou digite um novo CEP para atualizá-lo." : "Digite o CEP para preencher rua, bairro e cidade automaticamente."}
        </div>
        {cepErro && <div style={{ fontSize: 11.5, color: "#9C4327", marginTop: 4 }}>{cepErro}</div>}

        {endereco?.logradouro && (
          <div style={{ marginTop: 8, background: "var(--role-soft)", borderRadius: 12, padding: "9px 12px", fontSize: 12, color: "var(--role-primary-dark)" }}>
            {endereco.logradouro}{endereco.uf ? ` · ${endereco.uf}` : ""}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={fieldLabel}>Numero</label>
            <div style={fieldBox}><input value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ex: 120" style={fieldInput} /></div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={fieldLabel}>Complemento</label>
            <div style={fieldBox}><input value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Opcional" style={fieldInput} /></div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={fieldLabel}>Bairro</label>
            <div style={fieldBox}><input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Preenchido pelo CEP" style={fieldInput} /></div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={fieldLabel}>Cidade</label>
            <div style={fieldBox}><input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Preenchido pelo CEP" style={fieldInput} /></div>
          </div>
        </div>

        <div style={{ marginTop: 14, background: "var(--role-soft)", borderRadius: 14, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <QrCode size={22} color="var(--role-primary-dark)" />
          <div style={{ fontSize: 11.5, color: "var(--role-primary-dark)" }}>Um QR Code de retirada será gerado automaticamente após o agendamento, para confirmar a entrega com 1 toque.</div>
        </div>

        {erro && <div style={{ marginTop: 12, fontSize: 12, color: "#9C4327", background: "#FBE8E0", padding: "8px 10px", borderRadius: 10 }}>{erro}</div>}

        <div style={{ marginTop: 18 }}>
          <Button full loading={loading} onClick={submit}>{itemEditando ? "Salvar alterações" : "Publicar item"}</Button>
        </div>
      </div>
    </div>
  );
}

/* ---- GERENCIAR ITENS ---- */
function GerenciarItens({ go, notify }) {
  const { loading, error, data: itens, reload: reloadItens } = useApiData(() => api.meusItens(), []);
  const { data: solicitacoes, reload: reloadSolic } = useApiData(() => api.solicitacoesRecebidas(), []);
  const [expandido, setExpandido] = useState(null);
  const [acaoLoading, setAcaoLoading] = useState(null);
  const [aba, setAba] = useState("ativos");

  const reload = () => { reloadItens(); reloadSolic(); };

  const statusLabel = { ATIVO: "Ativo", EM_NEGOCIACAO: "Em negociação", DOADO: "Doado", REMOVIDO: "Removido" };
  const statusStyle = (s) => ({
    background: s === "DOADO" ? "#EDEBE1" : s === "ATIVO" ? "var(--role-soft)" : s === "REMOVIDO" ? "#F1EFE6" : "#FDEFD9",
    color: s === "DOADO" || s === "REMOVIDO" ? INK_SOFT : s === "ATIVO" ? "var(--role-primary-dark)" : "#9C6B14",
  });

  const solicPorItem = (itemId) => (solicitacoes || []).filter(s => s.item?.id === itemId);

  const remover = async (item) => {
    setAcaoLoading(item.id);
    try { await api.removerItem(item.id); notify("Item removido."); reload(); }
    catch (e) { notify(e.message || "Erro ao remover item."); }
    finally { setAcaoLoading(null); }
  };

  const restaurar = async (item) => {
    setAcaoLoading(item.id);
    try { await api.restaurarItem(item.id); notify("Item restaurado por mais 60 dias."); reload(); }
    catch (e) { notify(e.message || "Erro ao restaurar item."); }
    finally { setAcaoLoading(null); }
  };

  // Confirmação rápida de doação: marca o item como doado e já atualiza o
  // perfil do usuário (kg evitados, itens doados, pontos e selo — ver
  // ItemService.marcarComoDoado no backend), sem precisar passar pelo fluxo
  // completo de agendamento/QR Code.
  const confirmarDoacao = async (item) => {
    setAcaoLoading(item.id);
    try {
      await api.marcarItemComoDoado(item.id);
      notify("Doação confirmada! Seu impacto foi atualizado. 🎉");
      reload();
    } catch (e) {
      notify(e.message || "Não foi possível confirmar a doação.");
    } finally {
      setAcaoLoading(null);
    }
  };

  return (
    <div>
      <TopBar title="Gerenciar itens" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 12px", display: "flex", gap: 8 }}>
        <Chip active={aba === "ativos"} onClick={() => setAba("ativos")}>Ativos</Chip>
        <Chip active={aba === "arquivados"} onClick={() => setAba("arquivados")}>Arquivados</Chip>
      </div>
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading label="Buscando seus itens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && (itens || []).filter(it => (it.status === "REMOVIDO" || it.expirado) === (aba === "arquivados")).length === 0 && (
          <EmptyState Icon={aba === "arquivados" ? Archive : Gift} text={aba === "arquivados" ? "Nenhum item arquivado." : "Você ainda não publicou nenhum item. Toque em 'Doar' para cadastrar o primeiro."} />
        )}
        {(itens || []).filter(it => (it.status === "REMOVIDO" || it.expirado) === (aba === "arquivados")).map((it) => {
          const relacionadas = solicPorItem(it.id);
          const aberto = expandido === it.id;
          return (
            <div key={it.id} style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 }}>
              <div onClick={() => setExpandido(aberto ? null : it.id)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: INK }}>{it.titulo}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, ...statusStyle(it.status) }}>{statusLabel[it.status] || it.status}</span>
                </div>
                <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 6 }}>{relacionadas.length} conversas</div>
                <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 3 }}>
                  Publicado em {new Date(it.publicadoEm).toLocaleDateString("pt-BR")}
                  {it.expiraEm && <> · válido até {new Date(it.expiraEm).toLocaleDateString("pt-BR")}</>}
                  {it.expirado && <span style={{ marginLeft: 6, fontWeight: 700, color: "#9C4327" }}>Expirado</span>}
                </div>
              </div>
              {aberto && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #F0EEE4", paddingTop: 10 }}>
                  {relacionadas.length === 0 && <div style={{ fontSize: 12, color: INK_SOFT }}>Nenhuma solicitação ainda.</div>}
                  {relacionadas.map(s => (
                    <div key={s.id} style={{ background: "#FAFAF4", borderRadius: 12, padding: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar label={s.receptor?.nome} size={26} />
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{s.receptor?.nome}</div>
                      </div>
                      {s.mensagem && <div style={{ fontSize: 12, color: INK_SOFT, margin: "6px 0" }}>"{s.mensagem}"</div>}
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }} onClick={() => go("chatDoador", { solicitacaoId: s.id, otherName: s.receptor?.nome, itemTitulo: it.titulo, itemId: it.id })}>
                          <Button small variant="ghost" style={{ flex: 1 }}>Abrir conversa</Button>
                        </div>
                    </div>
                  ))}
                  {aba === "arquivados" ? (
                    <Button small variant="primary" icon={RotateCcw} loading={acaoLoading === it.id} onClick={() => restaurar(it)}>Restaurar item</Button>
                  ) : (it.status === "ATIVO" || it.status === "EM_NEGOCIACAO") && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button small variant="ghost" icon={Pencil} onClick={() => go("cadastroItem", { item: it })}>Editar</Button>
                      <Button small variant="primary" icon={CheckCircle2} loading={acaoLoading === it.id} onClick={() => confirmarDoacao(it)}>Item doado</Button>
                    </div>
                  )}
                  {it.status !== "REMOVIDO" && it.status !== "DOADO" && (
                    <Button small variant="danger" icon={Trash2} loading={acaoLoading === it.id} onClick={() => remover(it)}>Remover anúncio</Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- CHAT (real, persistido no banco) ---- */
function ListaItens({ go, favorites, toggleFav, usuario, onlineIds, params, embedded = false }) {
  const [tipoFiltro, setTipoFiltro] = useState(null);
  const categoria = params?.categoria || null;
  const termo = params?.termo || null;
  const uf = params?.uf || null;
  const cidade = params?.cidade || null;

  const { loading, error, data: itens, reload } = useApiData(
    () => api.listarItens({ categoria, tipo: tipoFiltro, termo, uf, cidade }),
    [categoria, tipoFiltro, termo, uf, cidade]
  );

  const tituloRegiao = cidade ? ` em ${cidade}` : uf ? ` em ${uf}` : "";

  return (
    <div>
      {!embedded && <TopBar title={termo ? `Resultados: "${termo}"` : `Itens perto de você${tituloRegiao}`} onBack={() => go(-1)} right={<MapPin size={18} color={INK} />} />}
      {embedded && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px" }}><SectionTitle>{termo ? `Resultados para "${termo}"` : `Itens perto de você${tituloRegiao}`}</SectionTitle><MapPin size={17} color={INK} /></div>}
      <div style={{ padding: "0 20px", display: "flex", gap: 8, marginBottom: 10 }}>
        <Chip active={!tipoFiltro} onClick={() => setTipoFiltro(null)}>Todos</Chip>
        <Chip active={tipoFiltro === "DOAR"} onClick={() => setTipoFiltro("DOAR")}>Doação</Chip>
        <Chip active={tipoFiltro === "TROCAR"} onClick={() => setTipoFiltro("TROCAR")}>Troca</Chip>
      </div>
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading label="Buscando itens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && (itens || []).length === 0 && <EmptyState Icon={Search} text="Nenhum item encontrado com esses filtros." />}
        {(itens || []).map(it => <ItemCard key={it.id} item={it} usuario={usuario} onlineIds={onlineIds} favorite={!!favorites[it.id]} onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: it.id })} />)}
      </div>
    </div>
  );
}

/* ---- DETALHES DO ITEM ---- */
function DetalhesItem({ go, notify, favorites, toggleFav, usuario, onlineIds, params }) {
  const itemId = params?.itemId;
  const { loading, error, data: item, reload } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const [fotoAtiva, setFotoAtiva] = useState(0);

  if (!itemId) return <div><TopBar title="Detalhes" onBack={() => go(-1)} /><EmptyState Icon={Search} text="Nenhum item selecionado." /></div>;
  if (loading) return <div><TopBar title="Detalhes" onBack={() => go(-1)} /><Loading /></div>;
  if (error) return <div><TopBar title="Detalhes" onBack={() => go(-1)} /><ErrorBox message={error} onRetry={reload} /></div>;
  if (!item) return null;

  const cat = CATS[item.categoria] || CATS.OUTROS;
  const Icon = cat.Icon;
  const souEuOItem = usuario && item.doador?.id === usuario.id;
  const fotos = item.fotosUrls || [];
  const distancia = distanciaKm(usuario, item);
  const localizacao = [item.bairro, item.cidade].filter(Boolean).join(" · ");

  return (
    <div>
      <TopBar title="Detalhes" onBack={() => go(-1)} right={<Share2 size={17} color={INK} />} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ height: 190, borderRadius: 20, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          {fotos.length > 0
            ? <img src={fotos[fotoAtiva] || fotos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Icon size={64} color="var(--role-primary-dark)" strokeWidth={1.3} />}
          <Heart onClick={() => toggleFav(item)} size={20} style={{ position: "absolute", top: 12, right: 12, cursor: "pointer" }} fill={favorites[item.id] ? "#E0673F" : "#fff"} color="#E0673F" />
        </div>
        {fotos.length > 1 && (
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {fotos.map((f, i) => (
              <div key={i} onClick={() => setFotoAtiva(i)} style={{
                width: 48, height: 48, borderRadius: 10, overflow: "hidden", cursor: "pointer",
                border: i === fotoAtiva ? "2px solid var(--role-primary)" : "2px solid transparent",
              }}>
                <img src={f} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 14 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: INK }}>{item.titulo}</div>
            <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 3 }}>{cat.label} · {capitalize(item.estadoConservacao)}{localizacao ? ` · ${localizacao}` : ""}{distancia != null ? ` · ${distancia < 1 ? "menos de 1 km" : `${Math.round(distancia)} km`}` : ""}</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: item.tipoPublicacao === "DOAR" ? "var(--role-soft)" : "#FBE8E0", color: item.tipoPublicacao === "DOAR" ? "var(--role-primary-dark)" : "#9C4327" }}>{item.tipoPublicacao === "DOAR" ? "DOAÇÃO" : "TROCA"}</span>
        </div>
        {item.descricao && <div style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.55, marginTop: 12 }}>{item.descricao}</div>}
        {item.doador && (
          <div style={{ marginTop: 14, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => go("reputacao")}>
            <Avatar label={item.doador.nome} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: INK }}>{item.doador.nome}</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT, display: "flex", alignItems: "center", gap: 6 }}><Stars value={item.doador.reputacaoScore} /> {(item.doador.reputacaoScore || 0).toFixed(1)} <span style={{ color: onlineIds.has(item.doador.id) ? "#2D8A57" : INK_SOFT }}>{onlineIds.has(item.doador.id) ? "· online" : "· offline"}</span></div>
            </div>
            <ChevronRight size={16} color={INK_SOFT} />
          </div>
        )}
        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <Button full variant="soft" icon={Heart} onClick={() => toggleFav(item)}>{favorites[item.id] ? "Favoritado" : "Favoritar"}</Button>
          {souEuOItem ? (
            <Button full variant="ghost" disabled>Este é o seu item</Button>
          ) : item.status !== "ATIVO" ? (
            <Button full variant="ghost" disabled>Indisponível</Button>
          ) : (
            <Button full onClick={() => go("solicitacao", { itemId: item.id })}>Enviar mensagem</Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- SOLICITAÇÃO ---- */
function Solicitacao({ go, notify, params }) {
  const itemId = params?.itemId;
  const { data: item } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const [loading, setLoading] = useState(false);
  const mensagem = `Olá! Tenho interesse no item "${item?.titulo || "anunciado"}". Ele ainda está disponível?`;

  const enviar = async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const solicitacao = await api.solicitar(itemId, mensagem);
      notify("Mensagem enviada! A conversa está disponível no Inbox.");
      go("chatReceptor", {
        solicitacaoId: solicitacao.id,
        otherName: solicitacao.item?.doador?.nome,
        itemTitulo: solicitacao.item?.titulo,
        itemId: solicitacao.item?.id || itemId,
      });
    } catch (e) {
      notify(e.message || "Não foi possível enviar a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar title="Enviar mensagem" onBack={() => go(-1)} />
      <div style={{ height: "100%", padding: "30px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: 84, height: 84, borderRadius: "50%", background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MessageCircle size={32} color="var(--role-primary-dark)" />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: INK, marginTop: 16 }}>Falar com o anunciante</div>
      <div style={{ fontSize: 13, color: INK_SOFT, marginTop: 6 }}>A conversa ficará disponível imediatamente no Inbox.</div>
      <div style={{ ...fieldBox, width: "100%", alignItems: "flex-start", marginTop: 16 }}>
        <div style={{ color: INK, fontSize: 13, lineHeight: 1.5 }}>{mensagem}</div>
      </div>
      <div style={{ marginTop: 20, width: "100%" }}>
        <Button full icon={Send} loading={loading} onClick={enviar}>Enviar mensagem</Button>
      </div>
      </div>
    </div>
  );
}

export { CadastroItem, GerenciarItens, ListaItens, DetalhesItem, Solicitacao };

/* ---- HISTÓRICO ---- */
