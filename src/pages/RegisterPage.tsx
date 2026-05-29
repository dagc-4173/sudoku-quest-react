import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

function RegisterPage() {
  const navigate = useNavigate()
  const { currentUser, isConfigured, register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (currentUser) {
    return <Navigate replace to="/game" />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await register(name.trim(), email, password)
      navigate('/game', { replace: true })
    } catch {
      setErrorMessage('No se pudo crear la cuenta. Usa otro correo o una contraseña más fuerte.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page auth-page">
      <div className="page__header">
        <p className="page__eyebrow">Cuenta</p>
        <h1>Registro</h1>
        <p className="page__lead">Crea un perfil para guardar tus mejores partidas.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {!isConfigured ? (
          <p className="form-alert">
            Firebase aún no está configurado. Completa las variables del archivo `.env`.
          </p>
        ) : null}
        <label>
          Nombre
          <input
            autoComplete="name"
            disabled={!isConfigured || isSubmitting}
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jugador TdeA"
            required
            type="text"
            value={name}
          />
        </label>
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
            autoComplete="new-password"
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
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Ingresa aquí</Link>
        </p>
      </form>
    </section>
  )
}

export default RegisterPage
