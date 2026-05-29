import { useSudoku } from '../hooks/useSudoku'
import Timer from './Timer'

function SudokuStats() {
  const { elapsedTime, hintsUsed, mistakes } = useSudoku()

  return (
    <div className="game-stats" aria-label="Estado de la partida">
      <Timer seconds={elapsedTime} />
      <span>
        Errores <strong>{mistakes}</strong>
      </span>
      <span>
        Pistas <strong>{hintsUsed}</strong>
      </span>
    </div>
  )
}

export default SudokuStats
