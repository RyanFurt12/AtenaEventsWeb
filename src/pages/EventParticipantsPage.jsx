import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvent, getEventParticipants } from '../api/eventApi'
import { IconBack, IconSearch } from '../components/Icons'
import Spinner from '../components/Spinner'
import './EventParticipantsPage.css'
import './auth.css'

const TYPE_LABELS = {
  GUEST:    { label: 'Convidado', cls: 'badge-guest' },
  GOOGLE:   { label: 'Google',    cls: 'badge-google' },
  GITHUB:   { label: 'GitHub',    cls: 'badge-github' },
  PASSWORD: { label: 'Email',     cls: 'badge-password' },
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function Avatar({ participant }) {
  const src = participant.avatarBase64 || participant.avatarUrl
  const initials = (participant.name || '?').charAt(0).toUpperCase()

  return (
    <div className="participant-avatar">
      {src ? <img src={src} alt={participant.name} /> : initials}
    </div>
  )
}

function ParticipantCard({ participant }) {
  const typeInfo = TYPE_LABELS[participant.accountType] ?? { label: participant.accountType, cls: 'badge-password' }

  return (
    <div className="participant-card">
      <Avatar participant={participant} />
      <div className="participant-info">
        <div className="participant-name">{participant.name}</div>
        <div className="participant-email">
          {participant.email || <em style={{ opacity: .6 }}>Sem email</em>}
        </div>
      </div>
      <div className="participant-right">
        <span className={`participant-type-badge ${typeInfo.cls}`}>{typeInfo.label}</span>
        <span className="participant-date">{formatDate(participant.joinedAt)}</span>
      </div>
    </div>
  )
}

export default function EventParticipantsPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [ev, parts] = await Promise.all([
          getEvent(eventId),
          getEventParticipants(eventId),
        ])
        setEvent(ev)
        setParticipants(parts)
      } catch (err) {
        setError(err.message || 'Erro ao carregar participantes.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [eventId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return participants
    return participants.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    )
  }, [participants, search])

  if (loading) return <Spinner size={48} />

  if (error) {
    return (
      <div className="participants-container">
        <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="participants-container">
      <button
        className="auth-back-btn"
        id="btn-back-participants"
        onClick={() => navigate(-1)}
      >
        <IconBack /> Voltar
      </button>

      <div className="participants-event-info">
        <div>
          <div className="participants-event-title">{event?.title}</div>
          <div className="participants-event-meta">
            {event?.date ? formatDate(event.date) : ''}{event?.type ? ` · ${event.type}` : ''}
          </div>
        </div>
        <span className="participants-count-badge">
          {participants.length} {participants.length === 1 ? 'participante' : 'participantes'}
        </span>
      </div>

      <div className="participants-search-wrap">
        <IconSearch />
        <input
          className="participants-search-input"
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="participants-empty">
          {search ? 'Nenhum participante encontrado.' : 'Nenhum participante ainda.'}
        </div>
      ) : (
        <div className="participants-list">
          {filtered.map(p => (
            <ParticipantCard key={p.userId} participant={p} />
          ))}
        </div>
      )}
    </div>
  )
}
