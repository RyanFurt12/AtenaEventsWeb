import { useRef, useState } from 'react'
import Spinner from '../Spinner'
import { compressImage } from '../../utils/compressImage'

export default function AddPostItModal({ onCreate, onClose }) {
  const [type, setType] = useState('TEXT')
  const [text, setText] = useState('')
  const [caption, setCaption] = useState('')
  const [imageBase64, setImageBase64] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, { maxW: 600, maxH: 600, quality: 0.8 })
      setImageBase64(compressed)
      setError(null)
    } catch {
      setError('Não foi possível processar a imagem. Tente outra.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (type === 'TEXT' && !text.trim()) {
      setError('Escreva uma mensagem.')
      return
    }
    if (type === 'PHOTO' && !imageBase64) {
      setError('Escolha uma foto.')
      return
    }
    if (type === 'PHOTO' && caption.trim().includes(' ')) {
      setError('A legenda deve ter apenas uma palavra.')
      return
    }

    setLoading(true)
    try {
      await onCreate(
        type === 'TEXT'
          ? { type: 'TEXT', text: text.trim() }
          : { type: 'PHOTO', imageBase64, text: caption.trim() }
      )
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <h2 className="dialog-title">Adicionar post-it</h2>

        <div className="postit-type-tabs">
          <button
            type="button"
            className={`postit-type-tab${type === 'TEXT' ? ' active' : ''}`}
            onClick={() => setType('TEXT')}
            disabled={loading}
          >
            Mensagem
          </button>
          <button
            type="button"
            className={`postit-type-tab${type === 'PHOTO' ? ' active' : ''}`}
            onClick={() => setType('PHOTO')}
            disabled={loading}
          >
            Polaroid
          </button>
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: '14px', margin: '8px 0', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {type === 'TEXT' ? (
            <div className="input-group">
              <label className="input-label" htmlFor="postit-text">Sua mensagem</label>
              <textarea
                id="postit-text"
                className="input-field"
                placeholder="Escreva algo para o quadro..."
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={200}
                rows={3}
                disabled={loading}
                autoFocus
                style={{ resize: 'none' }}
              />
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
              <div
                className="postit-photo-preview"
                onClick={() => !loading && fileInputRef.current?.click()}
              >
                {imageBase64
                  ? <img src={imageBase64} alt="Prévia" />
                  : <span>Escolher foto</span>}
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="postit-caption">Legenda (1 palavra, opcional)</label>
                <input
                  id="postit-caption"
                  className="input-field"
                  placeholder="ex: Festa"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  maxLength={20}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="dialog-actions">
            <button type="button" className="btn-text" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: 'auto', padding: '10px 24px' }}
              disabled={loading}
            >
              {loading ? <Spinner size={14} color="#fff" /> : 'Colar no quadro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
