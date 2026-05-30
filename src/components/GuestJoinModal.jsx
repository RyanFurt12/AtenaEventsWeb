import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export default function GuestJoinModal({ onSuccess, onClose, onFullAccount }) {
  const { loginAsGuest } = useAuth()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await loginAsGuest(username.trim())
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <h2 className="dialog-title">Participar como convidado</h2>
        <p className="dialog-body">
          Escolha um apelido para participar deste evento. Você pode criar uma conta
          completa depois para salvar seu histórico permanentemente.
        </p>
        {error && (
          <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="guest-username">Seu apelido</label>
            <input
              id="guest-username"
              className="input-field"
              placeholder="ex: Joao42"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={30}
              pattern="^[a-zA-Z0-9_\-]+$"
              title="Letras, números, _ e - apenas"
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="dialog-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <button type="button" className="btn-text" onClick={onFullAccount} disabled={loading}>
              Criar conta completa
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-text" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: 'auto', padding: '10px 24px' }}
                disabled={loading || !username.trim()}
              >
                {loading ? <Spinner size={14} color="#fff" /> : 'Entrar como convidado'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
