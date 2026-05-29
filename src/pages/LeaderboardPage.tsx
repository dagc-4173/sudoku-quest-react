import { useEffect, useState } from 'react'
import LeaderboardTable from '../features/leaderboard/components/LeaderboardTable'
import {
  subscribeToLeaderboard,
} from '../features/leaderboard/services/leaderboardService'
import type { LeaderboardEntry } from '../features/leaderboard/services/leaderboardService'
import type { Difficulty } from '../features/sudoku/types/sudoku.types'
import { DIFFICULTY_ORDER, getDifficultyLabel } from '../features/sudoku/utils/difficultyConfig'
import { isFirebaseConfigured } from '../lib/firebase'

function LeaderboardPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    let unsubscribe = () => {}
    let isMounted = true

    async function subscribeLeaderboard() {
      if (!isFirebaseConfigured) {
        return
      }

      try {
        unsubscribe = await subscribeToLeaderboard(
          difficulty,
          (nextEntries) => {
            if (!isMounted) {
              return
            }

            setEntries(nextEntries)
            setIsLoading(false)
          },
          () => {
            if (!isMounted) {
              return
            }

            setErrorMessage(
              'No se pudo cargar el ranking. Revisa permisos o índices de Firestore.',
            )
            setIsLoading(false)
          },
        )
      } catch {
        if (isMounted) {
          setErrorMessage('No se pudo iniciar el ranking en tiempo real.')
          setIsLoading(false)
        }
      }
    }

    subscribeLeaderboard()

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [difficulty])

  function handleDifficultyChange(nextDifficulty: Difficulty) {
    if (nextDifficulty === difficulty) {
      return
    }

    setDifficulty(nextDifficulty)
    setEntries([])
    setErrorMessage('')
    setIsLoading(isFirebaseConfigured)
  }

  return (
    <section className="page module-page">
      <div className="page__header">
        <p className="page__eyebrow">Ranking</p>
        <h1>Tabla de liderazgo</h1>
        <p className="page__lead">
          Mejores partidas en tiempo real, separadas por dificultad y ordenadas por menor tiempo.
        </p>
      </div>

      <div className="difficulty-tabs leaderboard-filter" aria-label="Filtrar ranking por dificultad">
        {DIFFICULTY_ORDER.map((level) => (
          <button
            className={
              level === difficulty
                ? 'difficulty-tabs__button difficulty-tabs__button--active'
                : 'difficulty-tabs__button'
            }
            key={level}
            onClick={() => handleDifficultyChange(level)}
            type="button"
          >
            {getDifficultyLabel(level)}
          </button>
        ))}
      </div>

      {!isFirebaseConfigured ? (
        <div className="empty-state">
          <strong>Firebase está pendiente de configuración.</strong>
          <span>Completa `.env` con las variables del proyecto para activar el ranking.</span>
        </div>
      ) : null}

      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <LeaderboardTable entries={entries} isLoading={isLoading} />
    </section>
  )
}

export default LeaderboardPage
