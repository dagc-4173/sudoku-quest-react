import { Lightbulb, RotateCcw, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button/Button'
import { useAuth } from '../contexts/useAuth'
import { saveGameResult } from '../services/scores'

type Difficulty = 'facil' | 'medio' | 'dificil'

interface PuzzleConfig {
  label: string
  holes: number
}

interface GeneratedPuzzle {
  puzzle: number[]
  solution: number[]
}

const puzzles: Record<Difficulty, PuzzleConfig> = {
  facil: {
    label: 'Fácil',
    holes: 12,
  },
  medio: {
    label: 'Medio',
    holes: 18,
  },
  dificil: {
    label: 'Difícil',
    holes: 22,
  },
}

const numbers = [1, 2, 3, 4, 5, 6]
const boardSize = 6
const boxRows = 2
const boxColumns = 3

function shuffle<T>(items: T[]) {
  const nextItems = [...items]

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]]
  }

  return nextItems
}

function pattern(row: number, column: number) {
  return (boxColumns * (row % boxRows) + Math.floor(row / boxRows) + column) % boardSize
}

function shuffledBands() {
  return shuffle([0, 1, 2]).flatMap((band) =>
    shuffle([0, 1]).map((row) => band * boxRows + row),
  )
}

function shuffledStacks() {
  return shuffle([0, 1]).flatMap((stack) =>
    shuffle([0, 1, 2]).map((column) => stack * boxColumns + column),
  )
}

function generateSolution() {
  const rows = shuffledBands()
  const columns = shuffledStacks()
  const values = shuffle(numbers)

  return rows.flatMap((row) => columns.map((column) => values[pattern(row, column)]))
}

function canPlace(board: number[], index: number, value: number) {
  const row = Math.floor(index / boardSize)
  const column = index % boardSize
  const boxStartRow = Math.floor(row / boxRows) * boxRows
  const boxStartColumn = Math.floor(column / boxColumns) * boxColumns

  for (let offset = 0; offset < boardSize; offset += 1) {
    if (board[row * boardSize + offset] === value) {
      return false
    }

    if (board[offset * boardSize + column] === value) {
      return false
    }
  }

  for (let rowOffset = 0; rowOffset < boxRows; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < boxColumns; columnOffset += 1) {
      const boxIndex = (boxStartRow + rowOffset) * boardSize + boxStartColumn + columnOffset

      if (board[boxIndex] === value) {
        return false
      }
    }
  }

  return true
}

function getCandidates(board: number[], index: number) {
  return numbers.filter((value) => canPlace(board, index, value))
}

function countSolutions(board: number[], limit = 2) {
  const nextEmptyCell = board.reduce(
    (best, value, index) => {
      if (value !== 0) {
        return best
      }

      const candidates = getCandidates(board, index)

      if (!best || candidates.length < best.candidates.length) {
        return { candidates, index }
      }

      return best
    },
    null as null | { candidates: number[]; index: number },
  )

  if (!nextEmptyCell) {
    return 1
  }

  if (nextEmptyCell.candidates.length === 0) {
    return 0
  }

  let solutions = 0

  for (const candidate of nextEmptyCell.candidates) {
    board[nextEmptyCell.index] = candidate
    solutions += countSolutions(board, limit)
    board[nextEmptyCell.index] = 0

    if (solutions >= limit) {
      return solutions
    }
  }

  return solutions
}

function generatePuzzle(difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateSolution()
  const puzzle = [...solution]
  const positions = shuffle([...Array(boardSize * boardSize).keys()])
  let removedCells = 0

  for (const position of positions) {
    if (removedCells >= puzzles[difficulty].holes) {
      break
    }

    const previousValue = puzzle[position]
    puzzle[position] = 0

    if (countSolutions([...puzzle]) === 1) {
      removedCells += 1
    } else {
      puzzle[position] = previousValue
    }
  }

  return { puzzle, solution }
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const rest = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${rest}`
}

function getScore(seconds: number, errors: number, hints: number) {
  return Math.max(0, 1200 - seconds * 3 - errors * 80 - hints * 120)
}

function GamePage() {
  const navigate = useNavigate()
  const { currentUser, isConfigured } = useAuth()
  const [difficulty, setDifficulty] = useState<Difficulty>('facil')
  const [generatedPuzzle, setGeneratedPuzzle] = useState(() => generatePuzzle('facil'))
  const [cells, setCells] = useState<number[]>(generatedPuzzle.puzzle)
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [validationAttempted, setValidationAttempted] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Completa el tablero para validar la partida.')

  const fixedCells = useMemo(
    () => generatedPuzzle.puzzle.map((value) => value !== 0),
    [generatedPuzzle],
  )

  const wrongCells = useMemo(
    () => cells.map((value, index) => value !== 0 && value !== generatedPuzzle.solution[index]),
    [cells, generatedPuzzle],
  )

  const errorCount = wrongCells.filter(Boolean).length
  const isComplete = cells.every(Boolean)
  const score = getScore(elapsedSeconds, errorCount, hintsUsed)

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

    setCells((currentCells) =>
      currentCells.map((cellValue, index) => (index === selectedCell ? value : cellValue)),
    )
    setValidationAttempted(false)
  }

  function clearSelectedCell() {
    if (selectedCell === null || fixedCells[selectedCell]) {
      return
    }

    setCells((currentCells) =>
      currentCells.map((cellValue, index) => (index === selectedCell ? 0 : cellValue)),
    )
    setValidationAttempted(false)
  }

  function revealHint() {
    const targetIndex =
      selectedCell !== null && !fixedCells[selectedCell] && cells[selectedCell] === 0
        ? selectedCell
        : cells.findIndex((value, index) => value === 0 && !fixedCells[index])

    if (targetIndex === -1) {
      setStatusMessage('No quedan casillas vacías para revelar.')
      return
    }

    setCells((currentCells) =>
      currentCells.map((value, index) =>
        index === targetIndex ? generatedPuzzle.solution[index] : value,
      ),
    )
    setSelectedCell(targetIndex)
    setHintsUsed((currentHints) => currentHints + 1)
    setValidationAttempted(false)
    setStatusMessage('Pista aplicada. Revisa el tablero y continúa.')
  }

  async function validateGame() {
    setValidationAttempted(true)

    if (!isComplete) {
      setStatusMessage('Aún faltan casillas por completar.')
      return
    }

    if (errorCount > 0) {
      setStatusMessage('Hay casillas por corregir antes de cerrar la partida.')
      return
    }

    const result = {
      difficulty: puzzles[difficulty].label,
      errors: errorCount,
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
            Errores <strong>{errorCount}</strong>
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
            const isWrong = validationAttempted && wrongCells[index]
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
                aria-label={`Fila ${Math.floor(index / 6) + 1}, columna ${(index % 6) + 1}`}
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
            <strong>{puzzles[difficulty].label}</strong>
          </div>

          <div className="difficulty-tabs" aria-label="Seleccionar dificultad">
            {(Object.keys(puzzles) as Difficulty[]).map((level) => (
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
                {puzzles[level].label}
              </button>
            ))}
          </div>

          <div className="number-pad" aria-label="Ingresar número">
            {numbers.map((number) => (
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
