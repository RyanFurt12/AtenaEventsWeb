import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconBack } from '../components/Icons'
import Spinner from '../components/Spinner'
import './ProfilePage.css'

const MAX_AVATAR_PX = 400
const AVATAR_QUALITY = 0.82

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, MAX_AVATAR_PX / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', AVATAR_QUALITY))
    }
    img.onerror = reject
    img.src = url
  })
}

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile, uploadAvatar, deleteAccount } = useAuth()

  const [name, setName] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarSaved, setAvatarSaved] = useState(false)
  const [error, setError] = useState(null)

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await updateProfile(name)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        navigate('/home/profile')
      }, 1200)
    } catch (err) {
      setError(err.message || 'Erro ao atualizar dados do perfil.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem válido.')
      return
    }

    setAvatarLoading(true)
    setError(null)
    try {
      const dataUrl = await compressImage(file)
      await uploadAvatar(dataUrl)
      setAvatarSaved(true)
      setTimeout(() => setAvatarSaved(false), 2000)
    } catch (err) {
      setError(err.message || 'Erro ao atualizar foto de perfil.')
    } finally {
      setAvatarLoading(false)
    }
  }

  async function handleDelete() {
    setShowDeleteDialog(false)
    setLoading(true)
    setError(null)
    try {
      await deleteAccount()
      navigate('/welcome', { replace: true })
    } catch (err) {
      setError(err.message || 'Erro ao excluir conta.')
      setLoading(false)
    }
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'
  const isDisabled = loading || avatarLoading

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px' }} className="fade-in">
      <button
        className="auth-back-btn"
        id="btn-back-edit-profile"
        onClick={() => navigate(-1)}
        disabled={isDisabled}
      >
        <IconBack /> Voltar
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '32px' }}>Editar Perfil</h1>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: '20px', fontSize: '14px' }}>{error}</div>
      )}

      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {(user?.avatarBase64 || user?.avatarUrl) ? (
            <img
              src={user.avatarBase64 || user.avatarUrl}
              alt="Avatar"
              style={{
                width: 120, height: 120, borderRadius: '50%',
                objectFit: 'cover', border: '3px solid var(--primary-light)'
              }}
            />
          ) : (
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'var(--primary)', border: '3px solid var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '48px', fontWeight: 700, color: '#fff'
            }}>
              {initial}
            </div>
          )}

          <button
            id="btn-change-avatar"
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--primary)', border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer'
            }}
            disabled={isDisabled}
            title="Alterar foto"
          >
            {avatarLoading
              ? <Spinner size={14} color="#fff" />
              : avatarSaved
                ? <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                : <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 15.2A3.2 3.2 0 1115.2 12 3.2 3.2 0 0112 15.2M20 4h-3.17L15 2H9L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"/>
                  </svg>
            }
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div className="input-group">
          <label className="input-label" htmlFor="edit-name">Nome</label>
          <input
            id="edit-name"
            className="input-field"
            type="text"
            placeholder="Digite seu nome completo"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={isDisabled}
          />
        </div>

        {user?.email && (
          <div className="input-group" style={{ marginBottom: '40px' }}>
            <label className="input-label" htmlFor="edit-email">E-mail</label>
            <input
              id="edit-email"
              className="input-field"
              type="email"
              value={user.email}
              disabled
              readOnly
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
            <button
              type="button"
              id="btn-goto-change-email"
              className="btn-text"
              onClick={() => navigate('/home/security')}
              disabled={isDisabled}
              style={{ alignSelf: 'flex-start', marginTop: '4px' }}
            >
              Alterar e-mail
            </button>
          </div>
        )}

        <button
          type="submit"
          id="btn-save-profile"
          className="btn-primary"
          style={{ marginBottom: '16px', position: 'relative' }}
          disabled={isDisabled || saved}
        >
          {loading ? <Spinner size={18} color="#fff" /> : saved ? '✓ Salvo!' : 'Salvar Alterações'}
        </button>

        <button
          type="button"
          id="btn-delete-account"
          className="btn-danger-outline"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isDisabled}
        >
          Excluir Conta
        </button>
      </form>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="dialog-backdrop" id="dialog-delete-account">
          <div className="dialog-card">
            <h2 className="dialog-title">Deletar Conta</h2>
            <p className="dialog-body">
              Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.
            </p>
            <div className="dialog-actions">
              <button
                id="btn-cancel-delete"
                className="btn-text"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-delete"
                className="btn-danger"
                onClick={handleDelete}
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
