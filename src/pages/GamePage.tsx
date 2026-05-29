import { Lightbulb, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button/Button'
import { useAuth } from '../contexts/useAuth'
import { useSudoku } from '../features/sudoku/hooks/useSudoku'
import { calculateGameScore } from '../features/sudoku/services/sudokuScoreService'
import {
  DIFFICULTY_ORDER,
  getDifficultyLabel,
} from '../features/sudoku/utils/difficultyConfig'
import { formatTime } from '../features/sudoku/utils/formatTime'
import { SUDOKU_NUMBERS } from '../features/sudoku/utils/boardUtils'
import { saveGameResult } from '../services/scores'

function GamePage() {
  const navigate = useNavigate()
  const { currentUser, isConfigured } = useAuth()
  const {
    board,
    difficulty,
    elapsedTime,
    handleKeyboardInput,
    hintsUsed,
    mistakes,
    resetGame,
    selectCell,
    selectedCell,
    setCellValue,
    startNewGame,
    statusMessage,
    useHint,
    validateBoard,
    validationAttempted,
  } = useSudoku()
  const [isSaving, setIsSaving] = useState(false)
  const score = calculateGameScore(elapsedTime, mistakes, hintsUsed)

  async function handleValidateGame() {
    const validation = validateBoard()

    if (!validation.isSolved) {
      return
    }

    const result = {
      difficulty: getDifficultyLabel(difficulty),
      errors: mistakes,
      hints: hintsUsed,
      score,
      time: formatTime(elapsedTime),
      timeSeconds: elapsedTime,
    }
    setIsSaving(true)
    let wasSaved: boolean
    try {
      wasSaved = await saveGameResult(result, currentUser)
    } finally {
      setIsSaving(false)
    }

    navigate('/result', {
      state: {
        ...result,
        wasSaved,
      },
    })
  }

  return (
    <section
      className="page game-page"
      onKeyDown={(event) => handleKeyboardInput(event.key)}
    >
      <div className="page__header game-page__header">
        <div>
          <p className="page__eyebrow">Partida</p>
          <h1>Tablero Mini Sudoku</h1>
        </div>
        <div className="game-stats" aria-label="Estado de la partida">
          <span>
            Tiempo <strong>{formatTime(elapsedTime)}</strong>
          </span>
          <span>
            Errores <strong>{mistakes}</strong>
          </span>
          <span>
            Pistas <strong>{hintsUsed}</strong>
          </span>
        </div>
      </div>

      <div className="game-layout">
        <section className="sudoku-board" aria-label="Tablero Mini Sudoku 6 por 6">
          {board.flatMap((row) =>
            row.map((cell) => {
              const isSelected =
                selectedCell?.row === cell.row && selectedCell.col === cell.col
              const isWrong = validationAttempted && cell.error
              const className = [
                'sudoku-cell',
                cell.fixed ? 'sudoku-cell--fixed' : '',
                isSelected ? 'sudoku-cell--selected' : '',
                isWrong ? 'sudoku-cell--wrong' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <button
                  aria-label={`Fila ${cell.row + 1}, columna ${cell.col + 1}`}
                  className={className}
                  disabled={cell.fixed}
                  key={`${cell.row}-${cell.col}`}
                  onClick={() => selectCell(cell.row, cell.col)}
                  type="button"
                >
                  {cell.value || ''}
                </button>
              )
            }),
          )}
        </section>

        <aside className="module-panel game-controls">
          <div className="module-panel__header">
            <span>Dificultad</span>
            <strong>{getDifficultyLabel(difficulty)}</strong>
          </div>

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

          <div className="number-pad" aria-label="Ingresar número">
            {SUDOKU_NUMBERS.map((number) => (
              <button key={number} onClick={() => setCellValue(number)} type="button">
                {number}
              </button>
            ))}
          </div>

          <div className="module-panel__controls">
            <Button icon={<RotateCcw size={18} strokeWidth={1.8} />} onClick={resetGame}>
              Nuevo puzzle
            </Button>
            <Button
              disabled={isSaving}
              icon={<ShieldCheck size={18} strokeWidth={1.8} />}
              onClick={handleValidateGame}
              variant="secondary"
            >
              {isSaving ? 'Guardando...' : 'Validar'}
            </Button>
            <Button icon={<Lightbulb size={18} strokeWidth={1.8} />} onClick={useHint} variant="ghost">
              Pista
            </Button>
            <Button onClick={() => setCellValue(null)} variant="ghost">
              Borrar
            </Button>
          </div>

          <p className="game-message" role="status">
            {statusMessage}{' '}
            {!currentUser && isConfigured
              ? 'Inicia sesión para guardar el resultado en el ranking.'
              : null}
          </p>
        </aside>
      </div>
    </section>
  )
}

export default GamePage
