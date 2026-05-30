import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getEvent, updateEvent, deleteEvent } from '../api/eventApi'
import { IconBack, IconCalendar } from '../components/Icons'
import Spinner from '../components/Spinner'
import ImagePicker from '../components/ImagePicker'
import './CreateEventPage.css'

const CATEGORIES = ['Curso', 'Recreação', 'Treinamento', 'Palestra']

export default function EditEventPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [imageBase64, setImageBase64] = useState(null)
  const [imageLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const event = await getEvent(id)
        setTitle(event.title || '')
        setCategory(event.type || '')
        setDescription(event.description || '')
        setImageBase64(event.imageBase64 || null)
        if (event.date) setDate(event.date.split('T')[0])
      } catch {
        setError('Não foi possível carregar o evento.')
      } finally {
        setPageLoading(false)
      }
    }
    load()
  }, [id])

  function handleImageChange(base64, err) {
    if (err) { setError(err); return }
    setImageBase64(base64)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!category) {
      setError('A categoria é obrigatória.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await updateEvent(id, {
        title,
        description,
        type: category,
        date: date ? `${date}T00:00:00` : date,
        imageBase64,
      })
      setSuccess(true)
      setTimeout(() => navigate(`/events/${id}`), 1200)
    } catch (err) {
      if (err.status === 403) {
        setError('Você não tem permissão para editar este evento.')
      } else {
        setError(err.message || 'Erro ao salvar evento. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteEvent() {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este evento? Essa ação não pode ser desfeita.')) return
    setDeleteLoading(true)
    try {
      await deleteEvent(id)
      navigate('/home/events', { replace: true })
    } catch (err) {
      setError(err.message || 'Erro ao excluir evento.')
      setDeleteLoading(false)
    }
  }

  if (pageLoading) return <Spinner size={48} />

  return (
    <div className="page fade-in">
      <button
        className="auth-back-btn"
        id="btn-back-edit-event"
        onClick={() => navigate(-1)}
        disabled={loading || success}
      >
        <IconBack /> Voltar
      </button>

      <h1 className="create-event-title">Editar Evento</h1>

      <form onSubmit={handleSubmit} className="create-event-form">
        <ImagePicker
          imageBase64={imageBase64}
          onChange={handleImageChange}
          loading={imageLoading}
          id="btn-pick-image-edit"
        />

        <div className="input-group">
          <label className="input-label" htmlFor="edit-title">Título do Evento</label>
          <input
            id="edit-title"
            className="input-field"
            type="text"
            placeholder="Ex: Confraternização ADS 2025"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            disabled={loading || success}
          />
        </div>

        <div className="create-event-row">
          <div className="input-group">
            <label className="input-label" htmlFor="edit-date">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Data
              </span>
            </label>
            <input
              id="edit-date"
              className="input-field"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              disabled={loading || success}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="edit-category">Categoria</label>
            <select
              id="edit-category"
              className="input-field input-select"
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={loading || success}
            >
              <option value="">Selecione</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group create-event-desc">
          <label className="input-label" htmlFor="edit-description">Descrição</label>
          <textarea
            id="edit-description"
            className="input-field"
            rows={4}
            placeholder="Detalhes sobre o evento, local, etc."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            disabled={loading || success}
            style={{ resize: 'vertical', minHeight: '100px' }}
          />
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">✓ Evento atualizado com sucesso!</p>}

        <button
          type="submit"
          id="btn-save-edit-event"
          className="btn-primary"
          disabled={loading || success || imageLoading || deleteLoading}
          style={{ opacity: loading ? .7 : 1 }}
        >
          {loading ? <Spinner size={18} color="#fff" /> : success ? '✓ Salvo!' : 'Salvar Alterações'}
        </button>
      </form>

      <div style={{ maxWidth: 560, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Zona de perigo — esta ação é irreversível.
        </p>
        <button
          id="btn-delete-event"
          className="btn-danger-outline"
          onClick={handleDeleteEvent}
          disabled={deleteLoading || loading}
          style={{ width: 'auto', padding: '10px 24px' }}
        >
          {deleteLoading ? 'Excluindo...' : 'Excluir Evento'}
        </button>
      </div>
    </div>
  )
}
