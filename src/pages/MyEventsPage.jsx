import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getCreatedBy, getParticipatedBy } from '../api/eventApi'
import { IconSearch } from '../components/Icons'
import Spinner from '../components/Spinner'
import './MyEventsPage.css'

function EventTile({ event, onClick }) {
  const imageUrl = event.imageBase64 || `https://picsum.photos/400/300?random=${event.id}`
  return (
    <div
      className="my-event-tile"
      id={`my-event-${event.id}`}
      onClick={onClick}
    >
      <img src={imageUrl} alt={event.title} />
      <div className="my-event-tile-overlay">
        <span className="my-event-tile-title">{event.title}</span>
      </div>
    </div>
  )
}

function EventSection({ title, events, onNavigate }) {
  return (
    <div className="my-events-section">
      <h2 className="my-events-section-title">{title}</h2>
      {events.length === 0 ? (
        <div className="my-events-empty">
          <p>Nenhum evento encontrado.</p>
        </div>
      ) : (
        <div className="my-events-grid">
          {events.map((ev) => (
            <EventTile key={ev.id} event={ev} onClick={() => onNavigate(ev.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MyEventsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [createdEvents, setCreatedEvents] = useState([])
  const [participatedEvents, setParticipatedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchId, setSearchId] = useState('')

  useEffect(() => {
    if (!user) return

    async function loadMyEvents() {
      try {
        setLoading(true)
        setError(null)
        const [created, participated] = await Promise.all([
          getCreatedBy(user.id),
          getParticipatedBy(user.id)
        ])
        setCreatedEvents(created || [])
        setParticipatedEvents(participated || [])
      } catch (err) {
        console.error('Error loading my events:', err)
        setError('Erro ao carregar seus eventos. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    loadMyEvents()
  }, [user])

  function handleSearch(e) {
    e.preventDefault()
    const id = parseInt(searchId.trim(), 10)
    if (!isNaN(id)) {
      navigate(`/events/${id}`)
    }
  }

  if (loading) {
    return <Spinner size={48} />
  }

  return (
    <div className="my-events-container">
      <div className="my-events-header">
        <p>Gerencie seus eventos e participações.</p>
      </div>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: '20px', fontSize: '14px' }}>{error}</div>
      )}

      {/* Search bar */}
      <form className="my-events-search" onSubmit={handleSearch} id="form-search-event">
        <div className="my-events-search-input-wrap">
          <IconSearch />
          <input
            id="input-search-event-id"
            className="my-events-search-input"
            type="number"
            placeholder="Buscar evento pelo ID"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
          />
        </div>
        <button type="submit" id="btn-search-event" className="my-events-search-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
          </svg>
        </button>
      </form>

      <EventSection
        title="Meus Eventos Criados"
        events={createdEvents}
        onNavigate={id => navigate(`/events/${id}`)}
      />

      <EventSection
        title="Eventos que Estou Participando"
        events={participatedEvents}
        onNavigate={id => navigate(`/events/${id}`)}
      />
    </div>
  )
}
