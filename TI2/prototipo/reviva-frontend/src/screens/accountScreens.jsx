import React, { useState, useEffect, useRef, useCallback } from "react";
import { api, getToken, setToken, ApiError, wsUrl } from "../api.js";
import { Client as StompClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { Home, Plus, Search, MapPin, User, Bell, Heart, MessageCircle, Star, QrCode, Users, Settings, ChevronLeft, Camera, Send, Award, Leaf, AlertTriangle, ChevronRight, Recycle, Gift, Share2, Flag, Shirt, BookOpen, Sofa, Baby, Zap, UtensilsCrossed, Calendar, Clock, LogIn, Mail, Lock, Sparkles, ShieldCheck, ArrowLeftRight, ImagePlus, LogOut, Loader2, UserPlus, Trash2, Pencil, CheckCircle2, Archive, RotateCcw, X, FileText } from "lucide-react";
import { ROLE_COLORS, GOLD, INK, INK_SOFT, CATS, ESTADOS, CO2_ESTIMADO, BADGES, MOTIVOS_DENUNCIA, NOTIF_ICONS, COMMUNITY_POSTS, capitalize, timeAgo, fmtDateTime, badgeIndex, onlyDigits, distanciaKm, formatCpf, formatCep, cpfValido, comprimirImagem, useApiData, Button, Chip, Avatar, Stars, SectionTitle, ImpactRing, ItemCard, Toast, Loading, ErrorBox, StatusBar, TopBar, BottomNav, Screen, iconBtn, linkText, fieldLabel, fieldBox, fieldInput, EmptyState, StatBox } from "./shared.jsx";
function Historico({ go }) {
  const { loading, error, data: enviadas, reload } = useApiData(() => api.solicitacoesEnviadas(), []);
  return (
    <div>
      <TopBar title="Histórico de solicitações" onBack={() => go("perfil")} />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && (enviadas || []).length === 0 && <EmptyState Icon={Clock} text="Você ainda não solicitou nenhum item." />}
        {(enviadas || []).map(s => (
          <div key={s.id} onClick={() => go("detalhesItem", { itemId: s.item?.id })} style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14, cursor: "pointer" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: INK }}>{s.item?.titulo}</div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, margin: "4px 0 8px" }}>Solicitado em {new Date(s.criadaEm).toLocaleDateString("pt-BR")} · doador {s.item?.doador?.nome}</div>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "var(--role-soft)", color: "var(--role-primary-dark)" }}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- PERFIL ---- */
