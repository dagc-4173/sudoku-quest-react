import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

function LoginPage() {
  const navigate = useNavigate()
  const { currentUser, isConfigured, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/game')
    } catch {
      setErrorMessage('No se pudo iniciar sesión. Revisa el correo y la contraseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page auth-page">
      <div className="page__header">
        <p className="page__eyebrow">Cuenta</p>
        <h1>Ingresar</h1>
        {currentUser ? (
          <p className="page__lead">Ya tienes una sesión activa.</p>
        ) : (
          <p className="page__lead">Inicia sesión para guardar tus partidas en el ranking.</p>
        )}
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {!isConfigured ? (
          <p className="form-alert">
            Firebase aún no está configurado. Completa las variables del archivo `.env`.
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
