import { Play, ShieldCheck, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

const previewCells = [
  0, 5, 0, 3, 0, 1,
  3, 0, 1, 0, 5, 0,
  0, 1, 0, 6, 0, 5,
  5, 0, 6, 0, 1, 0,
  0, 6, 0, 1, 0, 3,
  1, 0, 3, 0, 6, 0,
]

function HomePage() {
  return (
    <section className="page home-page">
      <div className="home-page__content">
        <p className="page__eyebrow">Mini Sudoku 6x6</p>
        <h1>Sudoku Quest TdeA</h1>
        <p className="page__lead">
          Un reto de lógica rápido, visual y competitivo con identidad del
          Tecnológico de Antioquia.
        </p>

        <div className="page__actions">
          <Link className="action-link action-link--primary" to="/game">
            <Play size={18} strokeWidth={1.8} aria-hidden="true" />
            Iniciar partida
          </Link>
          <Link className="action-link action-link--secondary" to="/leaderboard">
            <Trophy size={18} strokeWidth={1.8} aria-hidden="true" />
            Ver ranking
          </Link>
        </div>
      </div>

      <aside className="home-page__preview" aria-label="Vista previa del tablero">
        <div className="status-strip">
          <span>6x6</span>
          <span>Bloques 2x3</span>
          <span>Fácil / Medio / Difícil</span>
        </div>
        <div className="preview-board" aria-hidden="true">
          {previewCells.map((value, index) => (
            <span
              className={value ? 'preview-cell' : 'preview-cell preview-cell--empty'}
              key={`${value}-${index}`}
            >
              {value || ''}
            </span>
          ))}
        </div>
        <div className="integrity-note">
          <ShieldCheck size={18} strokeWidth={1.8} aria-hidden="true" />
          <span>Base preparada para solución única y validación manual.</span>
        </div>
      </aside>
    </section>
  )
}

export default HomePage
