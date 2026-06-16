# Wander · EarthOnline

A whimsical, wellness-centered to-do app reimagined as a quest terminal. Earthlings
are **Wanderers** who receive quests from **The System** (EarthOnline). Subtle sci-fi /
celestial / retro-cyber feel — pixel art only, no emojis.

## Concept

- **Side quests** — issued every cycle (day) by The System, *the same for all Wanderers*,
  drawn from a curated pool of quick, low-pressure, wellness-and-whimsy prompts. Each day's
  set covers at least 3 of the 5 categories.
- **Main quests** — your own to-dos. You *inscribe* them; The System *officially assigns*
  them the next cycle via an animated assignment ceremony.
- **5 categories** — Growth, Body, Bond, Sanctuary, Wonder. Each carries a 0–10 fulfillment
  value; their average is your **Happiness Index**.
- **EXP & levels** — every quest grants 20/40/60 EXP; completing quests raises both your
  level and the relevant category value (which gently decays when neglected).
- **Pip** — a fallen star and your assistant. Pip's mood tracks the Happiness Index and
  appears in the daily assignment ceremony.

## Architecture

Local-first single-page app — no backend, no accounts. Everything persists in
`localStorage`. Daily side quests are **deterministically seeded from the date**, so every
Wanderer who opens the app on the same day pulls the identical set without a server.

```
src/
  data/        categories, side-quest pool
  lib/         seeded RNG, date utils, quest generation, stats (EXP/levels/happiness), storage
  state/       store.tsx — reducer + localStorage persistence + daily roll-over
  components/  PixelArt (Pip + icons), Dashboard, QuestCard, AddMainQuest, Modals, Starfield
  styles/      global.css — celestial / retro-cyber design system
```

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

### Demo controls

The footer has **simulate next cycle** (advances the day to preview side-quest regeneration,
decay, and the assignment ceremony) and **reset terminal** (wipes local progress).

## Roadmap ideas

- Real backend + accounts for cross-device sync and a truly shared daily quest feed
- Seasonal / event side quests
- Pip notifications and reminders
- Quest history & streaks
