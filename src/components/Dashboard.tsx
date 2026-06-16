import { CATEGORIES, CATEGORY_ORDER } from '../data/categories'
import { cycleLabel } from '../lib/date'
import {
  happinessIndex,
  levelFromExp,
  pipMood,
  PIP_LINES,
  VALUE_MAX,
} from '../lib/stats'
import type { CategoryValues } from '../lib/types'
import { CategoryIcon, Pip } from './PixelArt'

// ── Header / system HUD ─────────────────────────────────────────
export function Hud({
  name,
  totalExp,
  currentDate,
}: {
  name: string
  totalExp: number
  currentDate: string
}) {
  const lvl = levelFromExp(totalExp)
  return (
    <header className="hud">
      <div className="hud__brand">
        <div className="eyebrow">EarthOnline · Quest Terminal</div>
        <h1 className="hud__title">
          WANDER<b>_</b>
        </h1>
        <div className="hud__sub">
          {cycleLabel(currentDate)} · WANDERER: <b>{name.toUpperCase()}</b>
          <span className="blink"> ▌</span>
        </div>
      </div>

      <div className="hud__meta">
        <div className="panel levelchip">
          <div>
            <div className="levelchip__lv">LEVEL</div>
            <div className="levelchip__num">{String(lvl.level).padStart(2, '0')}</div>
          </div>
          <div>
            <div className="xpbar" role="progressbar" aria-valuenow={Math.round(lvl.progress * 100)}>
              <div className="xpbar__fill" style={{ width: `${lvl.progress * 100}%` }} />
            </div>
            <div className="xpbar__label">
              {lvl.intoLevel} / {lvl.levelSpan} EXP · {totalExp} total
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// ── Pip + Happiness band ────────────────────────────────────────
export function Band({ values }: { values: CategoryValues }) {
  const happiness = happinessIndex(values)
  const mood = pipMood(happiness)
  const moodColorMap: Record<string, string> = {
    radiant: '#ffe79a',
    bright: '#ffd66e',
    steady: '#eccb7f',
    dim: '#c4ac74',
    faint: '#8d896f',
  }

  return (
    <section className="band">
      <div className="panel pip-panel">
        <div className="pip-stage">
          <div
            className="pip-glow"
            style={{ background: `radial-gradient(circle, ${moodColorMap[mood]}, transparent 70%)` }}
          />
          <div className="pip-float">
            <Pip mood={mood} unit={6} />
          </div>
        </div>
        <div className="pip-copy">
          <div className="pip-copy__name">PIP</div>
          <div className="pip-copy__mood">{mood}</div>
          <p className="pip-copy__line">{PIP_LINES[mood]}</p>
        </div>
      </div>

      <div className="panel happy">
        <div className="happy__head">
          <div className="eyebrow">Life Resonance · Happiness Index</div>
          <div className="happy__index">
            {happiness.toFixed(1)}
            <small> / {VALUE_MAX}</small>
          </div>
        </div>
        <div className="bars">
          {CATEGORY_ORDER.map((id) => {
            const c = CATEGORIES[id]
            const v = values[id]
            return (
              <div className="bar" key={id}>
                <span className="bar__name" style={{ color: c.color }}>
                  <CategoryIcon id={id} unit={2} color={c.color} /> {c.name}
                </span>
                <div className="bar__track">
                  <div
                    className="bar__fill"
                    style={{ width: `${(v / VALUE_MAX) * 100}%`, color: c.color }}
                  />
                </div>
                <span className="bar__val">{v.toFixed(1)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
