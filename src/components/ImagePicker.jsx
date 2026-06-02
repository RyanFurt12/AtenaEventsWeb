import { useRef } from 'react'
import Spinner from './Spinner'
import { compressImage } from '../utils/compressImage'

export default function ImagePicker({ imageBase64, onChange, loading, id = 'btn-pick-image' }) {
  const fileInputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImage(file)
      onChange(compressed, null)
    } catch {
      onChange(null, 'Não foi possível processar a imagem. Tente outra.')
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div
        id={id}
        className="create-event-image-picker"
        onClick={() => !loading && fileInputRef.current?.click()}
        style={{ marginBottom: '24px', position: 'relative', overflow: 'hidden' }}
      >
        {loading ? (
          <Spinner size={32} />
        ) : imageBase64 ? (
          <>
            <img
              src={imageBase64}
              alt="Capa do evento"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="image-picker-hover-overlay">
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Trocar imagem</span>
            </div>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40" style={{ color: 'var(--text-hint)' }}>
              <path d="M12 15.2A3.2 3.2 0 1115.2 12 3.2 3.2 0 0112 15.2M20 4h-3.17L15 2H9L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"/>
            </svg>
            <p style={{ marginTop: 8, fontWeight: 600, color: 'var(--text-hint)' }}>
              Adicionar Capa do Evento
            </p>
          </>
        )}
      </div>
    </>
  )
}
