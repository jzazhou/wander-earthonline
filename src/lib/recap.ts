import type { CategoryId } from '../data/categories'
import type { DailyRecap, Quest } from './types'

/**
 * Summarize a cycle by the quests fulfilled on that exact date. Must be called
 * with the quest list as it stood BEFORE side quests are regenerated, since
 * completed side quests are dropped when the new day's set is drawn.
 */
export function buildRecap(quests: Quest[], endedDate: string): DailyRecap {
  const done = quests.filter(
    (q) => q.status === 'completed' && q.completedDate === endedDate,
  )
  const categories: CategoryId[] = []
  for (const q of done) {
    if (!categories.includes(q.category)) categories.push(q.category)
  }
  return {
    date: endedDate,
    questsCompleted: done.length,
    expGained: done.reduce((sum, q) => sum + q.exp, 0),
    categories,
    completedTitles: done.map((q) => q.title),
  }
}

/** Pip's words of encouragement, scaled to how the cycle went. */
export function encouragement(recap: DailyRecap): string {
  const n = recap.questsCompleted
  if (n === 0) {
    return 'No quests fulfilled — and that is alright. Even a still cycle keeps its place in the orbit. Today, we begin again, together.'
  }
  if (n <= 2) {
    return 'A gentle cycle. Small steps still carry a Wanderer a long way. Let us reach just a little further today.'
  }
  if (n <= 4) {
    return 'A bright cycle, Wanderer. The System felt your momentum. Keep the signal strong.'
  }
  return 'A radiant cycle. You shone, and so did I. The cosmos is a little warmer for it.'
}
