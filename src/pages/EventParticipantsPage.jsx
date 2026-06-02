import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEvent, getEventParticipants, notifyParticipants } from '../api/eventApi'
import { IconBack, IconSearch, IconBell } from '../components/Icons'
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

function NotifyModal({ phase, sending, onCancel, onConfirm }) {
  const [message, setMessage] = useState('')
  const isPre = phase === 'PRE'

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <h2 className="dialog-title">
          {isPre ? 'Enviar lembrete (pré-evento)' : 'Enviar agradecimento (pós-evento)'}
        </h2>
        <p className="dialog-body">
          O email será enviado a todos os participantes com email cadastrado. Convidados sem
          email não recebem. Você pode adicionar uma mensagem personalizada (opcional).
        </p>
        <textarea
          className="input-field"
          placeholder="Mensagem do organizador (opcional)..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          disabled={sending}
          style={{ width: '100%', resize: 'vertical', marginBottom: '8px' }}
        />
        <div className="dialog-actions">
          <button className="btn-text" onClick={onCancel} disabled={sending}>Cancelar</button>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
            onClick={() => onConfirm(message)}
            disabled={sending}
          >
            {sending ? <Spinner size={14} color="#fff" /> : 'Enviar email'}
          </button>
        </div>
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
  const [notifyPhase, setNotifyPhase] = useState(null) // 'PRE' | 'POST' | null
  const [sending, setSending] = useState(false)
  const [notifyFeedback, setNotifyFeedback] = useState(null)

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

  function handleNotifyClick(phase) {
    const blockReason =
      phase === 'PRE'
        ? (isFuture ? null : 'O lembrete pré-evento só pode ser enviado antes da data do evento.')
        : (isPast   ? null : 'O agradecimento pós-evento só pode ser enviado após a data do evento.')
    if (blockReason) {
      setNotifyFeedback(blockReason)
      return
    }
    setNotifyFeedback(null)
    setNotifyPhase(phase)
  }

  async function handleSendNotification(customMessage) {
    const phase = notifyPhase
    setSending(true)
    try {
      const { sent } = await notifyParticipants(eventId, phase, customMessage)
      // Marca a fase como enviada localmente (sem refetch)
      setEvent(prev => ({
        ...prev,
        ...(phase === 'PRE'
          ? { preEventNotifiedAt: new Date().toISOString() }
          : { postEventNotifiedAt: new Date().toISOString() }),
      }))
      setNotifyFeedback(
        sent > 0
          ? `Email enviado a ${sent} participante${sent === 1 ? '' : 's'}.`
          : 'Nenhum participante com email para notificar.'
      )
      setNotifyPhase(null)
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Erro ao enviar emails.'
      setNotifyFeedback(msg)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <Spinner size={48} />

  if (error) {
    return (
      <div className="participants-container">
        <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>
      </div>
    )
  }

  const now = new Date()
  const eventDate = event?.date ? new Date(event.date) : null
  const isFuture = eventDate ? eventDate > now : false
  const isPast = eventDate ? eventDate < now : false
  const preSentAt = event?.preEventNotifiedAt
  const postSentAt = event?.postEventNotifiedAt

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

      {/* Notificações por email — pré e pós evento, uma vez cada */}
      <div className="notify-panel">
        <div className="notify-panel-header">
          <IconBell />
          <span>Notificar participantes por email</span>
        </div>

        <div className="notify-actions">
          <div className="notify-action">
            {preSentAt ? (
              <span className="notify-sent">✓ Lembrete enviado em {formatDate(preSentAt)}</span>
            ) : (
              <button
                className={`btn-primary${isFuture ? '' : ' btn-primary-muted'}`}
                id="btn-notify-pre"
                style={{ width: 'auto', padding: '10px 20px', fontSize: '13px' }}
                onClick={() => handleNotifyClick('PRE')}
                title={isFuture ? '' : 'Disponível apenas antes da data do evento'}
              >
                Enviar lembrete (pré-evento)
              </button>
            )}
          </div>

          <div className="notify-action">
            {postSentAt ? (
              <span className="notify-sent">✓ Agradecimento enviado em {formatDate(postSentAt)}</span>
            ) : (
              <button
                className={`btn-primary${isPast ? '' : ' btn-primary-muted'}`}
                id="btn-notify-post"
                style={{ width: 'auto', padding: '10px 20px', fontSize: '13px' }}
                onClick={() => handleNotifyClick('POST')}
                title={isPast ? '' : 'Disponível apenas após a data do evento'}
              >
                Enviar agradecimento (pós-evento)
              </button>
            )}
          </div>
        </div>

        {notifyFeedback && (
          <p className="notify-feedback">{notifyFeedback}</p>
        )}
      </div>

      <div className="participants-search-wrap">
        <IconSearch />
        <input
          className="participants-search-input"
          type="text"
          placeholder="Buscar por nome..."
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

      {notifyPhase && (
        <NotifyModal
          phase={notifyPhase}
          sending={sending}
          onCancel={() => setNotifyPhase(null)}
          onConfirm={handleSendNotification}
        />
      )}
    </div>
  )
}
