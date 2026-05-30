import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { handleOAuthCallback } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    if (!accessToken) {
      navigate('/signin?error=oauth_failed', { replace: true })
      return
    }

    handleOAuthCallback(accessToken, refreshToken)

    // Clear the tokens from the URL bar
    window.history.replaceState({}, '', window.location.pathname)

    const returnPath = sessionStorage.getItem('oauth_return_path') || '/home'
    sessionStorage.removeItem('oauth_return_path')
    sessionStorage.removeItem('pending_guest_upgrade')

    navigate(returnPath, { replace: true })
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spinner size={48} color="var(--primary, #6366f1)" />
    </div>
  )
}
