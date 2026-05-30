import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { IconGoogle, IconGithub } from './Icons'
import Spinner from './Spinner'

// steps: 'choose' | 'email-form' | 'success'
export default function UpgradeAccountModal({ onClose, onUpgraded }) {
  const { user, upgradeWithPassword, loginWithOAuth } = useAuth()
  const [step, setStep] = useState('choose')
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleEmailUpgrade(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await upgradeWithPassword(name.trim(), email.trim(), password)
      setStep('success')
      setTimeout(() => {
        onUpgraded?.()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="dialog-backdrop">
        <div className="dialog-card" style={{ textAlign: 'center' }}>
          <h2 className="dialog-title">Conta criada!</h2>
          <p className="dialog-body">Seu histórico de participações foi preservado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <h2 className="dialog-title">Criar conta completa</h2>

        {step === 'choose' && (
          <>
            <p className="dialog-body">
              Escolha como deseja criar sua conta. Seu histórico de participações será preservado.
            </p>

            <button
              className="social-btn"
              style={{ marginBottom: '8px' }}
              onClick={() => loginWithOAuth('google', user?.id)}
            >
              <IconGoogle />
              CONTINUAR COM GOOGLE
            </button>
            <button
              className="social-btn"
              style={{ marginBottom: '8px' }}
              onClick={() => loginWithOAuth('github', user?.id)}
            >
              <IconGithub />
              CONTINUAR COM GITHUB
            </button>

            <div className="auth-divider">OU</div>

            <button
              className="btn-secondary"
              style={{ marginBottom: '16px' }}
              onClick={() => setStep('email-form')}
            >
              Criar com email e senha
            </button>

            <div className="dialog-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn-text" onClick={onClose}>Cancelar</button>
            </div>
          </>
        )}

        {step === 'email-form' && (
          <>
            <p className="dialog-body">
              Preencha os dados abaixo para criar sua conta. Seu username <strong>{user?.name}</strong> será mantido.
            </p>
            {error && (
              <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>
                {error}
              </p>
            )}
            <form onSubmit={handleEmailUpgrade}>
              <div className="input-group">
                <label className="input-label" htmlFor="upgrade-name">Nome completo</label>
                <input
                  id="upgrade-name"
                  className="input-field"
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  minLength={2}
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="upgrade-email">Email</label>
                <input
                  id="upgrade-email"
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
                <label className="input-label" htmlFor="upgrade-password">Senha</label>
                <input
                  id="upgrade-password"
                  className="input-field"
                  type="password"
                  placeholder="Mínimo 8 caracteres, 1 maiúscula, 1 número"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </div>
              <div className="dialog-actions">
                <button type="button" className="btn-text" onClick={() => setStep('choose')} disabled={loading}>
                  Voltar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: 'auto', padding: '10px 24px' }}
                  disabled={loading || !name.trim() || !email.trim() || !password}
                >
                  {loading ? <Spinner size={14} color="#fff" /> : 'Criar conta'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
