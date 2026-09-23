import React, { useState, useEffect, useRef } from "react";
import { api, getToken, setToken, wsUrl } from "./api.js";
import { ChevronUp } from "lucide-react";
import { Client as StompClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ROLE_COLORS, StatusBar, Toast, BottomNav } from "./shared/index.jsx";
import * as onboardingScreens from "./onboarding/index.jsx";
import * as authScreens from "./auth/index.jsx";
import * as conjunto1Screens from "./conjuntos/conjunto-01-publicacao-gestao/index.jsx";
import * as conjunto2Screens from "./conjuntos/conjunto-02-descoberta-detalhes/index.jsx";
import * as conjunto3Screens from "./conjuntos/conjunto-03-solicitacao-chat/index.jsx";
import * as conjunto4Screens from "./conjuntos/conjunto-04-perfil-reputacao/index.jsx";
import * as conjunto5Screens from "./conjuntos/conjunto-05-comunidades-favoritos/index.jsx";
import * as conjunto6Screens from "./conjuntos/conjunto-06-endereco-seguranca/index.jsx";

/* ============================================================
   APP SHELL
   ============================================================ */

const SCREEN_LABELS = {
  splash:"Abertura", auth:"Login", onboarding:"Onboarding", chooseProfile:"Escolha de perfil",
  homeDoador:"Home · Doador", cadastroItem:"Cadastro de item", gerenciarItens:"Gerenciar itens",
  chatDoador:"Chat", agendamentoDoador:"Agendamento", confirmDoacao:"Confirmação de doação",
  inbox:"Inbox",
  avaliarReceptor:"Avaliar receptor", dashboardImpacto:"Dashboard de impacto",
  homeReceptor:"Home · Receptor", busca:"Busca", listaItens:"Lista de itens",
  detalhesItem:"Detalhes do item", solicitacao:"Solicitação", chatReceptor:"Chat",
  agendamentoReceptor:"Agendamento", confirmRecebimento:"Confirmação de recebimento",
  avaliarDoador:"Avaliar doador", historico:"Histórico", perfil:"Perfil", reputacao:"Reputação",
  comunidades:"Comunidades", favoritos:"Favoritos",
  perfilPublico:"Perfil do anunciante",
  notificacoes:"Notificações", moderacao:"Moderação",
  enderecos:"Endereços salvos", seguranca:"Segurança e privacidade", termos:"Termos de uso", privacidade:"Política de privacidade",
};

function lerLinkCompartilhado() {
  const p = new URLSearchParams(window.location.search);
  if (p.get("item")) return { screen: "detalhesItem", params: { itemId: p.get("item") } };
  if (p.get("perfil")) return { screen: "perfilPublico", params: { usuarioId: p.get("perfil") } };
  return null;
}

