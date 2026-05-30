import { useAuth } from '../context/AuthContext'
import { IconBell, IconSearch } from './Icons'
import './Topbar.css'

export default function Topbar({ title }) {
  const { user } = useAuth()
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-actions">
        <button className="topbar-icon-btn" id="btn-search" title="Buscar">
          <IconSearch />
        </button>
        <button className="topbar-icon-btn" id="btn-notifications" title="Notificações">
          <IconBell />
        </button>
        <div className="topbar-avatar" title={user?.name || 'Perfil'}>
          {(user?.avatarBase64 || user?.avatarUrl)
            ? <img src={user.avatarBase64 || user.avatarUrl} alt={user.name} />
            : initial}
        </div>
      </div>
    </header>
  )
}
