/* ============================================================
   Reviva — camada de comunicação com o backend (Java/Spring Boot)
   Todas as chamadas HTTP do app passam por aqui.
   ============================================================ */

const TOKEN_KEY = "reviva_token";

/** Em DEV, usa o mesmo host da página (:8080) para funcionar no PC e no celular na mesma rede. */
function baseUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV && typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }
  return "";
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
  const BASE_URL = baseUrl();
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

export const api = {
  /* ---------------- Auth / Usuário ---------------- */
  registrar: (payload) =>
    request("/api/auth/registrar", { method: "POST", auth: false, body: payload }),

  login: (email, senha) =>
    request("/api/auth/login", { method: "POST", auth: false, body: { email, senha } }),

  recuperarSenha: (email, cpf, novaSenha) =>
    request("/api/auth/recuperar-senha", { method: "POST", auth: false, body: { email, cpf, novaSenha } }),

  me: () => request("/api/usuarios/me"),

  atualizarPerfil: (payload) => request("/api/usuarios/me", { method: "PUT", body: payload }),

  reputacaoDe: (usuarioId) => request(`/api/usuarios/${usuarioId}/reputacao`),

  perfilPublico: (usuarioId) => request(`/api/usuarios/${usuarioId}/publico`, { auth: false }),

  avaliacoesDe: (usuarioId) => request(`/api/usuarios/${usuarioId}/avaliacoes`, { auth: false }),

  itensDeUsuario: (usuarioId) => request(`/api/usuarios/${usuarioId}/itens`),

  /* ---------------- Segurança e preferências ---------------- */
  alterarSenha: (senhaAtual, novaSenha) =>
    request("/api/usuarios/me/senha", { method: "POST", body: { senhaAtual, novaSenha } }),

  preferencias: () => request("/api/usuarios/me/preferencias"),

  salvarPreferencias: (payload) => request("/api/usuarios/me/preferencias", { method: "PUT", body: payload }),

  /* ---------------- Endereços salvos ---------------- */
  enderecos: () => request("/api/enderecos"),

  criarEndereco: (payload) => request("/api/enderecos", { method: "POST", body: payload }),

  editarEndereco: (id, payload) => request(`/api/enderecos/${id}`, { method: "PUT", body: payload }),

  excluirEndereco: (id) => request(`/api/enderecos/${id}`, { method: "DELETE" }),

  definirEnderecoPrincipal: (id) => request(`/api/enderecos/${id}/principal`, { method: "POST" }),

  /* ---------------- Geolocalização (CEP) ---------------- */
  // Preenche bairro/cidade/lat/long automaticamente a partir do CEP ao
  // cadastrar item ou atualizar localização — não usamos CPF (dado sensível
  // sem API pública legítima de endereço).
  buscarCep: (cep) => request(`/api/geo/cep/${cep.replace(/\D/g, "")}`, { auth: false }),

  /* ---------------- Itens ---------------- */
  listarItens: ({ categoria, tipo, termo, cidade, uf, disponiveis } = {}) =>
    request("/api/itens", { params: { categoria, tipo, termo, cidade: cidade?.trim(), uf: uf?.trim().toUpperCase(), disponiveis } }),

  itemPorId: (id) => request(`/api/itens/${id}`),

  meusItens: () => request("/api/itens/meus"),

  criarItem: (payload) => request("/api/itens", { method: "POST", body: payload }),

  editarItem: (id, payload) => request(`/api/itens/${id}`, { method: "PUT", body: payload }),

  marcarItemComoDoado: (id) => request(`/api/itens/${id}/doado`, { method: "POST" }),

  /* ---------------- Solicitações ---------------- */
  solicitar: (itemId, mensagem) =>
    request("/api/solicitacoes", { method: "POST", body: { itemId, mensagem } }),

  solicitacoesRecebidas: () => request("/api/solicitacoes/recebidas"),

  solicitacoesEnviadas: () => request("/api/solicitacoes/enviadas"),

  conversas: () => request("/api/solicitacoes/conversas"),

  solicitacaoPorId: (id) => request(`/api/solicitacoes/${id}`),

  /* ---------------- Chat (mensagens por solicitação) ---------------- */
  listarMensagens: (solicitacaoId) => request(`/api/solicitacoes/${solicitacaoId}/mensagens`),

  enviarMensagem: (solicitacaoId, texto) =>
    request(`/api/solicitacoes/${solicitacaoId}/mensagens`, { method: "POST", body: { texto } }),

  marcarMensagensLidas: (solicitacaoId) =>
    request(`/api/solicitacoes/${solicitacaoId}/mensagens/lidas`, { method: "POST" }),

  /* ---------------- Notificações ---------------- */
  notificacoes: ({ todas = false } = {}) => request("/api/notificacoes", { params: { todas: todas || undefined } }),

  marcarNotificacaoLida: (id) => request(`/api/notificacoes/${id}/lida`, { method: "POST" }),

  /* ---------------- Comunidades ---------------- */
  comunidades: () => request("/api/comunidades"),

  participarComunidade: (id) => request(`/api/comunidades/${id}/participar`, { method: "POST" }),

  sairComunidade: (id) => request(`/api/comunidades/${id}/sair`, { method: "POST" }),

  /* ---------------- Favoritos ---------------- */
  favoritos: () => request("/api/favoritos"),

  adicionarFavorito: (itemId) => request(`/api/favoritos/${itemId}`, { method: "POST" }),

  removerFavorito: (itemId) => request(`/api/favoritos/${itemId}`, { method: "DELETE" }),

};

export { ApiError };
