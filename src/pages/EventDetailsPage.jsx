import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEvent } from '../api/eventApi'
import { isParticipating, toggleParticipation } from '../api/participationApi'
import { getComments, createComment, updateComment, deleteComment } from '../api/commentApi'
import { IconBack, IconPerson, IconCalendar } from '../components/Icons'
import Spinner from '../components/Spinner'
import GuestJoinModal from '../components/GuestJoinModal'
import UpgradeAccountModal from '../components/UpgradeAccountModal'
import Whiteboard from '../components/Whiteboard/Whiteboard'
import './EventDetailsPage.css'

function formatDate(iso) {
  if (!iso) return ''
  const parts = iso.split('T')[0].split('-')
  if (parts.length < 3) return iso
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

function isWithin24h(isoDate) {
  if (!isoDate) return false
  return new Date() - new Date(isoDate) < 24 * 60 * 60 * 1000
}

function wasEdited(createdAt, updatedAt) {
  if (!createdAt || !updatedAt) return false
  return new Date(updatedAt) - new Date(createdAt) > 2000
}

function CommentItem({ comment, currentUserId, isEventOwner, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const [saving, setSaving] = useState(false)

  const isAuthor = comment.authorId === currentUserId
  const withinWindow = isWithin24h(comment.createdAt)
  const canEdit = isAuthor && withinWindow
  const canDelete = (isAuthor && withinWindow) || isEventOwner

  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!editText.trim()) return
    setSaving(true)
    try {
      const updated = await updateComment(comment.id, editText.trim())
      onUpdate(updated)
      setEditing(false)
    } catch {
      alert('Erro ao editar comentário. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setEditText(comment.text)
    setEditing(false)
  }

  async function handleDelete() {
    if (!window.confirm('Remover este comentário?')) return
    try {
      await deleteComment(comment.id)
      onDelete(comment.id)
    } catch {
      alert('Erro ao remover comentário.')
    }
  }

  return (
    <div className="comment-item" id={`comment-${comment.id}`}>
      <div className="comment-avatar">
        {(comment.authorAvatarBase64 || comment.authorAvatarUrl)
          ? <img src={comment.authorAvatarBase64 || comment.authorAvatarUrl} alt={comment.authorName} />
          : (comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'U')}
      </div>
      <div className="comment-bubble">
        <div className="comment-bubble-header">
          <p className="comment-author">{comment.authorName || 'Usuário'}</p>
          {(canEdit || canDelete) && (
            <div className="comment-actions">
              {canEdit && !editing && (
                <button
                  className="comment-action-btn"
                  onClick={() => setEditing(true)}
                  title="Editar comentário"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
              )}
              {canDelete && (
                <button
                  className="comment-action-btn comment-action-delete"
                  onClick={handleDelete}
                  title="Remover comentário"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSaveEdit} className="comment-edit-form">
            <input
              className="input-field comment-edit-input"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              disabled={saving}
              autoFocus
            />
            <div className="comment-edit-actions">
              <button type="submit" className="btn-primary comment-edit-save" disabled={saving || !editText.trim()}>
                {saving ? <Spinner size={14} color="#fff" /> : 'Salvar'}
              </button>
              <button type="button" className="btn-text" onClick={handleCancelEdit} disabled={saving}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="comment-text">{comment.text}</p>
            {wasEdited(comment.createdAt, comment.updatedAt) && (
              <span className="comment-edited-label">(editado)</span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── CommentAuthModal (inline — simple, no separate file needed) ───────────────
function CommentAuthModal({ onClose, onUpgrade }) {
  const navigate = useNavigate()
  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <h2 className="dialog-title">Conta necessária</h2>
        <p className="dialog-body">
          Para deixar comentários é necessário ter uma conta completa. É rápido e gratuito!
        </p>
        <div className="dialog-actions">
          <button className="btn-text" onClick={onClose}>Agora não</button>
          <button className="btn-text" onClick={() => { onClose(); navigate('/signin') }}>Entrar</button>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 24px' }}
            onClick={() => { onClose(); onUpgrade?.() }}
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isGuest, setGuestEvent } = useAuth()

  const [event, setEvent] = useState(null)
  const [participating, setParticipating] = useState(false)
  const [participantsCount, setParticipantsCount] = useState(0)
  const [comments, setComments] = useState([])
  const [newCommentText, setNewCommentText] = useState('')
  const [tab, setTab] = useState('comments')
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [error, setError] = useState(null)
  // Modal state
  const [showGuestJoinModal, setShowGuestJoinModal] = useState(false)
  const [showCommentAuthModal, setShowCommentAuthModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  // pendingParticipation: triggers toggle after loginAsGuest sets the user
  const [pendingParticipation, setPendingParticipation] = useState(false)

  useEffect(() => {
    async function loadEventData() {
      try {
        setLoading(true)
        setError(null)
        setParticipating(false)
        setParticipantsCount(0)

        const eventData = await getEvent(id)
        setEvent(eventData)
        setParticipantsCount(eventData?.participantsIds?.length || 0)

        if (user) {
          try {
            const isUserParticipating = await isParticipating(id, user.id)
            setParticipating(!!isUserParticipating)
          } catch {
            // Non-fatal — participation status defaults to false
          }
        }

        const commentsData = await getComments(id)
        setComments(commentsData || [])
      } catch (err) {
        console.error('Error loading event details:', err)
        setError('Erro ao carregar detalhes do evento. Verifique se o ID está correto.')
      } finally {
        setLoading(false)
      }
    }

    loadEventData()
  }, [id, user])

  // Fire the pending participation toggle after guest login sets the user
  useEffect(() => {
    if (pendingParticipation && user) {
      setPendingParticipation(false)
      doToggle()
    }
  }, [user, pendingParticipation])

  async function doToggle() {
    if (!user) return
    try {
      const res = await toggleParticipation(id, user.id)
      setParticipating(res)
      setParticipantsCount(prev => prev + (res ? 1 : -1))
    } catch (err) {
      console.error('Error toggling participation:', err)
    }
  }

  function handleToggleParticipation() {
    if (!user) {
      setShowGuestJoinModal(true)
      return
    }
    doToggle()
  }

  function handleGuestJoinSuccess() {
    setShowGuestJoinModal(false)
    // Lock the guest to this event before the toggle fires
    setGuestEvent(id)
    setPendingParticipation(true)
  }

  async function handleAddComment(e) {
    e.preventDefault()
    if (!newCommentText.trim() || !user) return

    setCommentsLoading(true)
    try {
      const added = await createComment(id, newCommentText.trim())
      setComments(prev => [...prev, added])
      setNewCommentText('')
    } catch (err) {
      console.error('Error adding comment:', err)
      alert('Erro ao enviar comentário. Tente novamente.')
    } finally {
      setCommentsLoading(false)
    }
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
      .then(() => alert('Link copiado para a área de transferência!'))
      .catch(() => alert(`Compartilhe: ${window.location.href}`))
  }

  if (loading) return <Spinner size={48} />

  if (error || !event) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px', textAlign: 'center' }}>
        <button className="auth-back-btn" onClick={() => navigate(-1)}>
          <IconBack /> Voltar
        </button>
        <p style={{ marginTop: '40px', color: 'var(--text-secondary)' }}>{error || 'Evento não encontrado.'}</p>
      </div>
    )
  }

  const isOwner = event.ownerId === user?.id
  // Comentários ficam ocultos até o usuário participar (o dono sempre vê os do seu evento).
  const canSeeComments = participating || isOwner
  const imageUrl = event.imageBase64 || `https://picsum.photos/1200/400?random=${id}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px' }} className="fade-in">
      {/* Hero */}
      <div className="event-details-hero">
        <img src={imageUrl} alt={event.title} />

        <button
          className="event-details-hero-back"
          id="btn-back-event-details"
          onClick={() => navigate(isGuest ? '/signin' : -1)}
        >
          <IconBack />
        </button>

        <button
          id="btn-share-event"
          onClick={handleShare}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 40, height: 40,
            background: 'rgba(255,255,255,.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-primary)', border: 'none',
            transition: 'background var(--transition)',
          }}
          title="Compartilhar"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 000-6 3 3 0 00-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9a3 3 0 000 6c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 002.92 2.92 2.92 2.92 0 002.92-2.92A2.92 2.92 0 0018 16.08z"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="event-details-title">{event.title}</h1>
          <p className="event-details-cat">{event.type}</p>
        </div>

        {isOwner && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              id="btn-participants-event"
              className="btn-secondary"
              onClick={() => navigate(`/home/events/${id}/participants`)}
              style={{ width: 'auto', padding: '10px 20px', fontSize: '13px' }}
            >
              Participantes
            </button>
            <button
              id="btn-edit-event"
              className="btn-secondary"
              onClick={() => navigate(`/events/${id}/edit`)}
              style={{ width: 'auto', padding: '10px 20px', fontSize: '13px' }}
            >
              Editar
            </button>
          </div>
        )}
      </div>

      {/* Guest upgrade banner — shown after the title so it's in context */}
      {isGuest && (
        <div className="guest-upgrade-banner">
          <div>
            <strong>Você entrou como convidado "{user.name}".</strong>
            <span style={{ display: 'block', fontSize: '13px', marginTop: '2px', opacity: 0.8 }}>
              Crie uma conta para salvar sua participação permanentemente e poder comentar.
            </span>
          </div>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 20px', fontSize: '13px', flexShrink: 0 }}
            onClick={() => setShowUpgradeModal(true)}
          >
            Criar conta
          </button>
        </div>
      )}

      <p className="event-details-desc">{event.description}</p>

      <div className="event-details-meta-row">
        <IconPerson />
        <span style={{ fontWeight: 600 }}>{participantsCount} Participantes</span>
      </div>

      <div className="event-details-meta-row" style={{ marginBottom: '24px' }}>
        <IconCalendar />
        <span>{formatDate(event.date)}</span>
      </div>

      <button
        className={participating ? 'btn-secondary' : 'btn-primary'}
        id="btn-participate-event"
        onClick={handleToggleParticipation}
        style={{ width: 'auto', padding: '12px 32px', marginBottom: '24px', fontSize: '15px' }}
      >
        {participating ? 'Cancelar participação' : 'Participar'}
      </button>

      {/* Criador do evento */}
      <div className="event-owner-row">
        <div className="event-owner-avatar">
          {(event.ownerAvatarBase64 || event.ownerAvatarUrl)
            ? <img src={event.ownerAvatarBase64 || event.ownerAvatarUrl} alt={event.ownerName} />
            : (event.ownerName ? event.ownerName.charAt(0).toUpperCase() : 'U')}
        </div>
        <div>
          <p className="event-owner-label">Criado por</p>
          <p className="event-owner-name">{event.ownerName}</p>
        </div>
      </div>

      {/* Quadro branco interativo — dono ativa; participantes (conta completa) colam post-its */}
      <Whiteboard eventId={id} eventTitle={event.title} isOwner={isOwner} participating={participating} />

      {/* Comentários só ficam disponíveis após participar */}
      {!canSeeComments && (
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '14px',
          }}
        >
          Participe do evento para ver e deixar comentários.
        </div>
      )}

      {/* Tab bar */}
      {canSeeComments && (
      <div className="tab-bar">
        <button
          className={`tab-item${tab === 'comments' ? ' active' : ''}`}
          id="tab-comentarios"
          onClick={() => setTab('comments')}
        >
          Comentários ({comments.length})
        </button>
      </div>
      )}

      {canSeeComments && tab === 'comments' && (
        <div className="comment-list fade-in">
          {/* Comment input — three states based on auth */}
          {!user && (
            <button
              className="btn-secondary"
              style={{ width: '100%', marginBottom: '20px' }}
              onClick={() => setShowCommentAuthModal(true)}
            >
              Deixar um comentário
            </button>
          )}
          {user && isGuest && (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Convidados não podem comentar.
              </span>
              <button className="btn-text" onClick={() => setShowUpgradeModal(true)} style={{ fontWeight: 600 }}>
                Crie uma conta completa →
              </button>
            </div>
          )}
          {user && !isGuest && (
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 12, marginBottom: '20px' }}>
              <input
                className="input-field"
                type="text"
                placeholder="Escreva um comentário..."
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                required
                disabled={commentsLoading}
                style={{ padding: '10px 16px', borderRadius: 'var(--radius-pill)' }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ width: 'auto', padding: '0 24px', whiteSpace: 'nowrap' }}
                disabled={commentsLoading}
              >
                Enviar
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '10px' }}>
              Nenhum comentário enviado ainda. Seja o primeiro!
            </p>
          ) : (
            comments.map(c => (
              <CommentItem
                key={c.id}
                comment={c}
                currentUserId={user?.id}
                isEventOwner={isOwner}
                onDelete={commentId => setComments(prev => prev.filter(x => x.id !== commentId))}
                onUpdate={updated => setComments(prev => prev.map(x => x.id === updated.id ? updated : x))}
              />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showGuestJoinModal && (
        <GuestJoinModal
          onSuccess={handleGuestJoinSuccess}
          onClose={() => setShowGuestJoinModal(false)}
          onFullAccount={() => { setShowGuestJoinModal(false); setShowUpgradeModal(true) }}
        />
      )}
      {showCommentAuthModal && (
        <CommentAuthModal
          onClose={() => setShowCommentAuthModal(false)}
          onUpgrade={() => { setShowCommentAuthModal(false); setShowUpgradeModal(true) }}
        />
      )}
      {showUpgradeModal && (
        <UpgradeAccountModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgraded={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  )
}
