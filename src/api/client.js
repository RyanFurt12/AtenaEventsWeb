// Base HTTP client — usa VITE_API_URL do .env
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const TOKEN_KEY = 'atena_access_token'
const REFRESH_KEY = 'atena_refresh_token'

// ── Token storage ────────────────────────────────────────────────────────────

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function saveTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken)
  // Guests have no refresh token — clear any stale one
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  else              localStorage.removeItem(REFRESH_KEY)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// ── Core request ─────────────────────────────────────────────────────────────

let isRefreshing = false
let refreshPromise = null

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`

  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res = await fetch(url, { headers, ...options })

  // Se receber 401 e temos refresh token, tenta renovar
  if (res.status === 401 && getRefreshToken() && !path.startsWith('/auth/')) {
    try {
      await tryRefresh()
      // Retry com o novo token
      const newToken = getAccessToken()
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
      }
      res = await fetch(url, { headers, ...options })
    } catch (_) {
      // Refresh falhou — limpa tudo e redireciona
      forceLogout()
      throw new Error('Sessão expirada. Faça login novamente.')
    }
  }

  if (!res.ok) {
    let message = `Erro inesperado (HTTP ${res.status})`
    if (res.status === 400) message = 'Dados inválidos. Verifique os campos e tente novamente.'
    if (res.status === 401) message = 'Credenciais inválidas.'
    if (res.status === 403) message = 'Você não tem permissão para esta ação.'
    if (res.status === 404) message = 'Recurso não encontrado.'
    if (res.status === 409) message = 'Conflito — este recurso já existe.'
    if (res.status === 500) message = 'Erro interno do servidor. Tente novamente mais tarde.'
    try {
      const err = await res.json()
      // Suporta tanto o formato clássico Spring Boot (error/message)
      // quanto RFC 9457 Problem Details (detail/title), padrão no Spring Boot 4.x
      const detail = err.detail ?? err.error ?? err.message ?? err.title ?? null
      if (detail) message = detail
    } catch (_) {}

    if (res.status === 401) {
      forceLogout()
    }

    throw new Error(message)
  }

  // 204 No Content
  if (res.status === 204) return null
  return res.json()
}

// ── Refresh logic ────────────────────────────────────────────────────────────

async function tryRefresh() {
  // Evita múltiplos refreshes simultâneos
  if (isRefreshing) return refreshPromise

  isRefreshing = true
  refreshPromise = doRefresh()

  try {
    return await refreshPromise
  } finally {
    isRefreshing = false
    refreshPromise = null
  }
}

async function doRefresh() {
  const rt = getRefreshToken()
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  })

  if (!res.ok) {
    clearTokens()
    throw new Error('Refresh failed')
  }

  const data = await res.json()
  saveTokens(data.accessToken, data.refreshToken)
  // Também atualiza o user no localStorage
  if (data.user) {
    localStorage.setItem('atena_user', JSON.stringify(data.user))
  }
}

function forceLogout() {
  clearTokens()
  localStorage.removeItem('atena_user')
  const p = window.location.pathname
  if (!p.startsWith('/signin') && !p.startsWith('/signup') && !p.startsWith('/welcome')) {
    // Guests arrive via /events/:id — send them back to welcome rather than signin
    const isEventPath = p.startsWith('/events/')
    window.location.href = isEventPath ? '/welcome' : '/signin'
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export const api = {
  get:    (path, opts)         => request(path, { method: 'GET', ...opts }),
  post:   (path, body, opts)   => request(path, { method: 'POST',   body: JSON.stringify(body), ...opts }),
  put:    (path, body, opts)   => request(path, { method: 'PUT',    body: JSON.stringify(body), ...opts }),
  delete: (path, opts)         => request(path, { method: 'DELETE', ...opts }),
}
