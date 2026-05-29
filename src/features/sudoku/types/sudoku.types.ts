export type Difficulty = 'easy' | 'medium' | 'hard'

export type CellValue = number | null

export interface SudokuCell {
  value: CellValue
  fixed: boolean
  error: boolean
  row: number
  col: number
}

export type SudokuBoard = SudokuCell[][]

export interface SelectedCell {
  row: number
  col: number
}

export interface SudokuResult {
  difficulty: Difficulty
  timeInSeconds: number
  mistakes: number
  hintsUsed: number
  completedAt: Date
}

export type FlatSudokuBoard = number[]

export interface GeneratedPuzzle {
  puzzle: FlatSudokuBoard
  solution: FlatSudokuBoard
}

export interface SudokuValidationResult {
  errorCount: number
  isComplete: boolean
  isSolved: boolean
  wrongCells: boolean[]
}
