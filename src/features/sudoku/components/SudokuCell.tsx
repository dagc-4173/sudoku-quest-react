import type { SudokuCell as SudokuCellType } from '../types/sudoku.types'

interface SudokuCellProps {
  cell: SudokuCellType
  isSelected: boolean
  isWrong: boolean
  onSelect: (row: number, col: number) => void
}

function SudokuCell({ cell, isSelected, isWrong, onSelect }: SudokuCellProps) {
  const className = [
    'sudoku-cell',
    cell.fixed ? 'sudoku-cell--fixed' : '',
    isSelected ? 'sudoku-cell--selected' : '',
    isWrong ? 'sudoku-cell--wrong' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      aria-label={`Fila ${cell.row + 1}, columna ${cell.col + 1}`}
      className={className}
      disabled={cell.fixed}
      onClick={() => onSelect(cell.row, cell.col)}
      type="button"
    >
      {cell.value || ''}
    </button>
  )
}

export default SudokuCell
