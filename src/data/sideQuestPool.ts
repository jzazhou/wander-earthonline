import type { CategoryId, ExpValue } from './categories'

export interface SideQuestSeed {
  title: string
  detail?: string
  category: CategoryId
  exp: ExpValue
}

/**
 * The communal pool. Every day, EarthOnline draws a handful of these for ALL
 * Wanderers, seeded by the date — random, quick, low-pressure, but meaningful.
 * Keep entries short, kind, and a little strange. No emojis — ever.
 */
export const SIDE_QUEST_POOL: SideQuestSeed[] = [
  // ── Growth ───────────────────────────────────────────────
  { title: 'Learn one word in a language you do not speak', category: 'growth', exp: 20 },
  { title: 'Read a single page of anything that is not a screen', category: 'growth', exp: 20 },
  { title: 'Write down one thing you changed your mind about this year', category: 'growth', exp: 40 },
  { title: 'Teach someone something small you happen to know', category: 'growth', exp: 40 },
  { title: 'Spend ten minutes on a skill you abandoned', category: 'growth', exp: 40 },
  { title: 'List three questions you do not yet have answers to', category: 'growth', exp: 20 },

  // ── Body ─────────────────────────────────────────────────
  { title: 'Take a different route than you normally would', category: 'body', exp: 20 },
  { title: 'Drink a full glass of water before your next task', category: 'body', exp: 20 },
  { title: 'Stretch toward the ceiling until something pops', category: 'body', exp: 20 },
  { title: 'Walk somewhere with no destination for five minutes', category: 'body', exp: 40 },
  { title: 'Stand outside and take ten slow breaths of real air', category: 'body', exp: 20 },
  { title: 'Go to sleep twenty minutes earlier than usual', category: 'body', exp: 40 },

  // ── Bond ─────────────────────────────────────────────────
  { title: 'Send a message to someone you have not talked to in a while', category: 'bond', exp: 40 },
  { title: 'Thank a person who will not expect it', category: 'bond', exp: 40 },
  { title: 'Ask someone what they are looking forward to', category: 'bond', exp: 20 },
  { title: 'Compliment a stranger on something they chose', category: 'bond', exp: 40 },
  { title: 'Tell someone a small true thing about your day', category: 'bond', exp: 20 },

  // ── Sanctuary ────────────────────────────────────────────
  { title: 'Clear one surface completely and leave it bare', category: 'sanctuary', exp: 40 },
  { title: 'Open a window and let the room exchange its air', category: 'sanctuary', exp: 20 },
  { title: 'Sit in silence for three minutes with no input', category: 'sanctuary', exp: 20 },
  { title: 'Put one out-of-place object back where it belongs', category: 'sanctuary', exp: 20 },
  { title: 'Light something, dim something, soften the room', category: 'sanctuary', exp: 20 },
  { title: 'Name three things in your space you are glad to own', category: 'sanctuary', exp: 20 },

  // ── Wonder ───────────────────────────────────────────────
  { title: 'Question: how would you introduce yourself to an alien?', detail: 'No spoken language allowed. You have ten seconds.', category: 'wonder', exp: 20 },
  { title: 'Find a cloud and decide, firmly, what it is', category: 'wonder', exp: 20 },
  { title: 'Invent a constellation and give it a name', category: 'wonder', exp: 40 },
  { title: 'Question: if today had a color, which one was it?', category: 'wonder', exp: 20 },
  { title: 'Notice something you walk past every day but never see', category: 'wonder', exp: 20 },
  { title: 'Question: what would your fallen star be named?', detail: 'Pip is curious. There are no wrong answers.', category: 'wonder', exp: 20 },
  { title: 'Make up a tiny ritual and perform it once, seriously', category: 'wonder', exp: 40 },
]