function Perfil({ go, usuario, onLogout, favorites = {}, notify }) {
  const { data: meusItens } = useApiData(() => api.meusItens(), [usuario?.id]);
  const [foto, setFoto] = useState(() => localStorage.getItem("reviva_foto_perfil") || "");
  const fotoRef = useRef(null);
  const escolherFoto = (event) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => { setFoto(leitor.result); localStorage.setItem("reviva_foto_perfil", leitor.result); };
    leitor.readAsDataURL(arquivo);
    event.target.value = "";
  };
  const sair = () => { if (window.confirm("Deseja realmente sair da sua conta?")) onLogout(); };
  const avisar = (texto) => notify?.(texto);
  return (
    <div>
      <TopBar title="Perfil" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            {foto ? <img src={foto} alt="Foto de perfil" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} /> : <Avatar label={usuario?.nome} size={64} tone="var(--role-primary)" />}
            <button type="button" onClick={() => fotoRef.current?.click()} aria-label="Alterar foto de perfil" title="Alterar foto de perfil" style={{ position: "absolute", right: -4, bottom: -2, width: 24, height: 24, borderRadius: "50%", border: "2px solid #fff", background: "var(--role-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Camera size={12} /></button>
            <input ref={fotoRef} type="file" accept="image/*" onChange={escolherFoto} style={{ display: "none" }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: INK }}>{usuario?.nome}</div>
            <div style={{ fontSize: 12, color: INK_SOFT }}>{usuario?.email}</div>
            <div style={{ fontSize: 12, color: INK_SOFT, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><Stars value={usuario?.reputacaoScore} /> {(usuario?.reputacaoScore || 0).toFixed(1)}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="button" onClick={() => go("gerenciarItens")} style={{ flex: 1, border: "1px solid #EDEBE1", borderRadius: 12, background: "#fff", padding: 10, color: INK, cursor: "pointer" }}><b>{meusItens?.length || 0}</b><br /><span style={{ fontSize: 11 }}>Meus anúncios</span></button>
          <button type="button" onClick={() => go("favoritos")} style={{ flex: 1, border: "1px solid #EDEBE1", borderRadius: 12, background: "#fff", padding: 10, color: INK, cursor: "pointer" }}><b>{Object.keys(favorites).length}</b><br /><span style={{ fontSize: 11 }}>Favoritos</span></button>
        </div>
        <SectionTitle>Configurações</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Notificações", Icon: Bell, go: "notificacoes" },
            { label: "Reputação e selos", Icon: Award, go: "reputacao" },
            { label: "Histórico de solicitações", Icon: Clock, go: "historico" },
            { label: "Comunidades", Icon: Users, go: "comunidades" },
            { label: "Endereços salvos", Icon: MapPin, action: () => avisar("O gerenciamento de endereços estará disponível em breve.") },
            { label: "Segurança", Icon: ShieldCheck, action: () => avisar("As configurações de segurança estarão disponíveis em breve.") },
            { label: "Termos de uso", Icon: FileText, action: () => avisar("Os termos de uso estarão disponíveis em breve.") },
          ].map(o => (
            <div key={o.label} onClick={() => o.go ? go(o.go) : o.action?.()} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 14, padding: "12px 14px", cursor: "pointer" }}>
              <o.Icon size={17} color="var(--role-primary)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: INK, flex: 1 }}>{o.label}</span>
              <ChevronRight size={15} color={INK_SOFT} />
            </div>
          ))}
          <div onClick={sair} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 14, padding: "12px 14px", cursor: "pointer" }}>
            <LogOut size={17} color="#9C4327" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#9C4327", flex: 1 }}>Sair</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerfilPublico({ go, usuario, onlineIds, favorites, toggleFav, params }) {
  const doador = params?.doador;
  const { loading, error, data: itens, reload } = useApiData(
    () => api.itensDeUsuario(doador?.id),
    [doador?.id],
    { skip: !doador?.id }
  );

  if (!doador?.id) return <div><TopBar title="Perfil" onBack={() => go(-1)} /><EmptyState Icon={User} text="Anunciante não encontrado." /></div>;

  return (
    <div>
      <TopBar title="Perfil do anunciante" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Avatar label={doador.nome} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: INK }}>{doador.nome}</div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, display: "flex", alignItems: "center", gap: 6 }}><Stars value={doador.reputacaoScore} /> {(doador.reputacaoScore || 0).toFixed(1)} <span>{onlineIds?.has(doador.id) ? "· online" : "· offline"}</span></div>
          </div>
        </div>
        <SectionTitle>Itens cadastrados</SectionTitle>
        {loading && <Loading label="Carregando itens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && (itens || []).length === 0 && <EmptyState Icon={Gift} text="Esta pessoa não possui itens disponíveis no momento." />}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(itens || []).map(item => <ItemCard key={item.id} item={item} usuario={usuario} onlineIds={onlineIds} favorite={!!favorites?.[item.id]} onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: item.id })} />)}
        </div>
      </div>
    </div>
  );
}

