import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createEvent } from '../api/eventApi'
import { IconBack, IconCalendar } from '../components/Icons'
import Spinner from '../components/Spinner'
import ImagePicker from '../components/ImagePicker'
import './CreateEventPage.css'

const CATEGORIES = ['Curso', 'Recreação', 'Treinamento', 'Palestra']

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [imageBase64, setImageBase64] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

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
    if (!user) {
      setError('Você precisa estar autenticado para criar eventos.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await createEvent({
        title,
        description,
        type: category,
        date: date ? `${date}T00:00:00` : date,
        imageBase64,
      })
      setSuccess(true)
      setTimeout(() => navigate('/home'), 1500)
    } catch (err) {
      console.error('Error creating event:', err)
      setError(err.message || 'Erro ao criar evento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page fade-in">
      <button
        className="auth-back-btn"
        id="btn-back-create-event"
        onClick={() => navigate(-1)}
        disabled={loading || success}
      >
        <IconBack /> Voltar
      </button>

      <h1 className="create-event-title">Criar Novo Evento</h1>

      <form onSubmit={handleSubmit} className="create-event-form">
        <ImagePicker
          imageBase64={imageBase64}
          onChange={handleImageChange}
          loading={imageLoading}
          id="btn-pick-image"
        />

        <div className="input-group">
          <label className="input-label" htmlFor="create-title">Título do Evento</label>
          <input
            id="create-title"
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
            <label className="input-label" htmlFor="create-date">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Data
              </span>
            </label>
            <input
              id="create-date"
              className="input-field"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              disabled={loading || success}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="create-category">Categoria</label>
            <select
              id="create-category"
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
          <label className="input-label" htmlFor="create-description">Descrição</label>
          <textarea
            id="create-description"
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
        {success && <p className="form-success">✓ Evento criado com sucesso!</p>}

        <button
          type="submit"
          id="btn-create-event"
          className="btn-primary"
          disabled={loading || success || imageLoading}
          style={{ opacity: loading ? .7 : 1 }}
        >
          {loading ? <Spinner size={18} color="#fff" /> : success ? '✓ Criado!' : 'Criar Evento'}
        </button>
      </form>
    </div>
  )
}
