import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './auth.css'
import { IconBack, IconGoogle, IconGithub } from '../components/Icons'
import Spinner from '../components/Spinner'

export default function SignInPage() {
  const navigate = useNavigate()
  const { user, isGuest, guestEventId, login, loginWithOAuth } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Only redirect full (non-guest) users — guests are here to upgrade
  useEffect(() => {
    if (user && !isGuest) {
      navigate('/home', { replace: true })
    }
  }, [user, isGuest, navigate])

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Erro ao realizar login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card fade-in">
        <button
          className="auth-back-btn"
          id="btn-back-signin"
          onClick={() => navigate(guestEventId ? `/events/${guestEventId}` : '/welcome')}
        >
          <IconBack /> Voltar
        </button>

        <h1 className="auth-title">Bem vindo de volta!</h1>

        {/* Guest context banner */}
        {isGuest && (
          <div style={{
            background: 'color-mix(in srgb, var(--primary) 10%, var(--surface))',
            border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            lineHeight: 1.5,
          }}>
            <strong>Continuando como "{user.name}"</strong>
            <span style={{ display: 'block', marginTop: '2px', opacity: 0.8 }}>
              Ao entrar, sua participação no evento será vinculada à sua conta.
            </span>
          </div>
        )}

        {/* Social login */}
        <button
          className="social-btn"
          id="btn-google-signin"
          onClick={() => loginWithOAuth('google')}
          disabled={loading}
        >
          <IconGoogle />
          CONTINUAR COM GOOGLE
        </button>
        <button
          className="social-btn"
          id="btn-github-signin"
          onClick={() => loginWithOAuth('github')}
          disabled={loading}
        >
          <IconGithub />
          CONTINUAR COM GITHUB
        </button>

        <div className="auth-divider">OU ENTRE COM O SEU EMAIL</div>

        {error && (
          <div className="error-message" style={{ color: '#dc2626', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn}>
          <div className="input-group">
            <label className="input-label" htmlFor="signin-email">Email</label>
            <input
              id="signin-email"
              className="input-field"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signin-password">Senha</label>
            <input
              id="signin-password"
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            id="btn-entrar"
            className="btn-primary"
            style={{ marginTop: '8px', position: 'relative' }}
            disabled={loading}
          >
            {loading ? <Spinner size={18} color="#fff" /> : 'ENTRAR'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button
            className="btn-text"
            id="btn-esqueceu-senha"
            onClick={() => navigate('/forgot-password')}
            disabled={loading}
          >
            Esqueceu a senha?
          </button>
        </div>

        <div className="auth-footer" style={{ marginTop: '16px' }}>
          <span>Não tem conta?</span>
          <button
            id="btn-cadastrese"
            className="btn-text"
            onClick={() => navigate('/signup')}
            disabled={loading}
          >
            CADASTRE-SE
          </button>
        </div>
      </div>
    </div>
  )
}
