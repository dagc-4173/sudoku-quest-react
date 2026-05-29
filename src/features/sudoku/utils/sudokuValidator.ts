import type { FlatSudokuBoard } from '../types/sudoku.types'
import {
  BOARD_SIZE,
  BOX_COLUMNS,
  BOX_ROWS,
  getBlockStart,
  getCellCoordinates,
} from './boardUtils'

export function canPlaceNumber(board: FlatSudokuBoard, index: number, value: number) {
  const { column, row } = getCellCoordinates(index)
  const blockStart = getBlockStart(row, column)

  for (let offset = 0; offset < BOARD_SIZE; offset += 1) {
    const rowIndex = row * BOARD_SIZE + offset
    const columnIndex = offset * BOARD_SIZE + column

    if (rowIndex !== index && board[rowIndex] === value) {
      return false
    }

    if (columnIndex !== index && board[columnIndex] === value) {
      return false
    }
  }

  for (let rowOffset = 0; rowOffset < BOX_ROWS; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < BOX_COLUMNS; columnOffset += 1) {
      const blockIndex =
        (blockStart.row + rowOffset) * BOARD_SIZE + blockStart.column + columnOffset

      if (blockIndex !== index && board[blockIndex] === value) {
        return false
      }
    }
  }

  return true
}

export function isValidFilledBoard(board: FlatSudokuBoard) {
  return board.every((value, index) => value !== 0 && canPlaceNumber(board, index, value))
}

export function validateBoardAgainstSolution(
  cells: FlatSudokuBoard,
  solution: FlatSudokuBoard,
) {
  const wrongCells = cells.map((value, index) => value !== 0 && value !== solution[index])
  const errorCount = wrongCells.filter(Boolean).length
  const isComplete = cells.every((value) => value !== 0)

  return {
    errorCount,
    isComplete,
    isSolved: isComplete && errorCount === 0,
    wrongCells,
  }
}
