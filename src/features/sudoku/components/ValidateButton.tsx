import { ShieldCheck } from 'lucide-react'
import Button from '../../../components/Button/Button'

interface ValidateButtonProps {
  isSaving: boolean
  onValidate: () => void
}

function ValidateButton({ isSaving, onValidate }: ValidateButtonProps) {
  return (
    <Button
      disabled={isSaving}
      icon={<ShieldCheck size={18} strokeWidth={1.8} />}
      onClick={onValidate}
      variant="secondary"
    >
      {isSaving ? 'Guardando...' : 'Validar'}
    </Button>
  )
}

export default ValidateButton
