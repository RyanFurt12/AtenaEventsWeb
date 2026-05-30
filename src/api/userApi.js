import { api, saveTokens, clearTokens } from './client'

// POST /auth/register → AuthResponseDTO { accessToken, refreshToken, user }
export const register = async (name, email, password) => {
  const data = await api.post('/auth/register', { name, email, password })
  saveTokens(data.accessToken, data.refreshToken)
  return data.user
}

// POST /auth/login → AuthResponseDTO { accessToken, refreshToken, user }
export const login = async (email, password) => {
  const data = await api.post('/auth/login', { email, password })
  saveTokens(data.accessToken, data.refreshToken)
  return data.user
}

// POST /auth/logout
export const logout = async () => {
  const rt = localStorage.getItem('atena_refresh_token')
  if (rt) {
    try {
      await api.post('/auth/logout', { refreshToken: rt })
    } catch (_) {
      // Ignora erros de logout — o token será invalidado no servidor
    }
  }
  clearTokens()
}

// GET /users/{id} → UserDTO
export const getUser = (id) =>
  api.get(`/users/${id}`)

// PUT /users/{id} → UserDTO  (apenas nome — email é trocado por fluxo próprio)
export const updateUser = (id, name) =>
  api.put(`/users/${id}`, { name })

// DELETE /users/{id} → 204
export const deleteUser = (id) =>
  api.delete(`/users/${id}`)

// POST /users/{id}/avatar → UserDTO
export const uploadAvatar = (id, avatarBase64) =>
  api.post(`/users/${id}/avatar`, { avatarBase64 })

// POST /users/{id}/password → 204
export const changePassword = (id, currentPassword, newPassword) =>
  api.post(`/users/${id}/password`, { currentPassword, newPassword })

// POST /users/{id}/email → 202 (envia link de confirmação para o novo email)
export const requestEmailChange = (id, currentPassword, newEmail) =>
  api.post(`/users/${id}/email`, { currentPassword, newEmail })

// POST /auth/forgot-password → 200 (sempre, mesmo se o email não existir)
export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email })

// POST /auth/reset-password → 204
export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', { token, newPassword })

// POST /auth/confirm-email → 204
export const confirmEmail = (token) =>
  api.post('/auth/confirm-email', { token })
