/** Local-time ISO date string (YYYY-MM-DD). */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** Whole days between two ISO dates (b - a). */
export function daysBetween(aISO: string, bISO: string): number {
  const a = new Date(aISO + 'T00:00:00')
  const b = new Date(bISO + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

/** Human label, e.g. "CYCLE 2026.06.16". Used for the System HUD. */
export function cycleLabel(isoDate: string): string {
  return 'CYCLE ' + isoDate.replace(/-/g, '.')
}
