import { SIDE_QUEST_POOL } from '../data/sideQuestPool'
import type { CategoryId } from '../data/categories'
import { mulberry32, seedFromDate, shuffle } from './rng'
import type { Quest } from './types'

/** How many side quests EarthOnline issues each cycle. */
const DAILY_SIDE_QUEST_COUNT = 4
/** Minimum distinct categories the daily set must cover (spec: >= 3 of 5). */
const MIN_CATEGORIES = 3

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

/**
 * Deterministically select today's side quests from the communal pool.
 * Same date -> same quests for everyone. Guarantees >= MIN_CATEGORIES spread.
 */
export function generateSideQuests(isoDate: string): Quest[] {
  const rng = mulberry32(seedFromDate(isoDate, 1337))
  const shuffled = shuffle(SIDE_QUEST_POOL, rng)

  const chosen: typeof SIDE_QUEST_POOL = []
  const usedCats = new Set<CategoryId>()

  // First pass: greedily satisfy category spread.
  for (const q of shuffled) {
    if (chosen.length >= DAILY_SIDE_QUEST_COUNT) break
    if (usedCats.size < MIN_CATEGORIES && usedCats.has(q.category)) continue
    chosen.push(q)
    usedCats.add(q.category)
  }
  // Second pass: top up to the daily count if greedy left us short.
  for (const q of shuffled) {
    if (chosen.length >= DAILY_SIDE_QUEST_COUNT) break
    if (chosen.includes(q)) continue
    chosen.push(q)
  }

  return chosen.map((seed, i) => ({
    id: `side-${isoDate}-${i}`,
    kind: 'side',
    title: seed.title,
    detail: seed.detail,
    category: seed.category,
    exp: seed.exp,
    status: 'active',
    createdDate: isoDate,
    assignedDate: isoDate,
  }))
}