/* ---- REPUTAÇÃO ---- */
function Reputacao({ go, usuario }) {
  const idx = badgeIndex(usuario?.seloAtual);
  const pontos = usuario?.pontos || 0;
  return (
    <div>
      <TopBar title="Reputação e selos" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px", textAlign: "center" }}>
        <ImpactRing pct={Math.min(1, (usuario?.reputacaoScore || 0) / 5)} size={100} value={(usuario?.reputacaoScore || 0).toFixed(1)} label="nota média" />
        <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 8 }}>Score calculado a partir das avaliações recebidas nas suas trocas e doações.</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--role-soft)", borderRadius: 999, padding: "6px 14px", marginTop: 12, fontSize: 12.5, fontWeight: 700, color: "var(--role-primary-dark)" }}>
          <Award size={14} /> {pontos} pontos
        </div>
        <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 6 }}>
          +15 ao concluir uma doação · +5 ao confirmar um recebimento · até +10 por avaliação recebida
        </div>
        <SectionTitle>Selos conquistados</SectionTitle>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {BADGES.map((b, i) => (
            <div key={b.tier} style={{ width: 58, height: 58, borderRadius: "50%", background: b.color + "22", border: `2px solid ${b.color}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: i <= idx ? 1 : 0.35 }}>
              <Award size={22} color={b.color} />
            </div>
          ))}
        </div>
        <SectionTitle>Verificação</SectionTitle>
        <div style={{ background: "var(--role-soft)", borderRadius: 14, padding: 12, display: "flex", gap: 10, alignItems: "center", textAlign: "left" }}>
          <ShieldCheck size={20} color="var(--role-primary-dark)" />
          <div style={{ fontSize: 12, color: "var(--role-primary-dark)" }}>
            {usuario?.emailVerificado ? "E-mail verificado." : "E-mail ainda não verificado."} {usuario?.telefoneVerificado ? "Telefone verificado." : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- COMUNIDADES / FEED ---- */
function Comunidades({ go, notify, usuario }) {
  const { loading, error, data: comunidades, reload } = useApiData(() => api.comunidades(), []);
  const [entrando, setEntrando] = useState(null);

  const participar = async (c) => {
    setEntrando(c.id);
    try { await api.participarComunidade(c.id); notify(`Você entrou em ${c.nome}!`); reload(); }
    catch (e) { notify(e.message || "Não foi possível entrar."); }
    finally { setEntrando(null); }
  };

  return (
    <div>
      <TopBar title="Comunidades" onBack={() => go(-1)} right={<Bell size={18} color={INK} onClick={() => go("notificacoes")} style={{ cursor: "pointer" }} />} />
      <div style={{ padding: "0 20px" }}>
        <SectionTitle>Grupos</SectionTitle>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
          {(comunidades || []).map(c => {
            const jaEntrou = usuario && (c.membros || []).some(m => m.id === usuario.id);
            return (
              <div key={c.id} onClick={() => !jaEntrou && participar(c)} style={{ minWidth: 150, background: "#fff", border: "1px solid #EDEBE1", borderRadius: 14, padding: 12, cursor: jaEntrou ? "default" : "pointer" }}>
                <Users size={16} color="var(--role-primary)" />
                <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginTop: 6 }}>{c.nome}</div>
                <div style={{ fontSize: 10.5, color: INK_SOFT }}>{(c.membros || []).length} membros</div>
                <div style={{ fontSize: 10.5, color: "var(--role-primary-dark)", fontWeight: 700, marginTop: 4 }}>
                  {entrando === c.id ? "entrando..." : jaEntrou ? "✓ você participa" : "toque para entrar"}
                </div>
              </div>
            );
          })}
        </div>
        <SectionTitle>No feed <span style={{ fontSize: 10, fontWeight: 600, color: INK_SOFT }}>(ilustrativo)</span></SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {COMMUNITY_POSTS.map(p => (
            <div key={p.id} style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Avatar label={p.user} size={30} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{p.user}</span>
              </div>
              <div style={{ fontSize: 13, color: INK, marginTop: 8, lineHeight: 1.45 }}>{p.text}</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 8, display: "flex", gap: 4, alignItems: "center" }}><Heart size={13} /> {p.likes} apoios</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- FAVORITOS ---- */
function Favoritos({ go, favorites, toggleFav, usuario, onlineIds }) {
  const list = Object.values(favorites);
  return (
    <div>
      <TopBar title="Favoritos" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px" }}>
        {list.length === 0 ? (
          <EmptyState Icon={Heart} text="Você ainda não favoritou nenhum item. Toque no ❤ de um item para salvá-lo aqui." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map(it => <ItemCard key={it.id} item={it} usuario={usuario} onlineIds={onlineIds} favorite onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: it.id })} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- NOTIFICAÇÕES ---- */
function Notificacoes({ go, role }) {
  const { loading, error, data: notificacoes, reload } = useApiData(() => api.notificacoes(), []);
  const [acao, setAcao] = useState(false);
  const [acaoErro, setAcaoErro] = useState("");
  const expiradas = (notificacoes || []).filter(n => n.expirada);
  const marcarEAbrir = async (n) => {
    try {
      await api.marcarNotificacaoLida(n.id);
      if (n.tipo === "CHAT" && n.solicitacaoId) {
        go("chatDoador", {
          solicitacaoId: n.solicitacaoId,
          otherId: n.receptor?.id,
          otherName: n.receptor?.nome,
          itemTitulo: n.item?.titulo,
          itemId: n.item?.id,
        });
        return;
      }
      await reload();
    } catch (e) { setAcaoErro(e.message || "Não foi possível abrir a notificação."); }
  };
  const limpar = async (expiradas = false) => {
    setAcao(true);
    setAcaoErro("");
    try {
      if (expiradas) await api.excluirNotificacoesExpiradas();
      else await api.limparNotificacoes();
      await reload();
    } catch (e) { setAcaoErro(e.message || "Não foi possível atualizar as notificações."); }
    finally { setAcao(false); }
  };
  return (
    <div>
      <TopBar title="Notificações" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {!loading && !error && (notificacoes || []).length > 0 && <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <Button small variant="ghost" loading={acao} onClick={() => limpar(false)}>Limpar todas</Button>
          {expiradas.length > 0 && <Button small variant="soft" loading={acao} onClick={() => limpar(true)}>Excluir expiradas</Button>}
        </div>}
        {acaoErro && <ErrorBox message={acaoErro} />}
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && (notificacoes || []).length === 0 && <EmptyState Icon={Bell} text="Nenhuma notificação por aqui ainda." />}
        {(notificacoes || []).map(n => {
          const Icon = NOTIF_ICONS[n.tipo] || Bell;
          return (
            <div key={n.id} onClick={() => marcarEAbrir(n)} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: n.lida ? "#fff" : "var(--role-soft)", border: "1px solid #EDEBE1", borderRadius: 14, padding: 12, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color="var(--role-primary-dark)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: INK, fontWeight: n.lida ? 500 : 700, lineHeight: 1.35 }}>{n.titulo}</div>
                <div style={{ fontSize: 11, color: n.expirada ? "#9C4327" : INK_SOFT, marginTop: 3 }}>{n.expirada ? "expirada" : `há ${timeAgo(n.criadaEm)}`}</div>
              </div>
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
