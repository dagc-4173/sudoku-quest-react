import type { FlatSudokuBoard } from '../types/sudoku.types'
import { SUDOKU_NUMBERS, shuffle } from './boardUtils'
import { canPlaceNumber } from './sudokuValidator'

export function getCandidates(board: FlatSudokuBoard, index: number) {
  return SUDOKU_NUMBERS.filter((value) => canPlaceNumber(board, index, value))
}

function getBestEmptyCell(board: FlatSudokuBoard) {
  let bestCell: null | { candidates: number[]; index: number } = null

  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== 0) {
      continue
    }

    const candidates = getCandidates(board, index)

    if (!bestCell || candidates.length < bestCell.candidates.length) {
      bestCell = { candidates, index }
    }
  }

  return bestCell
}

function countSolutionsRecursive(board: FlatSudokuBoard, limit: number) {
  const nextEmptyCell = getBestEmptyCell(board)

  if (!nextEmptyCell) {
    return 1
  }

  if (nextEmptyCell.candidates.length === 0) {
    return 0
  }

  let solutions = 0

  for (const candidate of nextEmptyCell.candidates) {
    board[nextEmptyCell.index] = candidate
    solutions += countSolutionsRecursive(board, limit)
    board[nextEmptyCell.index] = 0

    if (solutions >= limit) {
      return solutions
    }
  }

  return solutions
}

export function countSolutions(board: FlatSudokuBoard, limit = 2) {
  return countSolutionsRecursive([...board], limit)
}

function solveRecursive(board: FlatSudokuBoard) {
  const nextEmptyCell = getBestEmptyCell(board)

  if (!nextEmptyCell) {
    return true
  }

  for (const candidate of shuffle(nextEmptyCell.candidates)) {
    board[nextEmptyCell.index] = candidate

    if (solveRecursive(board)) {
      return true
    }

    board[nextEmptyCell.index] = 0
  }

  return false
}

export function solveBoard(board: FlatSudokuBoard) {
  const nextBoard = [...board]

  return solveRecursive(nextBoard) ? nextBoard : null
}
