import type { Difficulty } from '../types/sudoku.types'

interface DifficultyConfig {
  emptyCells: number
  label: string
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    emptyCells: 14,
    label: 'Fácil',
  },
  medium: {
    emptyCells: 18,
    label: 'Medio',
  },
  hard: {
    emptyCells: 22,
    label: 'Difícil',
  },
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard']

export function getDifficultyLabel(difficulty: Difficulty) {
  return DIFFICULTY_CONFIG[difficulty].label
}
