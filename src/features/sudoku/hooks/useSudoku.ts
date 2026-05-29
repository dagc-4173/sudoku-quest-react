import { useContext } from 'react'
import { SudokuContext } from '../../../context/sudoku-context'

export function useSudoku() {
  const context = useContext(SudokuContext)

  if (!context) {
    throw new Error('useSudoku debe usarse dentro de SudokuProvider.')
  }

  return context
}
