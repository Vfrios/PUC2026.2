/* ============================================================
   Reviva — camada de comunicação com o backend (Java/Spring Boot)
   Todas as chamadas HTTP do app passam por aqui.
   ============================================================ */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const TOKEN_KEY = "reviva_token";

// SockJS precisa de uma URL absoluta; quando BASE_URL é "" (deploy same-origin),
// completamos com a origem atual do navegador.
export function wsUrl() {
  const base = BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return base + "/ws";
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = true, params } = {}) {
  let url = BASE_URL + path;

  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const s = qs.toString();
    if (s) url += (url.includes("?") ? "&" : "?") + s;
  }

  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      cache: "no-store",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError(
      "Não foi possível conectar à API em " + BASE_URL + ". Confirme que o backend está rodando (mvn spring-boot:run).",
      0
    );
  }

  if (res.status === 204) return null;

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg = (data && (data.erro || data.message)) || `Erro ${res.status}`;
    throw new ApiError(msg, res.status);
  }
  return data;
}

/* ---------------- Auth / Usuário ---------------- */
export const api = {
  registrar: (payload) =>
    request("/api/auth/registrar", { method: "POST", auth: false, body: payload }),

  login: (email, senha) =>
    request("/api/auth/login", { method: "POST", auth: false, body: { email, senha } }),

  me: () => request("/api/usuarios/me"),

  atualizarLocalizacao: (latitude, longitude, raioBuscaKm) =>
    request("/api/usuarios/me/localizacao", { method: "PATCH", params: { latitude, longitude, raioBuscaKm } }),

  reputacaoDe: (usuarioId) => request(`/api/usuarios/${usuarioId}/reputacao`),

  itensDeUsuario: (usuarioId) => request(`/api/usuarios/${usuarioId}/itens`, { auth: false }),

  /* ---------------- Geolocalização (CEP) ---------------- */
  // Preenche bairro/cidade/lat/long automaticamente a partir do CEP ao
  // cadastrar item ou atualizar localização — não usamos CPF (dado sensível
  // sem API pública legítima de endereço).
  buscarCep: (cep) => request(`/api/geo/cep/${cep.replace(/\D/g, "")}`, { auth: false }),

  // Geolocalização automática (tela de Busca): coordenadas do navegador -> cidade/UF.
  reverseGeo: (latitude, longitude) => request("/api/geo/reverse", { auth: false, params: { lat: latitude, lon: longitude } }),

  /* ---------------- Regiões (IBGE) — selects de Estado/Cidade na busca ---------------- */
  listarEstados: () => request("/api/geo/estados", { auth: false }),

  listarCidades: (uf) => request(`/api/geo/estados/${uf}/cidades`, { auth: false }),

  /* ---------------- Itens ---------------- */
  listarItens: ({ categoria, tipo, termo, cidade, uf } = {}) =>
    request("/api/itens", { params: { categoria, tipo, termo, cidade: cidade?.trim(), uf: uf?.trim().toUpperCase() } }),

  itemPorId: (id) => request(`/api/itens/${id}`, { auth: false }),

  meusItens: () => request("/api/itens/meus"),

  criarItem: (payload) => request("/api/itens", { method: "POST", body: payload }),

  editarItem: (id, payload) => request(`/api/itens/${id}`, { method: "PUT", body: payload }),

  marcarItemComoDoado: (id) => request(`/api/itens/${id}/doado`, { method: "POST" }),

  removerItem: (id) => request(`/api/itens/${id}`, { method: "DELETE" }),

  restaurarItem: (id) => request(`/api/itens/${id}/restaurar`, { method: "POST" }),

  /* ---------------- Solicitações ---------------- */
  solicitar: (itemId, mensagem) =>
    request("/api/solicitacoes", { method: "POST", body: { itemId, mensagem } }),

  solicitacoesRecebidas: () => request("/api/solicitacoes/recebidas"),

  solicitacoesEnviadas: () => request("/api/solicitacoes/enviadas"),

  conversas: () => request("/api/solicitacoes/conversas"),

  /* ---------------- Chat (mensagens por solicitação) ---------------- */
  listarMensagens: (solicitacaoId) => request(`/api/solicitacoes/${solicitacaoId}/mensagens`),

  enviarMensagem: (solicitacaoId, texto) =>
    request(`/api/solicitacoes/${solicitacaoId}/mensagens`, { method: "POST", body: { texto } }),

  /* ---------------- Agendamento ---------------- */
  agendar: (solicitacaoId, dataHora, localEncontro) =>
    request("/api/agendamentos", { method: "POST", body: { solicitacaoId, dataHora, localEncontro } }),

  agendamentoDaSolicitacao: (solicitacaoId) => request(`/api/agendamentos/solicitacao/${solicitacaoId}`).catch(error => {
    if (error.status === 404) return null;
    throw error;
  }),
  cancelarAgendamento: (solicitacaoId) => request(`/api/agendamentos/solicitacao/${solicitacaoId}/cancelar`, { method: "POST" }),
  confirmarAgendamento: (id) => request(`/api/agendamentos/${id}/confirmar-agendamento`, { method: "POST" }),

  confirmarPorDoador: (id) => request(`/api/agendamentos/${id}/confirmar-doador`, { method: "POST" }),
  gerarCodigoRetirada: (id) => request(`/api/agendamentos/${id}/gerar-codigo`, { method: "POST" }),

  confirmarPorReceptor: (id) => request(`/api/agendamentos/${id}/confirmar-receptor`, { method: "POST" }),

  confirmarPorQrCode: (id, token) =>
    request(`/api/agendamentos/${id}/confirmar-qrcode`, { method: "POST", params: { token } }),

  reportarProblema: (id) => request(`/api/agendamentos/${id}/reportar-problema`, { method: "POST" }),

  /* ---------------- Avaliações ---------------- */
  avaliar: (agendamentoId, avaliadoId, nota, comentario) =>
    request("/api/avaliacoes", { method: "POST", body: { agendamentoId, avaliadoId, nota, comentario } }),

  /* ---------------- Notificações ---------------- */
  notificacoes: () => request("/api/notificacoes"),

  marcarNotificacaoLida: (id) => request(`/api/notificacoes/${id}/lida`, { method: "POST" }),

  limparNotificacoes: () => request("/api/notificacoes", { method: "DELETE" }),

  excluirNotificacoesExpiradas: () => request("/api/notificacoes/expiradas", { method: "DELETE" }),

  /* ---------------- Comunidades ---------------- */
  comunidades: () => request("/api/comunidades", { auth: false }),

  participarComunidade: (id) => request(`/api/comunidades/${id}/participar`, { method: "POST" }),

  /* ---------------- Denúncias ---------------- */
  denunciar: (motivo, detalhes) =>
    request("/api/denuncias", { method: "POST", body: { motivo, detalhes } }),
};

export { ApiError };
