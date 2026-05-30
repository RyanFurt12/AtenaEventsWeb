import { useNavigate, useLocation } from 'react-router-dom'
import { IconStar, IconHome, IconCalendar, IconSettings, IconPerson, IconAdd } from './Icons'
import './Sidebar.css'

const NAV = [
  { icon: <IconHome />,     label: 'Início',   path: '/home' },
  { icon: <IconCalendar />, label: 'Eventos',  path: '/home/events' },
  { icon: <IconSettings />, label: 'Config',   path: '/home/settings' },
  { icon: <IconPerson />,   label: 'Perfil',   path: '/home/profile' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (path) =>
    path === '/home' ? pathname === '/home' : pathname.startsWith(path)

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-dot"><IconStar /></div>
        <span className="sidebar-logo-text">Atena <span>Event</span></span>
      </div>

      {/* Nav items */}
      {NAV.map(({ icon, label, path }) => (
        <button
          key={path}
          className={`nav-item${isActive(path) ? ' active' : ''}`}
          id={`nav-${label.toLowerCase()}`}
          onClick={() => navigate(path)}
        >
          {icon} {label}
        </button>
      ))}

      <div className="sidebar-spacer" />

      <button
        className="sidebar-add-btn"
        id="btn-novo-evento"
        onClick={() => navigate('/home/new')}
      >
        <IconAdd /> <span>Novo Evento</span>
      </button>
    </aside>
  )
}
