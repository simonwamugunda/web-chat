import { useState, useMemo } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const isValid = useMemo(() => {
    return email.trim().length > 3 && password.length >= 6
  }, [email, password])

  async function onSubmit(e) {
    e.preventDefault()
    if (!isValid || busy) return

    setBusy(true)
    setError(null)

    try {
      const trimmedEmail = email.trim()
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password)
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, password)
      }

      onLoginSuccess?.()
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="loginPageContainer">
      <div className="loginHeaderBar">
        <div className="loginHeaderContent">
          <div className="loginHeaderLogo">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
              <path d="M12.003 2C6.477 2 2 6.477 2 12.003c0 1.91.537 3.692 1.466 5.213L2 22l4.902-1.286c1.47.814 3.15 1.289 4.935 1.289 5.526 0 10.003-4.477 10.003-10.003C21.84 6.477 17.363 2 12.003 2zm5.858 14.103c-.252.712-1.462 1.305-2.014 1.386-.502.074-1.158.133-3.356-.775-2.81-1.16-4.59-4.02-4.73-4.207-.14-.188-1.134-1.506-1.134-2.873 0-1.367.716-2.037.97-2.307.252-.27.55-.337.733-.337.183 0 .367.002.527.01.167.008.39-.063.61.465.226.54.773 1.884.84 2.02.067.137.11.297.018.48-.09.18-.137.29-.274.45-.137.16-.29.357-.413.48-.137.137-.28.287-.12.563.16.276.71 1.17 1.52 1.89.1.09.19.17.28.25.71.63 1.31.83 1.61.96.28.12.44.1.61-.09.17-.19.73-.85.92-1.14.19-.29.38-.24.64-.14.26.1.1.1 1.66.88.1.05.2.1.3.15.77.38 1.28.58 1.46.9.18.32.18 1.84-.07 2.55z"/>
            </svg>
          </div>
          <span className="loginHeaderTitle">GDG WHATSAPP GROUP</span>
        </div>
      </div>

      <div className="loginCardWrapper">
        <div className="loginCard">
          <div className="loginCardLeft">
            <h2 className="loginInstructionsTitle">To use GDG WhatsApp Group:</h2>
            <ol className="loginInstructionsList">
              <li>Select whether you want to <strong>Sign in</strong> or <strong>Create an account</strong>.</li>
              <li>Enter your email address in the email field.</li>
              <li>Enter your password (must be at least 6 characters).</li>
              <li>Click the green button to access the real-time chat rooms.</li>
            </ol>
            <div className="loginInstructionsFooter">
              <p>Need help? Contact your GDG administrator.</p>
            </div>
          </div>

          <div className="loginCardRight">
            <div className="loginTabs" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                className={mode === 'signin' ? 'loginTab loginTab--active' : 'loginTab'}
                onClick={() => {
                  setMode('signin')
                  setError(null)
                }}
                disabled={busy}
              >
                Sign in
              </button>
              <button
                type="button"
                className={mode === 'signup' ? 'loginTab loginTab--active' : 'loginTab'}
                onClick={() => {
                  setMode('signup')
                  setError(null)
                }}
                disabled={busy}
              >
                Create account
              </button>
            </div>

            <form className="loginForm" onSubmit={onSubmit}>
              <div className="field">
                <span className="fieldLabel">Email</span>
                <input
                  className="fieldInput"
                  value={email}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                  required
                />
              </div>

              <div className="field">
                <span className="fieldLabel">Password</span>
                <input
                  className="fieldInput"
                  value={password}
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  required
                />
              </div>

              {error && <div className="formError">{error}</div>}

              <button className="loginButton" type="submit" disabled={!isValid || busy}>
                {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>

              <div className="loginHint">
                Using Firebase Authentication (email/password).
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

