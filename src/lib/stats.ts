import { CATEGORY_ORDER } from '../data/categories'
import type { CategoryId, ExpValue } from '../data/categories'
import type { CategoryValues } from './types'

// ── Levels ────────────────────────────────────────────────────────────────
// A gentle curve: each level costs a bit more than the last.
const BASE_LEVEL_COST = 100

/** Total EXP required to *reach* the start of a given level (level 1 = 0). */
function expAtLevelStart(level: number): number {
  // Sum of BASE * n for n in 1..level-1  ->  BASE * (level-1)*level/2
  const n = level - 1
  return (BASE_LEVEL_COST * n * (n + 1)) / 2
}

export interface LevelInfo {
  level: number
  /** EXP earned within the current level. */
  intoLevel: number
  /** EXP needed to span the current level. */
  levelSpan: number
  /** 0..1 progress through the current level. */
  progress: number
}

export function levelFromExp(totalExp: number): LevelInfo {
  let level = 1
  while (totalExp >= expAtLevelStart(level + 1)) level++
  const start = expAtLevelStart(level)
  const span = expAtLevelStart(level + 1) - start
  const intoLevel = totalExp - start
  return {
    level,
    intoLevel,
    levelSpan: span,
    progress: span > 0 ? intoLevel / span : 0,
  }
}

// ── Category values & happiness ───────────────────────────────────────────
export const VALUE_MIN = 0
export const VALUE_MAX = 10
export const VALUE_START = 5

/** Gentle nightly drift toward neglect — keeps the index a living thing. */
const DAILY_DECAY = 0.5
/** Floor that decay will not pull a category beneath. */
const DECAY_FLOOR = 2

const EXP_TO_VALUE: Record<ExpValue, number> = { 20: 0.5, 40: 0.85, 60: 1.25 }

export function clampValue(v: number): number {
  return Math.max(VALUE_MIN, Math.min(VALUE_MAX, v))
}

export function emptyValues(start = VALUE_START): CategoryValues {
  return CATEGORY_ORDER.reduce((acc, id) => {
    acc[id] = start
    return acc
  }, {} as CategoryValues)
}

/** Apply N days of decay (called when the Wanderer returns after a gap). */
export function applyDecay(values: CategoryValues, days: number): CategoryValues {
  if (days <= 0) return values
  const next = { ...values }
  for (const id of CATEGORY_ORDER) {
    const drop = DAILY_DECAY * days
    next[id] = next[id] > DECAY_FLOOR ? Math.max(DECAY_FLOOR, next[id] - drop) : next[id]
  }
  return next
}

/** Reward fulfilling a category by completing a quest of given EXP. */
export function boostValue(values: CategoryValues, cat: CategoryId, exp: ExpValue): CategoryValues {
  return { ...values, [cat]: clampValue(values[cat] + EXP_TO_VALUE[exp]) }
}

/** Happiness index = mean of the five category values, on a 0–10 scale. */
export function happinessIndex(values: CategoryValues): number {
  const sum = CATEGORY_ORDER.reduce((s, id) => s + values[id], 0)
  return sum / CATEGORY_ORDER.length
}

// ── Pip's mood ────────────────────────────────────────────────────────────
export type PipMood = 'radiant' | 'bright' | 'steady' | 'dim' | 'faint'

export function pipMood(happiness: number): PipMood {
  if (happiness >= 8) return 'radiant'
  if (happiness >= 6.25) return 'bright'
  if (happiness >= 4.5) return 'steady'
  if (happiness >= 2.75) return 'dim'
  return 'faint'
}

export const PIP_LINES: Record<PipMood, string> = {
  radiant: 'You are luminous today, Wanderer. I can barely look at you.',
  bright: 'The signal is strong. Whatever you are doing — keep at it.',
  steady: 'Holding steady. A small quest now would tip us upward.',
  dim: 'I have dimmed a little. Even one quest would help me glow.',
  faint: 'I have gone faint, Wanderer. Take a single quest. Any of them.',
}
