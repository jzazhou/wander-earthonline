export type CategoryId = 'growth' | 'body' | 'bond' | 'sanctuary' | 'wonder'

export interface Category {
  id: CategoryId
  /** Short display name shown on cards and HUD. */
  name: string
  /** One-line description of what the category nurtures. */
  blurb: string
  /** Hex accent color — restrained celestial pastels. */
  color: string
}

export const CATEGORY_ORDER: CategoryId[] = [
  'growth',
  'body',
  'bond',
  'sanctuary',
  'wonder',
]

export const CATEGORIES: Record<CategoryId, Category> = {
  growth: {
    id: 'growth',
    name: 'Growth',
    blurb: 'Personal growth — learning, craft, becoming.',
    color: '#b39cff',
  },
  body: {
    id: 'body',
    name: 'Body',
    blurb: 'Physical health — movement, rest, fuel.',
    color: '#ff9d8a',
  },
  bond: {
    id: 'bond',
    name: 'Bond',
    blurb: 'Connection — people, warmth, belonging.',
    color: '#6fe0d4',
  },
  sanctuary: {
    id: 'sanctuary',
    name: 'Sanctuary',
    blurb: 'Your space & the quiet of your mind.',
    color: '#8fd3ff',
  },
  wonder: {
    id: 'wonder',
    name: 'Wonder',
    blurb: 'Whimsy — the strange, the playful, the new.',
    color: '#ffd66e',
  },
}

export const EXP_OPTIONS = [20, 40, 60] as const
export type ExpValue = (typeof EXP_OPTIONS)[number]
