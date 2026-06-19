import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { CATEGORY_ORDER } from '../data/categories'
import type { CategoryId, ExpValue } from '../data/categories'
import { toISODate } from '../lib/date'
import { generateSideQuests, makeId } from '../lib/quests'
import { buildRecap } from '../lib/recap'
import { applyNeglectDecay, boostValue, emptyDates, emptyValues } from '../lib/stats'
import { clearState, loadState, saveState } from '../lib/storage'
import type { Quest, WandererState } from '../lib/types'

interface FullState extends WandererState {
  /** Demo affordance: simulate the passage of days without waiting. */
  dayOffset: number
}

type Action =
  | { type: 'INIT'; name: string }
  | {
      type: 'ADD_MAIN'
      title: string
      detail?: string
      category: CategoryId
      exp: ExpValue
      /** Start it today (active now) vs. inscribe it for the next cycle's ceremony. */
      startNow: boolean
    }
  | { type: 'COMPLETE'; id: string }
  | { type: 'UNCOMPLETE'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'ASSIGN_PENDING'; ids: string[] }
  | { type: 'ADD_JOURNAL'; text: string }
  | { type: 'DELETE_JOURNAL'; id: string }
  | { type: 'PROCESS_DAY'; currentDate: string }
  | { type: 'DISMISS_RECAP' }
  | { type: 'ADVANCE_DAY' }
  | { type: 'RESET' }

function freshState(): FullState {
  return {
    initialized: false,
    name: 'Wanderer',
    totalExp: 0,
    values: emptyValues(),
    lastActive: emptyDates(),
    quests: [],
    lastVisitDate: '',
    sideQuestsDate: '',
    pendingRecap: null,
    pendingFirstAssignment: false,
    journal: [],
    dayOffset: 0,
  }
}

