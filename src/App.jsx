import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import WelcomePage from './pages/WelcomePage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import HomeLayout from './pages/HomeLayout'
import EventDetailsPage from './pages/EventDetailsPage'
import EditEventPage from './pages/EditEventPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ConfirmEmailPage from './pages/ConfirmEmailPage'

function PrivateRoute({ children }) {
  const { user, isGuest } = useAuth()
  // Guests are not allowed in the authenticated app shell
  if (!user || isGuest) return <Navigate to="/signin" replace />
  return children
}

// Redirects guests away from every page except their locked event and auth pages.
function GuestGuard({ children }) {
  const { isGuest, guestEventId } = useAuth()
  const location = useLocation()

  if (!isGuest || !guestEventId) return children

  const allowedPrefixes = [
    `/events/${guestEventId}`,
    '/signin',
    '/signup',
    '/welcome',
    '/oauth-callback',
    '/forgot-password',
    '/reset-password',
    '/confirm-email',
  ]
  const allowed = allowedPrefixes.some(p => location.pathname.startsWith(p))
  if (!allowed) return <Navigate to={`/events/${guestEventId}`} replace />

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <GuestGuard>
        <Routes>
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/confirm-email" element={<ConfirmEmailPage />} />

          {/* Full-user only */}
          <Route
            path="/home/*"
            element={
              <PrivateRoute>
                <HomeLayout />
              </PrivateRoute>
            }
          />

          {/* Public — anyone can view; EventDetailsPage handles auth state internally */}
          <Route path="/events/:id" element={<EventDetailsPage />} />

          <Route
            path="/events/:id/edit"
            element={
              <PrivateRoute>
                <EditEventPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </GuestGuard>
    </AuthProvider>
  )
}
