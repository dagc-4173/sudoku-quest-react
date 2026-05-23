import { Link, useLocation } from 'react-router-dom'

interface ResultState {
  difficulty?: string
  errors?: number
  hints?: number
  score?: number
  time?: string
  wasSaved?: boolean
}

function ResultPage() {
  const { state } = useLocation()
  const result = (state ?? {}) as ResultState

  return (
    <section className="page module-page">
      <div className="page__header">
        <p className="page__eyebrow">Resultado</p>
        <h1>Resumen de partida</h1>
        <p className="page__lead">
          {result.time
            ? `Partida ${result.difficulty ?? 'Mini Sudoku'} completada.`
            : 'Completa una partida para ver el resumen final.'}
        </p>
        {result.time ? (
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
          <strong>{result.time ?? '00:00'}</strong>
        </article>
        <article>
          <span>Errores</span>
          <strong>{result.errors ?? 0}</strong>
        </article>
        <article>
          <span>Pistas</span>
          <strong>{result.hints ?? 0}</strong>
        </article>
        <article>
          <span>Puntaje</span>
          <strong>{result.score ?? 0}</strong>
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