function reducer(state: FullState, action: Action): FullState {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        initialized: true,
        name: action.name.trim() || 'Wanderer',
        // Greet the new Wanderer with their first quest assignment.
        pendingFirstAssignment: true,
      }

    case 'ADD_MAIN': {
      const currentDate = currentISO(state)
      const quest: Quest = {
        id: makeId(),
        kind: 'main',
        title: action.title.trim(),
        detail: action.detail?.trim() || undefined,
        category: action.category,
        exp: action.exp,
        status: action.startNow ? 'active' : 'drafted',
        createdDate: currentDate,
        assignedDate: action.startNow ? currentDate : undefined,
      }
      return { ...state, quests: [...state.quests, quest] }
    }

    case 'COMPLETE': {
      const q = state.quests.find((x) => x.id === action.id)
      if (!q || q.status === 'completed') return state
      if (typeof pendo !== 'undefined') {
        pendo.track("quest_completed", {
          quest_kind: q.kind,
          category: q.category,
          exp_gained: q.exp,
          quest_id: q.id,
          quest_title: q.title
        })
      }
      const currentDate = currentISO(state)
      return {
        ...state,
        totalExp: state.totalExp + q.exp,
        values: boostValue(state.values, q.category, q.exp),
        // Fulfilling a category resets its neglect clock.
        lastActive: { ...state.lastActive, [q.category]: currentDate },
        quests: state.quests.map((x) =>
          x.id === action.id
            ? { ...x, status: 'completed', completedDate: currentDate }
            : x,
        ),
      }
    }

    case 'UNCOMPLETE': {
      const q = state.quests.find((x) => x.id === action.id)
      if (!q || q.status !== 'completed') return state
      if (typeof pendo !== 'undefined') {
        pendo.track("quest_uncompleted", {
          quest_kind: q.kind,
          category: q.category,
          exp_refunded: q.exp,
          quest_id: q.id
        })
      }
      // Refund EXP; leave category value (decay model is one-directional & gentle).
      return {
        ...state,
        totalExp: Math.max(0, state.totalExp - q.exp),
        quests: state.quests.map((x) =>
          x.id === action.id
            ? { ...x, status: 'active', completedDate: undefined }
            : x,
        ),
      }
    }

    case 'DELETE':
      return { ...state, quests: state.quests.filter((x) => x.id !== action.id) }

    case 'ASSIGN_PENDING': {
      const currentDate = currentISO(state)
      const idset = new Set(action.ids)
      return {
        ...state,
        quests: state.quests.map((x) =>
          idset.has(x.id) ? { ...x, status: 'active', assignedDate: currentDate } : x,
        ),
      }
    }

    case 'ADD_JOURNAL': {
      const text = action.text.trim()
      if (!text) return state
      const entry = { id: makeId(), createdAt: new Date().toISOString(), text }
      return { ...state, journal: [entry, ...state.journal] }
    }

    case 'DELETE_JOURNAL':
      return { ...state, journal: state.journal.filter((e) => e.id !== action.id) }

    case 'PROCESS_DAY': {
      const { currentDate } = action
      if (currentDate === state.lastVisitDate && currentDate === state.sideQuestsDate) {
        return state
      }
      const rolledToNewDay = state.lastVisitDate !== '' && state.lastVisitDate !== currentDate

      // Capture the cycle that just closed BEFORE side quests are replaced.
      const pendingRecap = rolledToNewDay
        ? buildRecap(state.quests, state.lastVisitDate)
        : state.pendingRecap

      // Anchor any not-yet-seen category so its grace window starts now,
      // not in 1970 (also migrates older saves without lastActive).
      const anchor = state.lastVisitDate || currentDate
      const lastActive = { ...state.lastActive }
      for (const id of CATEGORY_ORDER) {
        if (!lastActive[id]) lastActive[id] = anchor
      }

      // Categories untouched past the grace window fade; the rest hold.
      let values = state.values
      if (state.lastVisitDate) {
        values = applyNeglectDecay(values, lastActive, state.lastVisitDate, currentDate)
      }
      // Replace side quests with today's communal set. Keep active + inscribed
      // main quests; clear out the ones finished in the cycle that just ended
      // (their EXP is already banked and they are counted in the recap above).
      const mainQuests = state.quests.filter(
        (q) => q.kind === 'main' && !(rolledToNewDay && q.status === 'completed'),
      )
      const sideQuests =
        state.sideQuestsDate === currentDate
          ? state.quests.filter((q) => q.kind === 'side')
          : generateSideQuests(currentDate)
      return {
        ...state,
        values,
        lastActive,
        quests: [...sideQuests, ...mainQuests],
        lastVisitDate: currentDate,
        sideQuestsDate: currentDate,
        pendingRecap,
      }
    }

    case 'DISMISS_RECAP':
      return { ...state, pendingRecap: null, pendingFirstAssignment: false }

    case 'ADVANCE_DAY':
      return { ...state, dayOffset: state.dayOffset + 1 }

    case 'RESET':
      clearState()
      return freshState()

    default:
      return state
  }
}

export function currentISO(state: FullState): string {
  const d = new Date()
  d.setDate(d.getDate() + state.dayOffset)
  return toISODate(d)
}

interface StoreContextValue {
  state: FullState
  currentDate: string
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const loaded = loadState()
    return loaded ? { ...freshState(), ...loaded, dayOffset: (loaded as FullState).dayOffset ?? 0 } : freshState()
  })

  const currentDate = currentISO(state)

  // Roll the day forward (decay + fresh side quests) whenever the date changes
  // OR the stored cycle falls out of sync with it — e.g. right after a reset,
  // where currentDate is unchanged but sideQuestsDate has gone blank. The
  // action itself is idempotent, so re-running it when already current is a
  // no-op (and won't loop).
  useEffect(() => {
    dispatch({ type: 'PROCESS_DAY', currentDate })
  }, [currentDate, state.sideQuestsDate, state.lastVisitDate])

  // Persist everything except the volatile dayOffset-derived view.
  useEffect(() => {
    saveState(state)
  }, [state])

  const value = useMemo(
    () => ({ state, currentDate, dispatch }),
    [state, currentDate],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
