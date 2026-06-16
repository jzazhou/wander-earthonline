import type { WandererState } from './types'

const KEY = 'wander.earthonline.v1'

export function loadState(): WandererState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as WandererState
  } catch {
    return null
  }
}

export function saveState(state: WandererState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage may be unavailable (private mode) — fail soft */
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
