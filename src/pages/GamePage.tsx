import { Lightbulb, RotateCcw, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button/Button'
import { useAuth } from '../contexts/useAuth'
import { calculateGameScore } from '../features/sudoku/services/sudokuScoreService'
import type { Difficulty, FlatSudokuBoard } from '../features/sudoku/types/sudoku.types'
import {
  findHintTarget,
  getCellCoordinates,
  getFixedCells,
  isBoardComplete,
  setFlatCellValue,
  SUDOKU_NUMBERS,
} from '../features/sudoku/utils/boardUtils'
import { generatePuzzle } from '../features/sudoku/utils/boardGenerator'
import {
  DIFFICULTY_ORDER,
  getDifficultyLabel,
} from '../features/sudoku/utils/difficultyConfig'
import { formatTime } from '../features/sudoku/utils/formatTime'
import { validateBoardAgainstSolution } from '../features/sudoku/utils/sudokuValidator'
import { saveGameResult } from '../services/scores'

function GamePage() {
  const navigate = useNavigate()
  const { currentUser, isConfigured } = useAuth()
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [generatedPuzzle, setGeneratedPuzzle] = useState(() => generatePuzzle('easy'))
  const [cells, setCells] = useState<FlatSudokuBoard>(generatedPuzzle.puzzle)
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [validationAttempted, setValidationAttempted] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Completa el tablero para validar la partida.')

  const fixedCells = useMemo(
    () => getFixedCells(generatedPuzzle.puzzle),
    [generatedPuzzle.puzzle],
  )

  const validation = useMemo(
    () => validateBoardAgainstSolution(cells, generatedPuzzle.solution),
    [cells, generatedPuzzle.solution],
  )

  const score = calculateGameScore(elapsedSeconds, validation.errorCount, hintsUsed)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1)
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  function resetGame(nextDifficulty = difficulty) {
    const nextPuzzle = generatePuzzle(nextDifficulty)

    setDifficulty(nextDifficulty)
    setGeneratedPuzzle(nextPuzzle)
    setCells(nextPuzzle.puzzle)
    setSelectedCell(null)
    setElapsedSeconds(0)
    setHintsUsed(0)
    setValidationAttempted(false)
    setStatusMessage('Completa el tablero para validar la partida.')
  }

  function updateCell(value: number) {
    if (selectedCell === null || fixedCells[selectedCell]) {
      return
    }

    setCells((currentCells) => setFlatCellValue(currentCells, selectedCell, value))
    setValidationAttempted(false)
  }

  function clearSelectedCell() {
    if (selectedCell === null || fixedCells[selectedCell]) {
      return
    }

    setCells((currentCells) => setFlatCellValue(currentCells, selectedCell, 0))
    setValidationAttempted(false)
  }

  function revealHint() {
    const targetIndex = findHintTarget(
      cells,
      fixedCells,
      generatedPuzzle.solution,
      selectedCell,
    )

    if (targetIndex === -1) {
      setStatusMessage('No quedan casillas vacías o incorrectas para revelar.')
      return
    }

    setCells((currentCells) =>
      setFlatCellValue(currentCells, targetIndex, generatedPuzzle.solution[targetIndex]),
    )
    setSelectedCell(targetIndex)
    setHintsUsed((currentHints) => currentHints + 1)
    setValidationAttempted(false)
    setStatusMessage('Pista aplicada. Revisa el tablero y continúa.')
  }

  async function validateGame() {
    setValidationAttempted(true)

    if (!isBoardComplete(cells)) {
      setStatusMessage('Aún faltan casillas por completar.')
      return
    }

    if (!validation.isSolved) {
      setStatusMessage('Hay casillas por corregir antes de cerrar la partida.')
      return
    }

    const result = {
      difficulty: getDifficultyLabel(difficulty),
      errors: validation.errorCount,
      hints: hintsUsed,
      score,
      time: formatTime(elapsedSeconds),
      timeSeconds: elapsedSeconds,
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
    <section className="page game-page">
      <div className="page__header game-page__header">
        <div>
          <p className="page__eyebrow">Partida</p>
          <h1>Tablero Mini Sudoku</h1>
        </div>
        <div className="game-stats" aria-label="Estado de la partida">
          <span>
            Tiempo <strong>{formatTime(elapsedSeconds)}</strong>
          </span>
          <span>
            Errores <strong>{validation.errorCount}</strong>
          </span>
          <span>
            Pistas <strong>{hintsUsed}</strong>
          </span>
        </div>
      </div>

      <div className="game-layout">
        <section className="sudoku-board" aria-label="Tablero Mini Sudoku 6 por 6">
          {cells.map((value, index) => {
            const isFixed = fixedCells[index]
            const isSelected = selectedCell === index
            const isWrong = validationAttempted && validation.wrongCells[index]
            const { column, row } = getCellCoordinates(index)
            const className = [
              'sudoku-cell',
              isFixed ? 'sudoku-cell--fixed' : '',
              isSelected ? 'sudoku-cell--selected' : '',
              isWrong ? 'sudoku-cell--wrong' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                aria-label={`Fila ${row + 1}, columna ${column + 1}`}
                className={className}
                disabled={isFixed}
                key={index}
                onClick={() => setSelectedCell(index)}
                type="button"
              >
                {value || ''}
              </button>
            )
          })}
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
                onClick={() => resetGame(level)}
                type="button"
              >
                {getDifficultyLabel(level)}
              </button>
            ))}
          </div>

          <div className="number-pad" aria-label="Ingresar número">
            {SUDOKU_NUMBERS.map((number) => (
              <button key={number} onClick={() => updateCell(number)} type="button">
                {number}
              </button>
            ))}
          </div>

          <div className="module-panel__controls">
            <Button icon={<RotateCcw size={18} strokeWidth={1.8} />} onClick={() => resetGame()}>
              Nuevo puzzle
            </Button>
            <Button
              disabled={isSaving}
              icon={<ShieldCheck size={18} strokeWidth={1.8} />}
              onClick={validateGame}
              variant="secondary"
            >
              {isSaving ? 'Guardando...' : 'Validar'}
            </Button>
            <Button icon={<Lightbulb size={18} strokeWidth={1.8} />} onClick={revealHint} variant="ghost">
              Pista
            </Button>
            <Button onClick={clearSelectedCell} variant="ghost">
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
