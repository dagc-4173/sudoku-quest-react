import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import type { ReactNode } from 'react'
import type {
  Difficulty,
  SelectedCell,
  SudokuBoard,
  SudokuValidationResult,
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

interface SudokuState {
  board: SudokuBoard
  difficulty: Difficulty
  elapsedTime: number
  gameStarted: boolean
  hintsUsed: number
  isCompleted: boolean
  mistakes: number
  selectedCell: SelectedCell | null
  solution: SudokuBoard
  statusMessage: string
  validationAttempted: boolean
}

type SudokuAction =
  | { type: 'apply_hint'; payload: { targetIndex: number; value: number } }
  | { type: 'apply_validation'; payload: SudokuValidationResult }
  | { type: 'finish_game' }
  | { type: 'select_cell'; payload: SelectedCell }
  | { type: 'set_cell_value'; payload: number | null }
  | { type: 'set_status'; payload: string }
  | { type: 'start_new_game'; payload: Difficulty }
  | { type: 'tick' }

const initialDifficulty: Difficulty = 'easy'
const initialStatusMessage = 'Completa el tablero para validar la partida.'

function createBoardFromPuzzle(puzzle: number[]) {
  return createSudokuBoard(puzzle, getFixedCells(puzzle))
}

function createSolutionBoard(solution: number[]) {
  return createSudokuBoard(
    solution,
    solution.map(() => true),
  )
}

function createInitialState(difficulty: Difficulty): SudokuState {
  const puzzle = generatePuzzle(difficulty)

  return {
    board: createBoardFromPuzzle(puzzle.puzzle),
    difficulty,
    elapsedTime: 0,
    gameStarted: true,
    hintsUsed: 0,
    isCompleted: false,
    mistakes: 0,
    selectedCell: null,
    solution: createSolutionBoard(puzzle.solution),
    statusMessage: initialStatusMessage,
    validationAttempted: false,
  }
}

function markBoardErrors(board: SudokuBoard, validation: SudokuValidationResult) {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      error: validation.wrongCells[getCellIndex(cell.row, cell.col)],
    })),
  )
}

function sudokuReducer(state: SudokuState, action: SudokuAction): SudokuState {
  switch (action.type) {
    case 'apply_hint': {
      return {
        ...state,
        board: state.board.map((row) =>
          row.map((cell) =>
            getCellIndex(cell.row, cell.col) === action.payload.targetIndex
              ? { ...cell, error: false, value: action.payload.value }
              : cell,
          ),
        ),
        hintsUsed: state.hintsUsed + 1,
        selectedCell: {
          col: action.payload.targetIndex % 6,
          row: Math.floor(action.payload.targetIndex / 6),
        },
        statusMessage: 'Pista aplicada. Revisa el tablero y continúa.',
        validationAttempted: false,
      }
    }

    case 'apply_validation': {
      const nextBoard = markBoardErrors(state.board, action.payload)

      if (!action.payload.isComplete) {
        return {
          ...state,
          board: nextBoard,
          statusMessage: 'Aún faltan casillas por completar.',
          validationAttempted: true,
        }
      }

      if (!action.payload.isSolved) {
        return {
          ...state,
          board: nextBoard,
          mistakes: state.mistakes + 1,
          statusMessage: 'Hay casillas por corregir antes de cerrar la partida.',
          validationAttempted: true,
        }
      }

      return {
        ...state,
        board: nextBoard,
        gameStarted: false,
        isCompleted: true,
        statusMessage: 'Partida completada correctamente.',
        validationAttempted: true,
      }
    }

    case 'finish_game':
      return {
        ...state,
        gameStarted: false,
        isCompleted: true,
        statusMessage: 'Partida completada correctamente.',
      }

    case 'select_cell':
      return {
        ...state,
        selectedCell: action.payload,
      }

    case 'set_cell_value': {
      if (!state.selectedCell || state.isCompleted) {
        return state
      }

      const currentCell = state.board[state.selectedCell.row]?.[state.selectedCell.col]

      if (!currentCell || currentCell.fixed) {
        return state
      }

      return {
        ...state,
        board: state.board.map((row) =>
          row.map((cell) =>
            cell.row === state.selectedCell?.row && cell.col === state.selectedCell.col
              ? { ...cell, error: false, value: action.payload }
              : cell,
          ),
        ),
        validationAttempted: false,
      }
    }

    case 'set_status':
      return {
        ...state,
        statusMessage: action.payload,
      }

    case 'start_new_game':
      return createInitialState(action.payload)

    case 'tick':
      if (!state.gameStarted || state.isCompleted) {
        return state
      }

      return {
        ...state,
        elapsedTime: state.elapsedTime + 1,
      }

    default:
      return state
  }
}

