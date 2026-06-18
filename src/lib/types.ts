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
export type CategoryDates = Record<CategoryId, string>

/** A free-form entry in the Wanderer's Quest Book. */
export interface JournalEntry {
  id: string
  /** Full ISO timestamp of when it was written. */
  createdAt: string
  text: string
}

/** Summary of the cycle that just ended, shown in the daybreak report. */
export interface DailyRecap {
  /** ISO date (YYYY-MM-DD) of the day being summarized. */
  date: string
  questsCompleted: number
  expGained: number
  /** Distinct categories the Wanderer touched that day, in first-seen order. */
  categories: CategoryId[]
  /** Titles of the quests fulfilled (for flavor in the report). */
  completedTitles: string[]
}

export interface WandererState {
  /** First-run flag for the welcome/onboarding beat. */
  initialized: boolean
  /** Chosen Wanderer callsign. */
  name: string
  totalExp: number
  /** Per-category fulfillment, each 0–10. */
  values: CategoryValues
  /** ISO date a category was last fulfilled — drives the neglect grace period. */
  lastActive: CategoryDates
  /** Side quests are regenerated per day; keyed nothing — all live in `quests`. */
  quests: Quest[]
  /** Last date (YYYY-MM-DD) the app processed a "new day". */
  lastVisitDate: string
  /** Date for which side quests were last generated. */
  sideQuestsDate: string
  /** Recap of the previous cycle, awaiting the daybreak report. Null when none pending. */
  pendingRecap: DailyRecap | null
  /** Set once at registration so a new Wanderer sees their first quest assignment. */
  pendingFirstAssignment: boolean
  /** The Wanderer's Quest Book entries, newest first. */
  journal: JournalEntry[]
}
