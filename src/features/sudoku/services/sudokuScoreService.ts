export function calculateGameScore(timeInSeconds: number, mistakes: number, hintsUsed: number) {
  return timeInSeconds + mistakes * 10 + hintsUsed * 30
}
