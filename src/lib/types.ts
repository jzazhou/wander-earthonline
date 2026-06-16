import type { CategoryId, ExpValue } from '../data/categories'

export type QuestKind = 'side' | 'main'

/**
 * Lifecycle:
 *  - 'drafted'  : a main quest the Wanderer logged; awaits the next-day ceremony
 *  - 'active'   : officially assigned and live on the dashboard
 *  - 'completed': fulfilled — EXP granted
 */
export type QuestStatus = 'drafted' | 'active' | 'completed'

export interface Quest {
  id: string
  kind: QuestKind
  title: string
  /** Optional flavor / the "question" prompt for some side quests. */
  detail?: string
  category: CategoryId
  exp: ExpValue
  status: QuestStatus
  /** ISO date (YYYY-MM-DD) the quest was created/issued. */
  createdDate: string
  /** ISO date the quest was officially assigned (main quests). */
  assignedDate?: string
  /** ISO date completed. */
  completedDate?: string
}

export type CategoryValues = Record<CategoryId, number>

export interface WandererState {
  /** First-run flag for the welcome/onboarding beat. */
  initialized: boolean
  /** Chosen Wanderer callsign. */
  name: string
  totalExp: number
  /** Per-category fulfillment, each 0–10. */
  values: CategoryValues
  /** Side quests are regenerated per day; keyed nothing — all live in `quests`. */
  quests: Quest[]
  /** Last date (YYYY-MM-DD) the app processed a "new day". */
  lastVisitDate: string
  /** Date for which side quests were last generated. */
  sideQuestsDate: string
}
