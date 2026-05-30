import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../api/userApi'
import { IconBack } from '../components/Icons'
import Spinner from '../components/Spinner'
import './auth.css'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Erro ao enviar o e-mail de recuperação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card fade-in">
        <button className="auth-back-btn" id="btn-back-forgot" onClick={() => navigate('/signin')}>
          <IconBack /> Voltar
        </button>

        <h1 className="auth-title">Recuperar senha</h1>

        {sent ? (
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '8px' }}>
            Se houver uma conta associada a <strong>{email}</strong>, enviamos um link para
            redefinir a senha. Verifique sua caixa de entrada.
          </p>
        ) : (
          <>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '8px 0 20px' }}>
              Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.
            </p>

            {error && (
              <div className="error-message" style={{ color: '#dc2626', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label className="input-label" htmlFor="forgot-email">E-mail</label>
                <input
                  id="forgot-email" className="input-field" type="email" placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required disabled={loading}
                />
              </div>
              <button type="submit" id="btn-send-reset" className="btn-primary" disabled={loading}>
                {loading ? <Spinner size={18} color="#fff" /> : 'ENVIAR LINK'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
