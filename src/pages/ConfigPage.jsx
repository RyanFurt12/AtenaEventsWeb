import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './ConfigPage.css'

export default function ConfigPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const items = [
    {
      id: 'notifications',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
      ),
      label: 'Notificações',
      sub: 'Gerenciar alertas e e-mails',
    },
    {
      id: 'privacy',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M18 8h-1V6A5 5 0 007 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3.1-9H8.9V6a3.1 3.1 0 016.2 0v2z"/>
        </svg>
      ),
      label: 'Privacidade e Segurança',
      sub: 'Alterar senha e gerenciar dados',
      onClick: () => navigate('/home/security'),
    },
    {
      id: 'about',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      ),
      label: 'Sobre o Aplicativo',
      sub: 'Versão, termos e licenças',
    },
  ]

  async function handleLogout() {
    await logout()
    navigate('/welcome', { replace: true })
  }

  return (
    <>
      <div className="config-header">
        <h1 className="config-title">Configurações</h1>
        <p className="config-sub">Ajuste suas preferências e gerencie sua conta.</p>
      </div>

      <div className="config-list">
        {items.map((item, i) => (
          <div key={item.id}>
            <button
              id={`config-item-${item.id}`}
              className="config-item"
              onClick={item.onClick ?? (() => {})}
            >
              <div className="config-item-icon">{item.icon}</div>
              <div className="config-item-body">
                <p className="config-item-label">{item.label}</p>
                <p className="config-item-sub">{item.sub}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{ color: 'var(--text-hint)', flexShrink: 0 }}>
                <path d="M9.29 6.71a1 1 0 000 1.41L13.17 12l-3.88 3.88a1 1 0 101.41 1.41l4.59-4.59a1 1 0 000-1.41L10.7 6.7a1 1 0 00-1.41.01z"/>
              </svg>
            </button>
            {i < items.length - 1 && <div className="config-divider" />}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '32px', maxWidth: '320px' }}>
        <button
          id="btn-logout"
          className="btn-danger"
          onClick={handleLogout}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4a2 2 0 00-2 2v14a2 2 0 002 2h8v-2H4V5z"/>
          </svg>
          Sair da Conta
        </button>
      </div>
    </>
  )
}
