import React, { useState, useEffect, useRef } from "react";
import { api, getToken, setToken, wsUrl } from "./api.js";
import { Client as StompClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ROLE_COLORS, StatusBar, Toast, BottomNav } from "./screens/shared.jsx";
import * as authScreens from "./screens/authScreens.jsx";
import * as discoveryScreens from "./screens/discoveryScreens.jsx";
import * as itemScreens from "./screens/itemScreens.jsx";
import * as tradeScreens from "./screens/tradeScreens.jsx";
import * as accountScreens from "./screens/accountScreens.jsx";

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
};

export default function RevivaApp() {
  const [nav, setNav] = useState({ screen: "splash", params: {} });
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("reviva_favoritos") || "{}"); } catch { return {}; }
  });
  const [toast, setToast] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [conteudoRolado, setConteudoRolado] = useState(false);
  const [onlineIds, setOnlineIds] = useState(() => new Set());
  const usuarioRef = useRef(null);
  useEffect(() => { usuarioRef.current = usuario; }, [usuario]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    localStorage.setItem("reviva_favoritos", JSON.stringify(favorites));
  }, [favorites]);

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
      if (e.status === 401 || e.status === 403) logout();
    }
  };

  const finishSplash = () => {
    if (usuarioRef.current) {
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
        client.__heartbeat = setInterval(enviarHeartbeat, 10000);
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
    setNav({ screen: "homeDoador", params: {} }); // perfil unificado: sempre a mesma home
    notify(`Bem-vindo(a) de volta, ${u?.nome?.split(" ")[0] || ""}!`);
  };

  const handleRegister = async (payload) => {
    const res = await api.registrar(payload);
    setToken(res.token);
    await refreshUsuario();
    setHistory([]);
    setNav({ screen: "onboarding", params: {} });
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    setHistory([]);
    setNav({ screen: "auth", params: {} });
  };

  const setRole = async (r) => {
    setUsuario(u => u ? { ...u, perfilAtivo: r.toUpperCase() } : u);
    try { await api.trocarPerfilAtivo(r.toUpperCase()); }
    catch (e) { notify("Não foi possível trocar o perfil: " + e.message); }
  };

  const toggleFav = (item) => setFavorites(f => {
    const n = { ...f };
    if (n[item.id]) delete n[item.id];
    else n[item.id] = item;
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
    case "splash": ScreenView = <authScreens.Splash onDone={finishSplash} />; break;
    case "auth": ScreenView = <authScreens.Auth go={go} onLogin={handleLogin} onRegister={handleRegister} />; break;
    case "onboarding": ScreenView = <authScreens.Onboarding go={go} />; break;
    case "chooseProfile": ScreenView = <authScreens.ChooseProfile go={go} setRole={setRole} />; break;
    case "homeDoador": ScreenView = <discoveryScreens.HomeDoador go={go} usuario={usuario} compact={conteudoRolado} notify={notify} />; break;
    case "cadastroItem": ScreenView = <itemScreens.CadastroItem go={go} notify={notify} params={params} usuario={usuario} />; break;
    case "gerenciarItens": ScreenView = <itemScreens.GerenciarItens go={go} notify={notify} />; break;
    case "chatDoador": ScreenView = <tradeScreens.Chat go={go} role="doador" notify={notify} params={params} usuario={usuario} onlineIds={onlineIds} />; break;
    case "inbox": ScreenView = <tradeScreens.Inbox go={go} usuario={usuario} />; break;
    case "agendamentoDoador": ScreenView = <tradeScreens.Agendamento go={go} role="doador" notify={notify} params={params} usuario={usuario} />; break;
    case "confirmDoacao": ScreenView = <tradeScreens.ConfirmDoacao go={go} notify={notify} params={params} usuario={usuario} refreshUsuario={refreshUsuario} />; break;
    case "avaliarReceptor": ScreenView = <tradeScreens.Avaliar go={go} notify={notify} params={params} />; break;
    case "dashboardImpacto": ScreenView = <tradeScreens.DashboardImpacto go={go} usuario={usuario} />; break;
    case "homeReceptor": ScreenView = <discoveryScreens.HomeReceptor go={go} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} compact={conteudoRolado} notify={notify} />; break;
    case "busca": ScreenView = <discoveryScreens.Busca go={go} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} />; break;
    case "listaItens": ScreenView = <itemScreens.ListaItens go={go} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} params={params} />; break;
    case "detalhesItem": ScreenView = <itemScreens.DetalhesItem go={go} notify={notify} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} params={params} />; break;
    case "solicitacao": ScreenView = <itemScreens.Solicitacao go={go} notify={notify} params={params} />; break;
    case "chatReceptor": ScreenView = <tradeScreens.Chat go={go} role="receptor" notify={notify} params={params} usuario={usuario} onlineIds={onlineIds} />; break;
    case "agendamentoReceptor": ScreenView = <tradeScreens.Agendamento go={go} role="receptor" notify={notify} params={params} usuario={usuario} />; break;
    case "confirmRecebimento": ScreenView = <tradeScreens.ConfirmRecebimento go={go} notify={notify} params={params} usuario={usuario} refreshUsuario={refreshUsuario} />; break;
    case "avaliarDoador": ScreenView = <tradeScreens.Avaliar go={go} notify={notify} params={params} />; break;
    case "historico": ScreenView = <accountScreens.Historico go={go} />; break;
    case "perfil": ScreenView = <accountScreens.Perfil go={go} usuario={usuario} favorites={favorites} notify={notify} onLogout={logout} />; break;
    case "perfilPublico": ScreenView = <accountScreens.PerfilPublico go={go} usuario={usuario} onlineIds={onlineIds} favorites={favorites} toggleFav={toggleFav} params={params} />; break;
    case "reputacao": ScreenView = <accountScreens.Reputacao go={go} usuario={usuario} />; break;
    case "comunidades": ScreenView = <accountScreens.Comunidades go={go} notify={notify} usuario={usuario} />; break;
    case "favoritos": ScreenView = <accountScreens.Favoritos go={go} favorites={favorites} toggleFav={toggleFav} usuario={usuario} onlineIds={onlineIds} />; break;
    case "notificacoes": ScreenView = <accountScreens.Notificacoes go={go} role={role} />; break;
    case "moderacao": ScreenView = <accountScreens.Moderacao go={go} notify={notify} params={params} />; break;
    default: ScreenView = <div />;
  }

  return (
    <div className="reviva-shell" style={{
      "--role-primary": colors.primary, "--role-primary-dark": colors.primaryDark, "--role-soft": colors.soft,
      "--font-display": "'Fraunces', ui-serif, Georgia, serif", "--font-ui": "'Inter', ui-sans-serif, system-ui, sans-serif",
      minHeight: "100vh", background: "radial-gradient(circle at 20% 10%, #F3F1E6, #E9ECE3 60%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 20px", fontFamily: "var(--font-ui)",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes favorite-pulse { 0% { transform: scale(1); } 45% { transform: scale(1.3); } 100% { transform: scale(1); } }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #B7BBAF; }

        .reviva-phone-outer {
          width: 390px; height: 812px; border-radius: 46px; background: #0E120F; padding: 12px;
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
        @media (max-width: 480px) {
          html, body, #root { height: 100%; }
          .reviva-shell { min-height: 100dvh; padding: 0 !important; }
          .reviva-phone-outer {
            width: 100vw; height: 100dvh; border-radius: 0; padding: 0; box-shadow: none;
          }
          .reviva-phone-inner { border-radius: 0 !important; }
          .reviva-notch { display: none; }
        }
      `}</style>

      <div className="reviva-phone-outer">
        <div className="reviva-phone-inner" style={{ width: "100%", height: "100%", borderRadius: 34, background: "var(--role-primary)", overflow: "hidden", position: "relative", transition: "background .3s" }}>
          <div style={{ width: "100%", height: "100%", background: "#FBFAF4", display: "flex", flexDirection: "column", position: "relative" }}>
            <div className="reviva-notch" />
            <StatusBar />
            <div style={{ flex: 1, overflowY: "auto" }} onScroll={e => setConteudoRolado(e.currentTarget.scrollTop > 20)}>
              {ScreenView}
            </div>
            {showNav && <BottomNav active={screen} go={go} />}
            <Toast text={toast} show={!!toast} />
          </div>
        </div>
      </div>
    </div>
  );
}
