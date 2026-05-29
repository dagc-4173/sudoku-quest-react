import { formatTime } from '../utils/formatTime'

interface TimerProps {
  seconds: number
}

function Timer({ seconds }: TimerProps) {
  return (
    <span>
      Tiempo <strong>{formatTime(seconds)}</strong>
    </span>
  )
}

export default Timer