export function SudokuProvider({ children }: SudokuProviderProps) {
  const [state, dispatch] = useReducer(sudokuReducer, initialDifficulty, createInitialState)

  const startNewGame = useCallback((nextDifficulty: Difficulty) => {
    dispatch({ payload: nextDifficulty, type: 'start_new_game' })
  }, [])

  const resetGame = useCallback(() => {
    startNewGame(state.difficulty)
  }, [startNewGame, state.difficulty])

  const selectCell = useCallback((row: number, col: number) => {
    dispatch({ payload: { col, row }, type: 'select_cell' })
  }, [])

  const setCellValue = useCallback(
    (value: number | null) => {
      dispatch({ payload: value, type: 'set_cell_value' })
    },
    [],
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
    dispatch({ type: 'finish_game' })
  }, [])

  const validateBoard = useCallback(() => {
    const flatBoard = flattenBoardValues(state.board)
    const flatSolution = flattenBoardValues(state.solution)
    const validation = validateBoardAgainstSolution(flatBoard, flatSolution)

    dispatch({ payload: validation, type: 'apply_validation' })
    return validation
  }, [state.board, state.solution])

  const useHint = useCallback(() => {
    const flatBoard = flattenBoardValues(state.board)
    const flatSolution = flattenBoardValues(state.solution)
    const fixedCells = state.board.flatMap((row) => row.map((cell) => cell.fixed))
    const selectedIndex = state.selectedCell
      ? getCellIndex(state.selectedCell.row, state.selectedCell.col)
      : null
    const targetIndex = findHintTarget(flatBoard, fixedCells, flatSolution, selectedIndex)

    if (targetIndex === -1) {
      dispatch({
        payload: 'No quedan casillas vacías o incorrectas para revelar.',
        type: 'set_status',
      })
      return
    }

    dispatch({
      payload: {
        targetIndex,
        value: flatSolution[targetIndex],
      },
      type: 'apply_hint',
    })
  }, [state.board, state.selectedCell, state.solution])

  useEffect(() => {
    if (!state.gameStarted || state.isCompleted) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      dispatch({ type: 'tick' })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [state.gameStarted, state.isCompleted])

  const value = useMemo<SudokuContextValue>(
    () => ({
      board: state.board,
      difficulty: state.difficulty,
      elapsedTime: state.elapsedTime,
      finishGame,
      gameStarted: state.gameStarted,
      handleKeyboardInput,
      hintsUsed: state.hintsUsed,
      isCompleted: state.isCompleted,
      mistakes: state.mistakes,
      resetGame,
      selectCell,
      selectedCell: state.selectedCell,
      setCellValue,
      solution: state.solution,
      startNewGame,
      statusMessage: state.statusMessage,
      useHint,
      validateBoard,
      validationAttempted: state.validationAttempted,
    }),
    [
      finishGame,
      handleKeyboardInput,
      resetGame,
      selectCell,
      setCellValue,
      startNewGame,
      state,
      useHint,
      validateBoard,
    ],
  )

  return <SudokuContext.Provider value={value}>{children}</SudokuContext.Provider>
}
