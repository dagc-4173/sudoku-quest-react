import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button/Button'
import { useAuth } from '../contexts/useAuth'
import DifficultySelector from '../features/sudoku/components/DifficultySelector'
import HintButton from '../features/sudoku/components/HintButton'
import NumberSelector from '../features/sudoku/components/NumberSelector'
import SudokuBoard from '../features/sudoku/components/SudokuBoard'
import SudokuStats from '../features/sudoku/components/SudokuStats'
import ValidateButton from '../features/sudoku/components/ValidateButton'
import { useSudoku } from '../features/sudoku/hooks/useSudoku'
import { calculateGameScore } from '../features/sudoku/services/sudokuScoreService'
import { getDifficultyLabel } from '../features/sudoku/utils/difficultyConfig'
import { formatTime } from '../features/sudoku/utils/formatTime'
import { saveGameResult } from '../services/scores'

function GamePage() {
  const navigate = useNavigate()
  const { currentUser, isConfigured } = useAuth()
  const {
    difficulty,
    elapsedTime,
    handleKeyboardInput,
    hintsUsed,
    mistakes,
    resetGame,
    setCellValue,
    statusMessage,
    validateBoard,
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
        <SudokuStats />
      </div>

      <div className="game-layout">
        <SudokuBoard />

        <aside className="module-panel game-controls">
          <div className="module-panel__header">
            <span>Dificultad</span>
            <strong>{getDifficultyLabel(difficulty)}</strong>
          </div>

          <DifficultySelector />
          <NumberSelector />

          <div className="module-panel__controls">
            <Button icon={<RotateCcw size={18} strokeWidth={1.8} />} onClick={resetGame}>
              Nuevo puzzle
            </Button>
            <ValidateButton isSaving={isSaving} onValidate={handleValidateGame} />
            <HintButton />
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
