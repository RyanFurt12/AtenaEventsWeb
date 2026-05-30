import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IconBack } from '../components/Icons'
import Spinner from '../components/Spinner'

export default function SecurityPage() {
  const navigate = useNavigate()
  const { user, changePassword, requestEmailChange } = useAuth()

  // ── Alterar senha ──────────────────────────────────────────────────────────
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState(null)
  const [pwSaved, setPwSaved] = useState(false)

  // ── Alterar email ────────────────────────────────────────────────────────────
  const [emCurrent, setEmCurrent] = useState('')
  const [emNew, setEmNew] = useState('')
  const [emLoading, setEmLoading] = useState(false)
  const [emError, setEmError] = useState(null)
  const [emSent, setEmSent] = useState(false)

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError(null)
    if (pwNew !== pwConfirm) {
      setPwError('A confirmação não corresponde à nova senha.')
      return
    }
    setPwLoading(true)
    try {
      await changePassword(pwCurrent, pwNew)
      setPwSaved(true)
      setPwCurrent(''); setPwNew(''); setPwConfirm('')
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err) {
      setPwError(err.message || 'Erro ao alterar a senha.')
    } finally {
      setPwLoading(false)
    }
  }

  async function handleChangeEmail(e) {
    e.preventDefault()
    setEmError(null)
    setEmLoading(true)
    try {
      await requestEmailChange(emCurrent, emNew)
      setEmSent(true)
      setEmCurrent('')
    } catch (err) {
      setEmError(err.message || 'Erro ao solicitar troca de e-mail.')
    } finally {
      setEmLoading(false)
    }
  }

  const cardStyle = {
    background: 'var(--surface)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    maxWidth: '480px',
    marginBottom: '24px',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px' }} className="fade-in">
      <button
        className="auth-back-btn"
        id="btn-back-security"
        onClick={() => navigate('/home/settings')}
      >
        <IconBack /> Voltar
      </button>

      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Privacidade e Segurança</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
        Altere sua senha e o e-mail da sua conta.
      </p>

      {user?.hasPassword === false ? (
        <div style={cardStyle}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Sua conta usa login social (Google ou GitHub), portanto não possui senha
            nem e-mail gerenciáveis por aqui. Gerencie esses dados diretamente no provedor.
          </p>
        </div>
      ) : (
        <>
          {/* ── Alterar senha ── */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px' }}>Alterar senha</h2>

            {pwError && (
              <div style={{ color: '#dc2626', fontSize: '14px', marginBottom: '16px' }}>{pwError}</div>
            )}
            {pwSaved && (
              <div style={{ color: '#16a34a', fontSize: '14px', marginBottom: '16px' }}>
                ✓ Senha alterada com sucesso.
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="input-group">
                <label className="input-label" htmlFor="pw-current">Senha atual</label>
                <input
                  id="pw-current" className="input-field" type="password" placeholder="••••••••"
                  value={pwCurrent} onChange={e => setPwCurrent(e.target.value)}
                  required disabled={pwLoading} autoComplete="current-password"
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="pw-new">Nova senha</label>
                <input
                  id="pw-new" className="input-field" type="password" placeholder="••••••••"
                  value={pwNew} onChange={e => setPwNew(e.target.value)}
                  required disabled={pwLoading} autoComplete="new-password"
                />
              </div>
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label className="input-label" htmlFor="pw-confirm">Confirmar nova senha</label>
                <input
                  id="pw-confirm" className="input-field" type="password" placeholder="••••••••"
                  value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                  required disabled={pwLoading} autoComplete="new-password"
                />
              </div>
              <button type="submit" id="btn-change-password" className="btn-primary" disabled={pwLoading}>
                {pwLoading ? <Spinner size={18} color="#fff" /> : 'Alterar senha'}
              </button>
            </form>
          </div>

          {/* ── Alterar email ── */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>Alterar e-mail</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              E-mail atual: <strong>{user?.email}</strong>
            </p>

            {emSent ? (
              <div style={{ color: '#16a34a', fontSize: '14px', lineHeight: 1.6 }}>
                ✓ Enviamos um link de confirmação para o novo e-mail. Abra-o para concluir a troca.
                Seu e-mail atual continua válido até a confirmação.
              </div>
            ) : (
              <form onSubmit={handleChangeEmail}>
                {emError && (
                  <div style={{ color: '#dc2626', fontSize: '14px', marginBottom: '16px' }}>{emError}</div>
                )}
                <div className="input-group">
                  <label className="input-label" htmlFor="em-new">Novo e-mail</label>
                  <input
                    id="em-new" className="input-field" type="email" placeholder="novo@email.com"
                    value={emNew} onChange={e => setEmNew(e.target.value)}
                    required disabled={emLoading}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <label className="input-label" htmlFor="em-current">Senha atual</label>
                  <input
                    id="em-current" className="input-field" type="password" placeholder="••••••••"
                    value={emCurrent} onChange={e => setEmCurrent(e.target.value)}
                    required disabled={emLoading} autoComplete="current-password"
                  />
                </div>
                <button type="submit" id="btn-request-email-change" className="btn-primary" disabled={emLoading}>
                  {emLoading ? <Spinner size={18} color="#fff" /> : 'Enviar confirmação'}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  )
}
