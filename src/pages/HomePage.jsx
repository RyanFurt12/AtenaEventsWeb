import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRecommended } from '../api/eventApi'
import { IconPlay } from '../components/Icons'
import Spinner from '../components/Spinner'
import './HomePage.css'

function formatDate(iso) {
  if (!iso) return ''
  // Handle ISO date format "YYYY-MM-DD"
  const parts = iso.split('T')[0].split('-')
  if (parts.length < 3) return iso
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await getRecommended()
        setEvents(data || [])
      } catch (err) {
        console.error('Error loading recommended events:', err)
        setError('Não foi possível carregar os eventos. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <Spinner size={48} />
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        <p>{error}</p>
        <button className="btn-primary" style={{ maxWidth: '200px', margin: '20px auto 0' }} onClick={() => window.location.reload()}>
          Tentar Novamente
        </button>
      </div>
    )
  }

  const [ev0, ev1, ev2, ...rest] = events

  // Fallback mocks if database is completely empty
  const hasEvents = events.length > 0

  return (
    <div className="home-container">
      {/* Greeting */}
      <div className="home-greeting">
        <h1>Olá, {user?.name || 'Usuário'} 👋</h1>
        <p>Esperamos que esteja bem! =D</p>
      </div>

      {!hasEvents ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Nenhum evento recomendado disponível no momento.</p>
          <button
            className="btn-primary"
            style={{ maxWidth: '240px', margin: '20px auto 0' }}
            onClick={() => navigate('/home/new')}
          >
            Criar Primeiro Evento
          </button>
        </div>
      ) : (
        <>
          {/* Event cards grid */}
          <div className="event-cards-row">
            {[ev0, ev1].filter(Boolean).map(ev => {
              const imageUrl = ev.imageBase64 || `https://picsum.photos/600/300?random=${ev.id}`
              return (
                <div
                  key={ev.id}
                  className="event-card event-card-img"
                  id={`event-card-${ev.id}`}
                  style={{ backgroundImage: `url(${imageUrl})` }}
                  onClick={() => navigate(`/events/${ev.id}`)}
                >
                  <div className="event-card-overlay">
                    <span className="event-card-badge">{ev.type}</span>
                    <div className="event-card-spacer" />
                    <p className="event-card-title event-card-title-white">{ev.title}</p>
                    <div className="event-card-footer">
                      <span className="event-card-date event-card-date-white">{formatDate(ev.date)}</span>
                      <span className="event-card-arrow-white">›</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Featured banner */}
          {ev2 && (
            <div
              className="featured-banner"
              id="featured-banner"
              onClick={() => navigate(`/events/${ev2.id}`)}
            >
              <img src={ev2.imageBase64 || `https://picsum.photos/1000/320?random=${ev2.id}`} alt={ev2.title} />
              <div className="featured-banner-overlay">
                <span className="featured-banner-title">{ev2.title}</span>
                <span className="featured-banner-meta">{ev2.type} • {formatDate(ev2.date)}</span>
              </div>
              <button className="featured-banner-play" id="btn-play-featured">
                <IconPlay />
              </button>
            </div>
          )}

          {/* Recommended list */}
          {rest.length > 0 && (
            <>
              <div className="section-header">
                <span className="section-title">Recomendados para Você</span>
                <span className="section-link" id="link-ver-todos">Ver todos</span>
              </div>

              <div className="recommended-scroll">
                {rest.map(rec => (
                  <div
                    key={rec.id}
                    className="rec-card"
                    id={`rec-card-${rec.id}`}
                    onClick={() => navigate(`/events/${rec.id}`)}
                  >
                    <img className="rec-card-img" src={rec.imageBase64 || `https://picsum.photos/600/300?random=${rec.id}`} alt={rec.title} />
                    <div className="rec-card-body">
                      <p className="rec-card-meta">{rec.type} • {formatDate(rec.date)}</p>
                      <p className="rec-card-title">{rec.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
