import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { confirmEmail } from '../api/userApi'
import Spinner from '../components/Spinner'
import './auth.css'

export default function ConfirmEmailPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  // 'loading' | 'success' | 'error'
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return // evita dupla execução no StrictMode
    ran.current = true

    if (!token) {
      setStatus('error')
      setMessage('Link inválido.')
      return
    }
    confirmEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'Não foi possível confirmar o e-mail. O link pode ter expirado.')
      })
  }, [token])

  return (
    <div className="auth-layout">
      <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
        <h1 className="auth-title">Confirmação de e-mail</h1>

        {status === 'loading' && (
          <div style={{ margin: '24px 0' }}>
            <Spinner size={28} />
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Confirmando…
            </p>
          </div>
        )}

        {status === 'success' && (
          <p style={{ color: '#16a34a', fontSize: '15px', lineHeight: 1.6, margin: '16px 0 24px' }}>
            ✓ Seu e-mail foi atualizado com sucesso. Use o novo endereço no próximo login.
          </p>
        )}

        {status === 'error' && (
          <p style={{ color: '#dc2626', fontSize: '15px', lineHeight: 1.6, margin: '16px 0 24px' }}>
            {message}
          </p>
        )}

        {status !== 'loading' && (
          <button id="btn-confirm-email-continue" className="btn-primary" onClick={() => navigate('/signin')}>
            IR PARA O LOGIN
          </button>
        )}
      </div>
    </div>
  )
}
