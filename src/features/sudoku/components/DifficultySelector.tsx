import { useSudoku } from '../hooks/useSudoku'
import { DIFFICULTY_ORDER, getDifficultyLabel } from '../utils/difficultyConfig'

function DifficultySelector() {
  const { difficulty, startNewGame } = useSudoku()

  return (
    <div className="difficulty-tabs" aria-label="Seleccionar dificultad">
      {DIFFICULTY_ORDER.map((level) => (
        <button
          className={
            level === difficulty
              ? 'difficulty-tabs__button difficulty-tabs__button--active'
              : 'difficulty-tabs__button'
          }
          key={level}
          onClick={() => startNewGame(level)}
          type="button"
        >
          {getDifficultyLabel(level)}
        </button>
      ))}
    </div>
  )
}

export default DifficultySelector
