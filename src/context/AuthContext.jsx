import { createContext, useContext, useState, useCallback } from 'react'
import * as userApi from '../api/userApi'
import { api, clearTokens, saveTokens } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'atena_user'
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function readStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch (_) { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStorage)
  // user = { id, name, email, avatarBase64, guest, username } | null

  const persistUser = useCallback((data) => {
    setUser(data)
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    else       localStorage.removeItem(STORAGE_KEY)
  }, [])

  const isGuest = user?.guest === true
  const guestEventId = user?.guestEventId ?? null

  // After login/register, if there was a guest session in localStorage, merge it.
  // Called AFTER tokens are updated (by userApi.login/register) but BEFORE
  // persistUser overwrites the stored user — so the guest ID is still readable.
  async function maybeMergeGuest() {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!stored?.guest || !stored?.id) return
    try {
      await api.post('/auth/merge-guest', { guestId: stored.id })
    } catch (_) {
      // Non-fatal — user just won't have the guest participation linked
    }
  }

  const login = useCallback(async (email, password) => {
    const userData = await userApi.login(email, password)
    await maybeMergeGuest()
    persistUser(userData)
    return userData
  }, [persistUser])

  const register = useCallback(async (name, email, password) => {
    const userData = await userApi.register(name, email, password)
    await maybeMergeGuest()
    persistUser(userData)
    return userData
  }, [persistUser])

  const logout = useCallback(async () => {
    try {
      await userApi.logout()
    } catch (_) {
      // Garante logout mesmo com erro de rede
    }
    clearTokens()
    persistUser(null)
  }, [persistUser])

  // ── Guest session ──────────────────────────────────────────────────────────

  const loginAsGuest = useCallback(async (username) => {
    const data = await api.post('/auth/guest', { username })
    // Guests receive only an access token (no refresh token)
    saveTokens(data.accessToken, null)
    persistUser(data.user)
    return data.user
  }, [persistUser])

  // Locks the guest to a specific event — reads localStorage directly to avoid
  // stale-closure issues (called right after loginAsGuest, before React re-renders)
  const setGuestEvent = useCallback((eventId) => {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!current?.guest) return
    persistUser({ ...current, guestEventId: Number(eventId) })
  }, [persistUser])

  // ── Account upgrade ────────────────────────────────────────────────────────

  const upgradeWithPassword = useCallback(async (name, email, password) => {
    const data = await api.post('/auth/upgrade/password', { name, email, password })
    saveTokens(data.accessToken, data.refreshToken)
    persistUser(data.user)
    return data.user
  }, [persistUser])

  // ── OAuth ──────────────────────────────────────────────────────────────────

  const loginWithOAuth = useCallback((provider, upgradeGuestId = null) => {
    if (upgradeGuestId) {
      sessionStorage.setItem('pending_guest_upgrade', String(upgradeGuestId))
    }
    const base = `${API_BASE}/oauth2/authorization/${provider.toLowerCase()}`
    const url = upgradeGuestId ? `${base}?upgradeGuestId=${upgradeGuestId}` : base
    window.location.href = url
  }, [])

  const handleOAuthCallback = useCallback((accessToken, refreshToken) => {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const userData = {
        id: parseInt(payload.sub),
        name: payload.name,
        email: payload.email ?? null,
        avatarBase64: null,
        avatarUrl: payload.avatarUrl ?? null,
        guest: payload.guest === true,
        username: null,
        hasPassword: false, // contas OAuth não têm senha local
      }
      saveTokens(accessToken, refreshToken)
      persistUser(userData)
    } catch (_) {
      clearTokens()
      persistUser(null)
    }
  }, [persistUser])

  // ── Profile actions ────────────────────────────────────────────────────────

  const updateProfile = useCallback(async (name) => {
    if (!user) throw new Error('Não autenticado')
    const data = await userApi.updateUser(user.id, name)
    persistUser(data)
    return data
  }, [user, persistUser])

  // Troca de senha estando logado (exige senha atual)
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user) throw new Error('Não autenticado')
    await userApi.changePassword(user.id, currentPassword, newPassword)
  }, [user])

  // Inicia troca de email — envia link de confirmação para o novo endereço
  const requestEmailChange = useCallback(async (currentPassword, newEmail) => {
    if (!user) throw new Error('Não autenticado')
    await userApi.requestEmailChange(user.id, currentPassword, newEmail)
  }, [user])

  const uploadAvatar = useCallback(async (avatarBase64) => {
    if (!user) throw new Error('Não autenticado')
    const data = await userApi.uploadAvatar(user.id, avatarBase64)
    persistUser(data)
    return data
  }, [user, persistUser])

  const deleteAccount = useCallback(async () => {
    if (!user) throw new Error('Não autenticado')
    await userApi.deleteUser(user.id)
    clearTokens()
    persistUser(null)
  }, [user, persistUser])

  return (
    <AuthContext.Provider value={{
      user, isGuest, guestEventId, persistUser,
      login, register, logout,
      loginAsGuest, setGuestEvent, upgradeWithPassword, loginWithOAuth, handleOAuthCallback,
      updateProfile, uploadAvatar, deleteAccount,
      changePassword, requestEmailChange,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
