import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isFirebaseConfigured } from '../lib/firebase'
import { getLeaderboard } from '../services/scores'
import type { LeaderboardEntry } from '../services/scores'

function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    let isMounted = true

    async function loadLeaderboard() {
      if (!isFirebaseConfigured) {
        setIsLoading(false)
        return
      }

      try {
        const nextEntries = await getLeaderboard()
        if (isMounted) {
          setEntries(nextEntries)
        }
      } catch {
        if (isMounted) {
          setErrorMessage('No se pudo cargar el ranking. Revisa permisos de Firestore.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLeaderboard()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="page module-page">
      <div className="page__header">
        <p className="page__eyebrow">Ranking</p>
        <h1>Tabla de liderazgo</h1>
        <p className="page__lead">
          Mejores partidas guardadas en Firestore, ordenadas por puntaje.
        </p>
      </div>

      {!isFirebaseConfigured ? (
        <div className="empty-state">
          <strong>Firebase está pendiente de configuración.</strong>
          <span>Completa `.env` con las variables del proyecto para activar el ranking.</span>
        </div>
      ) : null}

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <div className="table-shell" role="region" aria-label="Ranking de Sudoku">
        <table>
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Dificultad</th>
              <th>Tiempo</th>
              <th>Errores</th>
              <th>Pistas</th>
              <th>Puntaje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>Cargando ranking...</td>
              </tr>
            ) : entries.length ? (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.playerName}</td>
                  <td>{entry.difficulty}</td>
                  <td>{entry.time}</td>
                  <td>{entry.errors}</td>
                  <td>{entry.hints}</td>
                  <td>{entry.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  Aún no hay partidas registradas. <Link to="/game">Juega la primera.</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default LeaderboardPage
