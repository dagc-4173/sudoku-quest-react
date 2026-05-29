import type { Difficulty } from '../types/sudoku.types'

const BASE_SCORE_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 1000,
  hard: 3000,
  medium: 2000,
}

function getSpeedBonus(timeInSeconds: number) {
  if (timeInSeconds <= 30) {
    return 600
  }

  if (timeInSeconds <= 60) {
    return 500
  }

  if (timeInSeconds <= 90) {
    return 400
  }

  if (timeInSeconds <= 120) {
    return 300
  }

  if (timeInSeconds <= 150) {
    return 200
  }

  if (timeInSeconds <= 180) {
    return 100
  }

  return 0
}

export function calculateSudokuScore(
  difficulty: Difficulty,
  timeInSeconds: number,
  errors: number,
  hintsUsed: number,
) {
  const safeTimeInSeconds = Math.max(0, Math.floor(timeInSeconds))
  const safeErrors = Math.max(0, Math.floor(errors))
  const safeHintsUsed = Math.max(0, Math.floor(hintsUsed))
  const baseScore = BASE_SCORE_BY_DIFFICULTY[difficulty]
  const timePenalty = Math.floor(safeTimeInSeconds / 60) * 50
  const errorPenalty = safeErrors * 100
  const hintPenalty = safeHintsUsed * 250
  const noErrorBonus = safeErrors === 0 ? 300 : 0
  const noHintBonus = safeHintsUsed === 0 ? 300 : 0
  const speedBonus = getSpeedBonus(safeTimeInSeconds)
  const finalScore =
    baseScore -
    timePenalty -
    errorPenalty -
    hintPenalty +
    noErrorBonus +
    noHintBonus +
    speedBonus

  return Math.max(0, finalScore)
}
