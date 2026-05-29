import { createContext } from 'react'
import type {
  Difficulty,
  SelectedCell,
  SudokuBoard,
  SudokuValidationResult,
} from '../features/sudoku/types/sudoku.types'

export interface SudokuContextValue {
  board: SudokuBoard
  solution: SudokuBoard
  difficulty: Difficulty
  selectedCell: SelectedCell | null
  elapsedTime: number
  mistakes: number
  hintsUsed: number
  isCompleted: boolean
  gameStarted: boolean
  statusMessage: string
  validationAttempted: boolean
  startNewGame: (difficulty: Difficulty) => void
  selectCell: (row: number, col: number) => void
  setCellValue: (value: number | null) => void
  handleKeyboardInput: (value: string) => void
  validateBoard: () => SudokuValidationResult
  useHint: () => void
  resetGame: () => void
  finishGame: () => void
}

export const SudokuContext = createContext<SudokuContextValue | null>(null)
