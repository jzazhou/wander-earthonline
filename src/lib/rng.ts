/**
 * Deterministic, seedable RNG so every Wanderer who opens EarthOnline on the
 * same date pulls the exact same side quests — no server required.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Turn an ISO date (YYYY-MM-DD) into a stable integer seed. */
export function seedFromDate(isoDate: string, salt = 0): number {
  let h = 2166136261 ^ salt
  for (let i = 0; i < isoDate.length; i++) {
    h = Math.imul(h ^ isoDate.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

/** Fisher–Yates shuffle driven by a provided rng. Returns a new array. */
export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
