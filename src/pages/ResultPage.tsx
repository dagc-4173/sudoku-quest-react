import { Link, useLocation } from 'react-router-dom'
import type { Difficulty } from '../features/sudoku/types/sudoku.types'
import { getDifficultyLabel } from '../features/sudoku/utils/difficultyConfig'
import { formatTime } from '../features/sudoku/utils/formatTime'

interface ResultState {
  difficulty?: Difficulty
  finalScore?: number
  hintsUsed?: number
  mistakes?: number
  timeInSeconds?: number
  wasSaved?: boolean
}

function ResultPage() {
  const { state } = useLocation()
  const result = (state ?? {}) as ResultState
  const hasResult = typeof result.timeInSeconds === 'number'

  return (
    <section className="page module-page">
      <div className="page__header">
        <p className="page__eyebrow">Resultado</p>
        <h1>Resumen de partida</h1>
        <p className="page__lead">
          {hasResult
            ? `Partida ${result.difficulty ? getDifficultyLabel(result.difficulty) : 'Mini Sudoku'} completada.`
            : 'Completa una partida para ver el resumen final.'}
        </p>
        {hasResult ? (
          <p className="result-save-status">
            {result.wasSaved
              ? 'Resultado guardado en el ranking.'
              : 'Resultado local. Inicia sesión antes de validar para guardarlo en el ranking.'}
          </p>
        ) : null}
      </div>

      <div className="result-grid" aria-label="Resumen temporal">
        <article>
          <span>Tiempo</span>
          <strong>{formatTime(result.timeInSeconds ?? 0)}</strong>
        </article>
        <article>
          <span>Errores</span>
          <strong>{result.mistakes ?? 0}</strong>
        </article>
        <article>
          <span>Pistas</span>
          <strong>{result.hintsUsed ?? 0}</strong>
        </article>
        <article>
          <span>Puntaje</span>
          <strong>{result.finalScore ?? 0}</strong>
        </article>
      </div>

      <div className="page__actions">
        <Link className="action-link action-link--primary" to="/game">
          Jugar de nuevo
        </Link>
        <Link className="action-link action-link--secondary" to="/leaderboard">
          Ver ranking
        </Link>
      </div>
    </section>
  )
}

export default ResultPage
