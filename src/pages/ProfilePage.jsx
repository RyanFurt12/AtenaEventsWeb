import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUser } from '../api/userApi'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    getUser(user.id)
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [user?.id])

  const userName = user?.name || 'Usuário'
  const userEmail = user?.email || 'usuario@email.com'
  const avatarSrc = user?.avatarBase64 || user?.avatarUrl || null
  const initial = userName.charAt(0).toUpperCase()

  const eventsCount = profile?.eventsCreatedCount ?? '—'
  const participationsCount = profile?.participationsCount ?? '—'

  return (
    <div className="profile-page fade-in">
      <h1 className="profile-page-title">Meu Perfil</h1>

      <div className="profile-avatar-section">
        {avatarSrc ? (
          <img
            className="profile-avatar-img"
            src={avatarSrc}
            alt="Avatar"
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {initial}
          </div>
        )}
      </div>

      <p className="profile-name" style={{ textAlign: 'center', marginBottom: '4px' }}>{userName}</p>
      <p className="profile-email" style={{ textAlign: 'center', marginBottom: '32px' }}>{userEmail}</p>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '40px' }}>
        <div className="profile-stat-card">
          <span className="profile-stat-value">{eventsCount}</span>
          <span className="profile-stat-label">Eventos Criados</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-value">{participationsCount}</span>
          <span className="profile-stat-label">Participações</span>
        </div>
      </div>

      <div style={{ maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
        <button
          id="btn-edit-profile"
          className="btn-primary"
          onClick={() => navigate('/home/profile/edit')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Editar Informações
        </button>
      </div>
    </div>
  )
}