export default function RevivaApp() {
  const [nav, setNav] = useState({ screen: "splash", params: {} });
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState({});
  const linkCompartilhadoRef = useRef(lerLinkCompartilhado());
  const notifAnteriorRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [conteudoRolado, setConteudoRolado] = useState(false);
  const [onlineIds, setOnlineIds] = useState(() => new Set());
  const [notifNaoLidas, setNotifNaoLidas] = useState(0);
  const scrollContainerRef = useRef(null);
  const usuarioRef = useRef(null);
  useEffect(() => { usuarioRef.current = usuario; }, [usuario]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // Mobile (iOS/Safari/Chrome): ao abrir o teclado o viewport encolhe e, ao
  // fechar, o layout às vezes fica "preso" com gap embaixo. Sincronizamos a
  // altura real via Visual Viewport e forçamos o scroll do documento a 0.
  useEffect(() => {
    const root = document.documentElement;
    let blurTimer = 0;

    const syncViewport = () => {
      const vv = window.visualViewport;
      const height = Math.round(vv?.height || window.innerHeight);
      root.style.setProperty("--app-height", `${height}px`);
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };

    const onFocusOut = () => {
      window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(syncViewport, 80);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    window.addEventListener("orientationchange", syncViewport);
    window.addEventListener("focusout", onFocusOut);
    window.visualViewport?.addEventListener("resize", syncViewport);
    window.visualViewport?.addEventListener("scroll", syncViewport);

    return () => {
      window.clearTimeout(blurTimer);
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
      window.removeEventListener("focusout", onFocusOut);
      window.visualViewport?.removeEventListener("resize", syncViewport);
      window.visualViewport?.removeEventListener("scroll", syncViewport);
    };
  }, []);

  // Favoritos ficam na API (por conta). Os que existiam só no navegador são enviados uma vez.
  useEffect(() => {
    if (!usuario?.id) { setFavorites({}); return undefined; }
    let alive = true;
    (async () => {
      let antigos = {};
      try { antigos = JSON.parse(localStorage.getItem("reviva_favoritos") || "{}"); } catch { /* formato antigo inválido */ }
      try {
        const ids = Object.keys(antigos);
        if (ids.length) {
          await Promise.allSettled(ids.map(id => api.adicionarFavorito(id)));
          localStorage.removeItem("reviva_favoritos");
        }
        const lista = await api.favoritos();
        if (!alive) return;
        setFavorites(Object.fromEntries((lista || []).filter(f => f.item).map(f => [f.itemId, f.item])));
      } catch { /* sem conexão: corações começam vazios */ }
    })();
    return () => { alive = false; };
  }, [usuario?.id]);

  const notify = (text) => { setToast(text); setTimeout(() => setToast(null), 2400); };

  const go = (key, params = {}) => {
    if (key === -1) {
      setHistory(h => {
        const n = [...h];
        const prev = n.pop();
        setNav(prev || { screen: "perfil", params: {} });
        return n;
      });
      return;
    }
    setHistory(h => [...h, nav]);
    setNav({ screen: key, params });
  };

  const screen = nav.screen;
  const params = nav.params;

  // Badge global do sino: atualiza a cada 10s e ao trocar de tela.
  useEffect(() => {
    if (!usuario?.id || !getToken()) {
      notifAnteriorRef.current = null;
      setNotifNaoLidas(0);
      return undefined;
    }
    let alive = true;
    const carregar = () => {
      api.notificacoes()
        .then(lista => {
          if (!alive) return;
          const naoLidas = (lista || []).filter(n => !n.lida);
          const anterior = notifAnteriorRef.current;
          notifAnteriorRef.current = naoLidas.length;
          setNotifNaoLidas(naoLidas.length);
          if (anterior !== null && naoLidas.length > anterior && naoLidas[0] && screen !== "notificacoes") {
            const nova = naoLidas[0];
            const ehChatAberto = nova.tipo === "CHAT" && nav.params?.solicitacaoId === nova.solicitacaoId;
            if (!ehChatAberto) notify(nova.titulo);
          }
        })
        .catch(() => {});
    };
    carregar();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") carregar();
    }, 10_000);
    const onFocus = () => carregar();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [usuario?.id, screen]);

  const refreshUsuario = async () => {
    if (!getToken()) return;
    try {
      const u = await api.me();
      setUsuario(u);
      return u;
    } catch (e) {
      // 401 = token ausente/expirado; 403 = token não corresponde a nenhum
      // usuário válido (ex.: sessão salva de um banco que já foi reiniciado).
      // Nos dois casos o certo é encerrar a sessão local e voltar ao login,
      // em vez de deixar o app "preso" tentando usar um token inválido.
      if (e.status === 401 || e.status === 403) {
        logout();
        throw e;
      }
    }
  };

  const abrirLinkCompartilhado = () => {
    const destino = linkCompartilhadoRef.current;
    if (!destino) return false;
    linkCompartilhadoRef.current = null;
    window.history.replaceState(null, "", window.location.pathname);
    setHistory([{ screen: "homeDoador", params: {} }]);
    setNav(destino);
    return true;
  };

  const finishSplash = () => {
    if (usuarioRef.current) {
      if (abrirLinkCompartilhado()) return;
      go("homeDoador"); // perfil unificado: sempre a mesma home, sem escolher Doador/Receptor
    } else {
      go("auth");
    }
  };

  useEffect(() => {
    if (!getToken()) return;
    refreshUsuario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!usuario || !getToken()) {
      setOnlineIds(new Set());
      return;
    }
    const client = new StompClient({
      webSocketFactory: () => new SockJS(`${wsUrl()}?token=${encodeURIComponent(getToken() || "")}`),
      reconnectDelay: 4000,
      onConnect: () => {
        client.subscribe("/topic/presence", frame => {
          const evento = JSON.parse(frame.body);
          setOnlineIds(atual => {
            const proximo = new Set(atual);
            if (evento.online) proximo.add(evento.usuarioId);
            else proximo.delete(evento.usuarioId);
            return proximo;
          });
        });
        const enviarHeartbeat = () => {
          if (!client.connected) return;
          client.publish({ destination: "/app/presence/heartbeat", body: "{}" });
        };
        enviarHeartbeat();
        const snapshot = client.subscribe("/app/presence/online", frame => {
          setOnlineIds(new Set(JSON.parse(frame.body)));
          snapshot.unsubscribe();
        });
        client.__heartbeat = setInterval(enviarHeartbeat, 10000);
      },
      onWebSocketClose: () => {
        if (client.__heartbeat) clearInterval(client.__heartbeat);
        setOnlineIds(new Set());
      },
    });
    client.activate();
    return () => {
      if (client.__heartbeat) clearInterval(client.__heartbeat);
      client.deactivate();
    };
  }, [usuario?.id]);

  const handleLogin = async (email, senha) => {
    const res = await api.login(email, senha);
    setToken(res.token);
    const u = await refreshUsuario();
    setHistory([]);
    if (!abrirLinkCompartilhado()) setNav({ screen: "homeDoador", params: {} }); // perfil unificado: sempre a mesma home
    notify(`Bem-vindo(a) de volta, ${u?.nome?.split(" ")[0] || ""}!`);
  };

  const handleRegister = async (payload) => {
    try {
      const res = await api.registrar(payload);
      setToken(res.token);
      await refreshUsuario();
      setHistory([]);
      setNav({ screen: "onboarding", params: {} });
    } catch (e) {
      if (e.status === 409) {
        setToken(null);
        setUsuario(null);
      }
      throw e;
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    setHistory([]);
    setNav({ screen: "auth", params: {} });
  };

  const setRole = async (r) => {
    setNav({ screen: r.toUpperCase() === "RECEPTOR" ? "homeReceptor" : "homeDoador", params: {} });
  };

  const toggleFav = async (item) => {
    const estava = !!favorites[item.id];
    setFavorites(f => {
      const n = { ...f };
      if (estava) delete n[item.id];
      else n[item.id] = item;
      return n;
    });
    try {
      if (estava) await api.removerFavorito(item.id);
      else await api.adicionarFavorito(item.id);
    } catch (e) {
      setFavorites(f => {
        const n = { ...f };
        if (estava) n[item.id] = item;
        else delete n[item.id];
        return n;
      });
      notify(e.message || "Não foi possível atualizar os favoritos.");
    }
  };

  const onFavoritosRemovidos = (ids) => setFavorites(f => {
    const n = { ...f };
    ids.forEach(id => delete n[id]);
    return n;
  });

  // Perfil unificado: uma conta só, sem alternância Doador/Receptor.
  // Mantido como constante para não quebrar as chamadas de tema/navegação
  // abaixo que ainda recebem `role` (ex.: Chat/Agendamento por transação).
  const role = "doador";
  const colors = ROLE_COLORS[role];
  const telasSemNavegacao = ["splash", "auth", "onboarding", "chooseProfile"];
  const showNav = usuario && !telasSemNavegacao.includes(screen);

  let ScreenView;
  switch (screen) {
    case "splash": ScreenView = <onboardingScreens.Splash onDone={finishSplash} />; break;
    case "auth": ScreenView = <authScreens.Auth go={go} onLogin={handleLogin} onRegister={handleRegister} />; break;
    case "onboarding": ScreenView = <onboardingScreens.Onboarding go={go} />; break;
    case "chooseProfile": ScreenView = <onboardingScreens.ChooseProfile go={go} setRole={setRole} />; break;
    case "homeDoador": ScreenView = <conjunto2Screens.HomeDoador go={go} usuario={usuario} compact={conteudoRolado} notify={notify} notifNaoLidas={notifNaoLidas} />; break;
    case "cadastroItem": ScreenView = <conjunto1Screens.CadastroItem go={go} notify={notify} params={params} usuario={usuario} />; break;
    case "gerenciarItens": ScreenView = <conjunto1Screens.GerenciarItens go={go} notify={notify} />; break;
    case "chatDoador": ScreenView = <conjunto3Screens.Chat go={go} role="doador" notify={notify} params={params} usuario={usuario} onlineIds={onlineIds} />; break;
    case "inbox": ScreenView = <conjunto3Screens.Inbox go={go} usuario={usuario} />; break;
    case "agendamentoDoador": ScreenView = <conjunto3Screens.Agendamento go={go} role="doador" notify={notify} params={params} usuario={usuario} />; break;
    case "confirmDoacao": ScreenView = <conjunto3Screens.ConfirmDoacao go={go} notify={notify} params={params} usuario={usuario} refreshUsuario={refreshUsuario} />; break;
    case "avaliarReceptor": ScreenView = <conjunto3Screens.Avaliar go={go} notify={notify} params={params} />; break;
    case "dashboardImpacto": ScreenView = <conjunto3Screens.DashboardImpacto go={go} usuario={usuario} />; break;
    case "homeReceptor": ScreenView = <conjunto2Screens.HomeReceptor go={go} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} compact={conteudoRolado} notify={notify} notifNaoLidas={notifNaoLidas} />; break;
    case "busca": ScreenView = <conjunto2Screens.Busca go={go} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} />; break;
    case "listaItens": ScreenView = <conjunto2Screens.ListaItens go={go} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} params={params} />; break;
    case "detalhesItem": ScreenView = <conjunto2Screens.DetalhesItem go={go} notify={notify} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} params={params} />; break;
    case "solicitacao": ScreenView = <conjunto3Screens.Solicitacao go={go} notify={notify} params={params} usuario={usuario} />; break;
    case "chatReceptor": ScreenView = <conjunto3Screens.Chat go={go} role="receptor" notify={notify} params={params} usuario={usuario} onlineIds={onlineIds} />; break;
    case "agendamentoReceptor": ScreenView = <conjunto3Screens.Agendamento go={go} role="receptor" notify={notify} params={params} usuario={usuario} />; break;
    case "confirmRecebimento": ScreenView = <conjunto3Screens.ConfirmRecebimento go={go} notify={notify} params={params} usuario={usuario} refreshUsuario={refreshUsuario} />; break;
    case "avaliarDoador": ScreenView = <conjunto3Screens.Avaliar go={go} notify={notify} params={params} />; break;
    case "historico": ScreenView = <conjunto4Screens.Historico go={go} />; break;
    case "perfil": ScreenView = <conjunto4Screens.Perfil go={go} usuario={usuario} favorites={favorites} notify={notify} onLogout={logout} refreshUsuario={refreshUsuario} />; break;
    case "perfilPublico": ScreenView = <conjunto4Screens.PerfilPublico go={go} usuario={usuario} onlineIds={onlineIds} favorites={favorites} toggleFav={toggleFav} params={params} notify={notify} />; break;
    case "reputacao": ScreenView = <conjunto4Screens.Reputacao go={go} usuario={usuario} refreshUsuario={refreshUsuario} />; break;
    case "comunidades": ScreenView = <conjunto5Screens.Comunidades go={go} notify={notify} usuario={usuario} />; break;
    case "favoritos": ScreenView = <conjunto5Screens.Favoritos go={go} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} notify={notify} onFavoritosRemovidos={onFavoritosRemovidos} />; break;
    case "notificacoes": ScreenView = <conjunto6Screens.Notificacoes go={go} role={role} usuario={usuario} />; break;
    case "enderecos": ScreenView = <conjunto6Screens.Enderecos go={go} notify={notify} usuario={usuario} refreshUsuario={refreshUsuario} />; break;
    case "seguranca": ScreenView = <conjunto6Screens.Seguranca go={go} notify={notify} usuario={usuario} />; break;
    case "termos": ScreenView = <conjunto6Screens.Termos go={go} />; break;
    case "privacidade": ScreenView = <conjunto6Screens.Privacidade go={go} />; break;
    case "moderacao": ScreenView = <conjunto4Screens.Moderacao go={go} notify={notify} params={params} />; break;
    default: ScreenView = <div />;
  }

  return (
    <div className="reviva-shell" style={{
      "--role-primary": colors.primary, "--role-primary-dark": colors.primaryDark, "--role-soft": colors.soft,
      "--font-display": "'Fraunces', ui-serif, Georgia, serif", "--font-ui": "'Inter', ui-sans-serif, system-ui, sans-serif",
      width: "100vw", minHeight: "var(--app-height, 100dvh)", background: "radial-gradient(circle at 20% 10%, #F3F1E6, #E9ECE3 60%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "var(--shell-pad-y) 20px", fontFamily: "var(--font-ui)", overflow: "hidden",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes favorite-pulse { 0% { transform: scale(1); } 45% { transform: scale(1.3); } 100% { transform: scale(1); } }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #B7BBAF; }

        .reviva-phone-outer {
          width: min(390px, calc(100vw - 20px));
          height: min(812px, calc(var(--app-height, 100dvh) - 2 * var(--shell-pad-y)));
          max-width: 100%;
          border-radius: 46px; background: #0E120F; padding: 12px;
          box-shadow: 0 30px 60px -12px rgba(20,30,20,.35), 0 0 0 1px rgba(0,0,0,.05);
          position: relative;
        }
        .reviva-notch {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 120px; height: 26px; background: #0E120F; border-radius: 14px; margin-top: 8px; z-index: 50;
        }

        /* Em telas de celular a moldura decorativa vira a própria tela do app,
           ocupando 100% da viewport, sem padding/borda e sem precisar rolar
           pra enxergar o app inteiro. */
        :root { --shell-pad-y: clamp(10px, 3vh, 32px); }

        @media (max-width: 480px) {
          .reviva-shell {
            position: fixed;
            inset: 0;
            width: 100%;
            height: var(--app-height, 100dvh);
            min-height: var(--app-height, 100dvh);
            padding: 0 !important;
            justify-content: stretch;
            align-items: stretch;
          }
          .reviva-phone-outer {
            width: 100%; height: 100%; border-radius: 0; padding: 0; box-shadow: none;
            max-width: none; max-height: none;
          }
          .reviva-phone-inner { border-radius: 0 !important; }
          .mobile-status-bar-wrapper { display: none; }
          .reviva-notch { display: none; }
        }
      `}</style>

      <div className="reviva-phone-outer">
        <div className="reviva-phone-inner" style={{ width: "100%", height: "100%", borderRadius: 34, background: "var(--role-primary)", overflow: "hidden", position: "relative", transition: "background .3s" }}>
          <div style={{ width: "100%", height: "100%", background: "#FBFAF4", display: "flex", flexDirection: "column", position: "relative" }}>
            <div className="reviva-notch" />
            <div className="mobile-status-bar-wrapper">
              <StatusBar />
            </div>
            <div ref={scrollContainerRef} style={{ flex: 1, overflowY: "auto" }} onScroll={e => setConteudoRolado(e.currentTarget.scrollTop > 300)}>
              {ScreenView}
            </div>
            {screen === "busca" && conteudoRolado && <button
              type="button"
              aria-label="Voltar ao topo"
              title="Voltar ao topo"
              onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
              style={{
                position: "absolute", right: 18, bottom: 76, width: 46, height: 46,
                border: "none", borderRadius: "50%", background: "var(--role-primary)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", zIndex: 55, boxShadow: "0 8px 20px rgba(22,40,31,.28)",
                transition: "transform .2s ease, box-shadow .2s ease, background .2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 24px rgba(22,40,31,.36)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(22,40,31,.28)"; }}
              onMouseDown={e => { e.currentTarget.style.transform = "scale(.94)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            ><ChevronUp size={22} strokeWidth={2.5} /></button>}
            {showNav && <BottomNav active={screen} go={go} />}
            <Toast text={toast} show={!!toast} />
          </div>
        </div>
      </div>
    </div>
  );
}
