import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { getFirebaseAuthErrorMessage } from '../lib/firebaseAuthErrors'

interface AuthLocationState {
  from?: {
    pathname?: string
  }
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, isConfigured, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectTo = ((location.state as AuthLocationState | null)?.from?.pathname) || '/game'

  if (currentUser) {
    return <Navigate replace to={redirectTo} />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(getFirebaseAuthErrorMessage(error, 'login'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page auth-page">
      <div className="page__header">
        <p className="page__eyebrow">Cuenta</p>
        <h1>Ingresar</h1>
        <p className="page__lead">Inicia sesión para guardar tus partidas en el ranking.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {!isConfigured ? (
          <p className="form-alert">
            Firebase aún no está configurado. Reemplaza las variables pendientes del archivo `.env`
            con los valores reales de Firebase Console.
          </p>
        ) : null}
        <label>
          Correo electrónico
          <input
            autoComplete="email"
            disabled={!isConfigured || isSubmitting}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nombre@correo.com"
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          Contraseña
          <input
            autoComplete="current-password"
            disabled={!isConfigured || isSubmitting}
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            type="password"
            value={password}
          />
        </label>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <button disabled={!isConfigured || isSubmitting} type="submit">
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
        <p className="auth-switch">
          ¿No tienes cuenta? <Link to="/register">Crea una aquí</Link>
        </p>
      </form>
    </section>
  )
}

export default LoginPage
