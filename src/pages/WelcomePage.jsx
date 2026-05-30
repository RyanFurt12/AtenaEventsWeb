import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './auth.css'
import { IconStar } from '../components/Icons'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="welcome-layout">
      {/* ===== LEFT PANEL ===== */}
      <div className="welcome-left fade-in">
        {/* Logo */}
        <div className="welcome-logo">
          <div className="welcome-logo-dot">
            <IconStar />
          </div>
          <span className="welcome-logo-text">
            Atena <span>Event</span>
          </span>
        </div>

        {/* Hero image */}
        <img
          className="welcome-hero-img"
          src="https://picsum.photos/700/380?grayscale"
          alt="Pessoas em evento"
        />

        <h1 className="welcome-heading">O que fazemos?</h1>
        <p className="welcome-sub">
          Organizamos seus eventos e compromissos, e guardamos suas lembranças.
        </p>

        <div className="welcome-cta-group">
          <button
            id="btn-cadastrar"
            className="btn-primary"
            onClick={() => navigate('/signup')}
          >
            CADASTRAR
          </button>

          <div className="auth-footer">
            <span>Já possui conta?</span>
            <button
              id="btn-entrar-aqui"
              className="btn-text"
              onClick={() => navigate('/signin')}
            >
              ENTRAR AQUI
            </button>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL (decorative) ===== */}
      <div className="welcome-right">
        <p className="welcome-right-title">
          Organize.<br />Lembre.<br />Celebre.
        </p>
        <img
          className="welcome-right-illustration"
          src="https://picsum.photos/360/420?random=10"
          alt="Decoração evento"
        />
        <p className="welcome-right-text">
          Mais de 1.000 eventos criados por nossos usuários
        </p>
      </div>
    </div>
  )
}
