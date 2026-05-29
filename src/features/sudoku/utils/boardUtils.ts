import type { FlatSudokuBoard, SudokuBoard } from '../types/sudoku.types'

export const BOARD_SIZE = 6
export const BOX_ROWS = 2
export const BOX_COLUMNS = 3
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE
export const SUDOKU_NUMBERS = [1, 2, 3, 4, 5, 6] as const

export function createEmptyFlatBoard(): FlatSudokuBoard {
  return Array<number>(CELL_COUNT).fill(0)
}

export function getCellCoordinates(index: number) {
  return {
    column: index % BOARD_SIZE,
    row: Math.floor(index / BOARD_SIZE),
  }
}

export function getCellIndex(row: number, column: number) {
  return row * BOARD_SIZE + column
}

export function getBlockStart(row: number, column: number) {
  return {
    column: Math.floor(column / BOX_COLUMNS) * BOX_COLUMNS,
    row: Math.floor(row / BOX_ROWS) * BOX_ROWS,
  }
}

export function getFixedCells(puzzle: FlatSudokuBoard) {
  return puzzle.map((value) => value !== 0)
}

export function createSudokuBoard(values: FlatSudokuBoard, fixedCells = getFixedCells(values)) {
  return Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, column) => {
      const index = getCellIndex(row, column)
      const value = values[index]

      return {
        col: column,
        error: false,
        fixed: fixedCells[index],
        row,
        value: value === 0 ? null : value,
      }
    }),
  )
}

export function flattenBoardValues(board: SudokuBoard): FlatSudokuBoard {
  return board.flatMap((row) => row.map((cell) => cell.value ?? 0))
}

export function getWrongCells(cells: FlatSudokuBoard, solution: FlatSudokuBoard) {
  return cells.map((value, index) => value !== 0 && value !== solution[index])
}

export function isBoardComplete(cells: FlatSudokuBoard) {
  return cells.every((value) => value !== 0)
}

export function setFlatCellValue(cells: FlatSudokuBoard, index: number, value: number) {
  return cells.map((cellValue, cellIndex) => (cellIndex === index ? value : cellValue))
}

export function findHintTarget(
  cells: FlatSudokuBoard,
  fixedCells: boolean[],
  solution: FlatSudokuBoard,
  selectedCell: number | null,
) {
  if (
    selectedCell !== null &&
    !fixedCells[selectedCell] &&
    (cells[selectedCell] === 0 || cells[selectedCell] !== solution[selectedCell])
  ) {
    return selectedCell
  }

  return cells.findIndex(
    (value, index) => !fixedCells[index] && (value === 0 || value !== solution[index]),
  )
}

export function shuffle<T>(items: readonly T[]) {
  const nextItems = [...items]

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]]
  }

  return nextItems
}

export function createShuffledIndexes() {
  return shuffle([...Array(CELL_COUNT).keys()])
}
