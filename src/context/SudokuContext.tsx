import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import type {
  Difficulty,
  SelectedCell,
} from '../features/sudoku/types/sudoku.types'
import {
  createSudokuBoard,
  findHintTarget,
  flattenBoardValues,
  getCellIndex,
  getFixedCells,
} from '../features/sudoku/utils/boardUtils'
import { generatePuzzle } from '../features/sudoku/utils/boardGenerator'
import { validateBoardAgainstSolution } from '../features/sudoku/utils/sudokuValidator'
import { SudokuContext } from './sudoku-context'
import type { SudokuContextValue } from './sudoku-context'

interface SudokuProviderProps {
  children: ReactNode
}

const initialDifficulty: Difficulty = 'easy'
const initialPuzzle = generatePuzzle(initialDifficulty)

function createBoardFromPuzzle(puzzle: number[]) {
  return createSudokuBoard(puzzle, getFixedCells(puzzle))
}

function createSolutionBoard(solution: number[]) {
  return createSudokuBoard(
    solution,
    solution.map(() => true),
  )
}

export function SudokuProvider({ children }: SudokuProviderProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty)
  const [board, setBoard] = useState(() => createBoardFromPuzzle(initialPuzzle.puzzle))
  const [solution, setSolution] = useState(() => createSolutionBoard(initialPuzzle.solution))
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [gameStarted, setGameStarted] = useState(true)
  const [validationAttempted, setValidationAttempted] = useState(false)
  const [statusMessage, setStatusMessage] = useState(
    'Completa el tablero para validar la partida.',
  )

  const startNewGame = useCallback((nextDifficulty: Difficulty) => {
    const nextPuzzle = generatePuzzle(nextDifficulty)

    setDifficulty(nextDifficulty)
    setBoard(createBoardFromPuzzle(nextPuzzle.puzzle))
    setSolution(createSolutionBoard(nextPuzzle.solution))
    setSelectedCell(null)
    setElapsedTime(0)
    setMistakes(0)
    setHintsUsed(0)
    setIsCompleted(false)
    setGameStarted(true)
    setValidationAttempted(false)
    setStatusMessage('Completa el tablero para validar la partida.')
  }, [])

  const resetGame = useCallback(() => {
    startNewGame(difficulty)
  }, [difficulty, startNewGame])

  const selectCell = useCallback((row: number, col: number) => {
    setSelectedCell({ col, row })
  }, [])

  const setCellValue = useCallback(
    (value: number | null) => {
      if (!selectedCell || isCompleted) {
        return
      }

      setBoard((currentBoard) => {
        const currentCell = currentBoard[selectedCell.row]?.[selectedCell.col]

        if (!currentCell || currentCell.fixed) {
          return currentBoard
        }

        return currentBoard.map((row) =>
          row.map((cell) =>
            cell.row === selectedCell.row && cell.col === selectedCell.col
              ? { ...cell, error: false, value }
              : cell,
          ),
        )
      })
      setValidationAttempted(false)
    },
    [isCompleted, selectedCell],
  )

  const handleKeyboardInput = useCallback(
    (value: string) => {
      if (value >= '1' && value <= '6') {
        setCellValue(Number(value))
        return
      }

      if (value === 'Backspace' || value === 'Delete' || value === '0') {
        setCellValue(null)
      }
    },
    [setCellValue],
  )

  const finishGame = useCallback(() => {
    setIsCompleted(true)
    setGameStarted(false)
    setStatusMessage('Partida completada correctamente.')
  }, [])

  const validateBoard = useCallback(() => {
    const flatBoard = flattenBoardValues(board)
    const flatSolution = flattenBoardValues(solution)
    const validation = validateBoardAgainstSolution(flatBoard, flatSolution)

    setValidationAttempted(true)
    setBoard((currentBoard) =>
      currentBoard.map((row) =>
        row.map((cell) => ({
          ...cell,
          error: validation.wrongCells[getCellIndex(cell.row, cell.col)],
        })),
      ),
    )

    if (!validation.isComplete) {
      setStatusMessage('Aún faltan casillas por completar.')
      return validation
    }

    if (!validation.isSolved) {
      setMistakes((currentMistakes) => currentMistakes + 1)
      setStatusMessage('Hay casillas por corregir antes de cerrar la partida.')
      return validation
    }

    finishGame()
    return validation
  }, [board, finishGame, solution])

  const useHint = useCallback(() => {
    const flatBoard = flattenBoardValues(board)
    const flatSolution = flattenBoardValues(solution)
    const fixedCells = board.flatMap((row) => row.map((cell) => cell.fixed))
    const selectedIndex = selectedCell
      ? getCellIndex(selectedCell.row, selectedCell.col)
      : null
    const targetIndex = findHintTarget(flatBoard, fixedCells, flatSolution, selectedIndex)

    if (targetIndex === -1) {
      setStatusMessage('No quedan casillas vacías o incorrectas para revelar.')
      return
    }

    setBoard((currentBoard) =>
      currentBoard.map((row) =>
        row.map((cell) =>
          getCellIndex(cell.row, cell.col) === targetIndex
            ? { ...cell, error: false, value: flatSolution[targetIndex] }
            : cell,
        ),
      ),
    )
    setSelectedCell({
      col: targetIndex % 6,
      row: Math.floor(targetIndex / 6),
    })
    setHintsUsed((currentHints) => currentHints + 1)
    setValidationAttempted(false)
    setStatusMessage('Pista aplicada. Revisa el tablero y continúa.')
  }, [board, selectedCell, solution])

  useEffect(() => {
    if (!gameStarted || isCompleted) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setElapsedTime((currentSeconds) => currentSeconds + 1)
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [gameStarted, isCompleted])

  const value = useMemo<SudokuContextValue>(
    () => ({
      board,
      difficulty,
      elapsedTime,
      finishGame,
      gameStarted,
      handleKeyboardInput,
      hintsUsed,
      isCompleted,
      mistakes,
      resetGame,
      selectCell,
      selectedCell,
      setCellValue,
      solution,
      startNewGame,
      statusMessage,
      useHint,
      validateBoard,
      validationAttempted,
    }),
    [
      board,
      difficulty,
      elapsedTime,
      finishGame,
      gameStarted,
      handleKeyboardInput,
      hintsUsed,
      isCompleted,
      mistakes,
      resetGame,
      selectCell,
      selectedCell,
      setCellValue,
      solution,
      startNewGame,
      statusMessage,
      useHint,
      validateBoard,
      validationAttempted,
    ],
  )

  return <SudokuContext.Provider value={value}>{children}</SudokuContext.Provider>
}
