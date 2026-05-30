import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './auth.css'
import { IconBack, IconGoogle, IconGithub } from '../components/Icons'
import Spinner from '../components/Spinner'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { user, isGuest, guestEventId, register, loginWithOAuth } = useAuth()

  const [name, setName] = useState(isGuest ? (user?.name || '') : '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Only redirect full (non-guest) users — guests are here to create an account
  useEffect(() => {
    if (user && !isGuest) {
      navigate('/home', { replace: true })
    }
  }, [user, isGuest, navigate])

  async function handleSignUp(e) {
    e.preventDefault()
    if (!acceptedTerms) return
    setLoading(true)
    setError(null)
    try {
      await register(name, email, password)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card fade-in">
        <button
          className="auth-back-btn"
          id="btn-back-signup"
          onClick={() => navigate(guestEventId ? `/events/${guestEventId}` : '/welcome')}
        >
          <IconBack /> Voltar
        </button>

        <h1 className="auth-title">Crie sua conta</h1>

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
              Sua participação no evento será vinculada à nova conta.
            </span>
          </div>
        )}

        {/* Social login */}
        <button
          className="social-btn"
          id="btn-google-signup"
          onClick={() => loginWithOAuth('google')}
          disabled={loading}
        >
          <IconGoogle />
          CONTINUAR COM GOOGLE
        </button>
        <button
          className="social-btn"
          id="btn-github-signup"
          onClick={() => loginWithOAuth('github')}
          disabled={loading}
        >
          <IconGithub />
          CONTINUAR COM GITHUB
        </button>

        <div className="auth-divider">OU CONTINUE COM SEU EMAIL</div>

        {error && (
          <div className="error-message" style={{ color: '#dc2626', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <label className="input-label" htmlFor="signup-name">Nome</label>
            <input
              id="signup-name"
              className="input-field"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
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
            <label className="input-label" htmlFor="signup-password">Senha</label>
            <input
              id="signup-password"
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="terms-checkbox">Li e aceito os termos</label>
          </div>

          <button
            type="submit"
            id="btn-criar-conta"
            className="btn-primary"
            disabled={!acceptedTerms || loading}
            style={{
              opacity: (acceptedTerms && !loading) ? 1 : .5,
              cursor: (acceptedTerms && !loading) ? 'pointer' : 'not-allowed',
              position: 'relative'
            }}
          >
            {loading ? <Spinner size={18} color="#fff" /> : 'CRIAR CONTA'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '16px' }}>
          <span>Já tem conta?</span>
          <button
            id="btn-entrar-aqui-signup"
            className="btn-text"
            onClick={() => navigate('/signin')}
            disabled={loading}
          >
            ENTRAR AQUI
          </button>
        </div>
      </div>
    </div>
  )
}
