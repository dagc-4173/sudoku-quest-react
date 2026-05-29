import { useSudoku } from '../hooks/useSudoku'
import { SUDOKU_NUMBERS } from '../utils/boardUtils'

function NumberSelector() {
  const { setCellValue } = useSudoku()

  return (
    <div className="number-pad" aria-label="Ingresar número">
      {SUDOKU_NUMBERS.map((number) => (
        <button key={number} onClick={() => setCellValue(number)} type="button">
          {number}
        </button>
      ))}
    </div>
  )
}

export default NumberSelector
