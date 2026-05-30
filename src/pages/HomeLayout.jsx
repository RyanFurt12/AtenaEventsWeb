import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import HomePage from './HomePage'
import MyEventsPage from './MyEventsPage'
import ConfigPage from './ConfigPage'
import SecurityPage from './SecurityPage'
import ProfilePage from './ProfilePage'
import EditProfilePage from './EditProfilePage'
import CreateEventPage from './CreateEventPage'
import EventParticipantsPage from './EventParticipantsPage'

const TITLES = {
  '':             'Início',
  'events':       'Meus Eventos',
  'settings':     'Configurações',
  'security':     'Privacidade e Segurança',
  'profile':      'Perfil',
  'edit':         'Editar Perfil',
  'new':          'Criar Evento',
  'participants': 'Participantes',
}

function useTitle() {
  const { pathname } = useLocation()
  const seg = pathname.split('/').pop()
  return TITLES[seg] ?? 'Atena Event'
}

export default function HomeLayout() {
  const title = useTitle()

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <main className="page fade-in">
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="events"       element={<MyEventsPage />} />
            <Route path="settings"     element={<ConfigPage />} />
            <Route path="security"     element={<SecurityPage />} />
            <Route path="profile"      element={<ProfilePage />} />
            <Route path="profile/edit" element={<EditProfilePage />} />
            <Route path="new"          element={<CreateEventPage />} />
            <Route path="events/:eventId/participants" element={<EventParticipantsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
