import { Lightbulb } from 'lucide-react'
import Button from '../../../components/Button/Button'
import { useSudoku } from '../hooks/useSudoku'

function HintButton() {
  const { useHint } = useSudoku()

  return (
    <Button icon={<Lightbulb size={18} strokeWidth={1.8} />} onClick={useHint} variant="ghost">
      Pista
    </Button>
  )
}

export default HintButton
