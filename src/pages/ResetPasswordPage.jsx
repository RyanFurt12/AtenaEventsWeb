import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/userApi'
import { IconBack } from '../components/Icons'
import Spinner from '../components/Spinner'
import './auth.css'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (pwNew !== pwConfirm) {
      setError('A confirmação não corresponde à nova senha.')
      return
    }
    setLoading(true)
    try {
      await resetPassword(token, pwNew)
      setDone(true)
      setTimeout(() => navigate('/signin', { replace: true }), 2000)
    } catch (err) {
      setError(err.message || 'Não foi possível redefinir a senha. O link pode ter expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card fade-in">
        <button className="auth-back-btn" id="btn-back-reset" onClick={() => navigate('/signin')}>
          <IconBack /> Voltar
        </button>

        <h1 className="auth-title">Nova senha</h1>

        {!token ? (
          <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '8px' }}>
            Link inválido. Solicite uma nova recuperação de senha.
          </p>
        ) : done ? (
          <p style={{ color: '#16a34a', fontSize: '14px', marginTop: '8px', lineHeight: 1.6 }}>
            ✓ Senha redefinida com sucesso. Redirecionando para o login…
          </p>
        ) : (
          <>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '8px 0 20px' }}>
              Defina sua nova senha. Mínimo de 8 caracteres, com uma letra maiúscula e um número.
            </p>

            {error && (
              <div className="error-message" style={{ color: '#dc2626', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label" htmlFor="reset-new">Nova senha</label>
                <input
                  id="reset-new" className="input-field" type="password" placeholder="••••••••"
                  value={pwNew} onChange={e => setPwNew(e.target.value)}
                  required disabled={loading} autoComplete="new-password"
                />
              </div>
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label className="input-label" htmlFor="reset-confirm">Confirmar nova senha</label>
                <input
                  id="reset-confirm" className="input-field" type="password" placeholder="••••••••"
                  value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                  required disabled={loading} autoComplete="new-password"
                />
              </div>
              <button type="submit" id="btn-reset-password" className="btn-primary" disabled={loading}>
                {loading ? <Spinner size={18} color="#fff" /> : 'REDEFINIR SENHA'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
