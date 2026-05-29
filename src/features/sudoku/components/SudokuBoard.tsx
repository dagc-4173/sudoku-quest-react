import { useSudoku } from '../hooks/useSudoku'
import SudokuCell from './SudokuCell'

function SudokuBoard() {
  const { board, selectCell, selectedCell, validationAttempted } = useSudoku()

  return (
    <section className="sudoku-board" aria-label="Tablero Mini Sudoku 6 por 6">
      {board.flatMap((row) =>
        row.map((cell) => (
          <SudokuCell
            cell={cell}
            isSelected={selectedCell?.row === cell.row && selectedCell.col === cell.col}
            isWrong={validationAttempted && cell.error}
            key={`${cell.row}-${cell.col}`}
            onSelect={selectCell}
          />
        )),
      )}
    </section>
  )
}

export default SudokuBoard
