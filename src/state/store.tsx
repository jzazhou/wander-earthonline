import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { CategoryId, ExpValue } from '../data/categories'
import { daysBetween, toISODate } from '../lib/date'
import { generateSideQuests, makeId } from '../lib/quests'
import { buildRecap } from '../lib/recap'
import { applyDecay, boostValue, emptyValues } from '../lib/stats'
import { clearState, loadState, saveState } from '../lib/storage'
import type { Quest, WandererState } from '../lib/types'

interface FullState extends WandererState {
  /** Demo affordance: simulate the passage of days without waiting. */
  dayOffset: number
}

type Action =
  | { type: 'INIT'; name: string }
  | { type: 'ADD_MAIN'; title: string; detail?: string; category: CategoryId; exp: ExpValue }
  | { type: 'COMPLETE'; id: string }
  | { type: 'UNCOMPLETE'; id: string }
  | { type: 'DELETE'; id: string }
  | { type: 'ASSIGN_PENDING'; ids: string[] }
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
    quests: [],
    lastVisitDate: '',
    sideQuestsDate: '',
    pendingRecap: null,
    dayOffset: 0,
  }
}

function reducer(state: FullState, action: Action): FullState {
  switch (action.type) {
    case 'INIT':
      return { ...state, initialized: true, name: action.name.trim() || 'Wanderer' }

    case 'ADD_MAIN': {
      const currentDate = currentISO(state)
      const quest: Quest = {
        id: makeId(),
        kind: 'main',
        title: action.title.trim(),
        detail: action.detail?.trim() || undefined,
        category: action.category,
        exp: action.exp,
        status: 'drafted',
        createdDate: currentDate,
      }
      return { ...state, quests: [...state.quests, quest] }
    }

    case 'COMPLETE': {
      const q = state.quests.find((x) => x.id === action.id)
      if (!q || q.status === 'completed') return state
      const currentDate = currentISO(state)
      return {
        ...state,
        totalExp: state.totalExp + q.exp,
        values: boostValue(state.values, q.category, q.exp),
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

      let values = state.values
      if (state.lastVisitDate) {
        const gap = daysBetween(state.lastVisitDate, currentDate)
        values = applyDecay(values, gap)
      }
      // Replace side quests with today's communal set; keep all main quests.
      const mainQuests = state.quests.filter((q) => q.kind === 'main')
      const sideQuests =
        state.sideQuestsDate === currentDate
          ? state.quests.filter((q) => q.kind === 'side')
          : generateSideQuests(currentDate)
      return {
        ...state,
        values,
        quests: [...sideQuests, ...mainQuests],
        lastVisitDate: currentDate,
        sideQuestsDate: currentDate,
        pendingRecap,
      }
    }

    case 'DISMISS_RECAP':
      return { ...state, pendingRecap: null }

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

  // Roll the day forward (decay + fresh side quests) whenever the date changes.
  useEffect(() => {
    dispatch({ type: 'PROCESS_DAY', currentDate })
  }, [currentDate])

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
