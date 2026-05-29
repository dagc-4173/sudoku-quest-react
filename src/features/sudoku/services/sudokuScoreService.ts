export function calculateGameScore(seconds: number, errors: number, hints: number) {
  return Math.max(0, 1200 - seconds * 3 - errors * 80 - hints * 120)
}
