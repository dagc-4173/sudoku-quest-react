import type { Difficulty, FlatSudokuBoard, GeneratedPuzzle } from '../types/sudoku.types'
import {
  createEmptyFlatBoard,
  createShuffledIndexes,
  shuffle,
  SUDOKU_NUMBERS,
} from './boardUtils'
import { DIFFICULTY_CONFIG } from './difficultyConfig'
import { countSolutions } from './sudokuSolver'
import { canPlaceNumber, isValidFilledBoard } from './sudokuValidator'

function fillBoard(board: FlatSudokuBoard, index = 0): boolean {
  if (index >= board.length) {
    return true
  }

  if (board[index] !== 0) {
    return fillBoard(board, index + 1)
  }

  for (const candidate of shuffle(SUDOKU_NUMBERS)) {
    if (!canPlaceNumber(board, index, candidate)) {
      continue
    }

    board[index] = candidate

    if (fillBoard(board, index + 1)) {
      return true
    }

    board[index] = 0
  }

  return false
}

export function generateCompleteBoard() {
  const board = createEmptyFlatBoard()

  if (!fillBoard(board) || !isValidFilledBoard(board)) {
    throw new Error('No se pudo generar un tablero completo de Mini Sudoku.')
  }

  return board
}

export function generatePuzzle(difficulty: Difficulty): GeneratedPuzzle {
  const solution = generateCompleteBoard()
  const puzzle = [...solution]
  const positions = createShuffledIndexes()
  let removedCells = 0

  for (const position of positions) {
    if (removedCells >= DIFFICULTY_CONFIG[difficulty].emptyCells) {
      break
    }

    const previousValue = puzzle[position]
    puzzle[position] = 0

    if (countSolutions(puzzle) === 1) {
      removedCells += 1
    } else {
      puzzle[position] = previousValue
    }
  }

  return { puzzle, solution }
}
