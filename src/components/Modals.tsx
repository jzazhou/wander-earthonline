import { useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { encouragement } from '../lib/recap'
import type { PipMood } from '../lib/stats'
import type { DailyRecap, Quest } from '../lib/types'
import { CategoryIcon, Pip } from './PixelArt'

// ── First-run onboarding: EarthOnline registers a new Wanderer ───
export function Onboarding({ onConfirm }: { onConfirm: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <div className="scrim">
      <div className="panel modal">
        <div className="modal__system">EarthOnline · Incoming Transmission</div>
        <div className="modal__pip">
          <div className="pip-float">
            <Pip mood="bright" unit={7} />
          </div>
        </div>
        <h2 className="modal__title">A fallen star has found you.</h2>
        <p className="modal__lead">
          I am Pip. You have been registered with EarthOnline as a Wanderer — one of the
          countless Earthlings quietly tending to their own small corner of the cosmos.
          Each cycle, The System will issue you side quests, and you may inscribe quests of
          your own. Complete them, and we both grow brighter.
          <br />
          <br />
          First — what shall I call you?
        </p>
        <input
          className="field onboard__field"
          placeholder="Enter your callsign, Wanderer"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirm(name.trim() || 'Wanderer')
          }}
        />
        <div className="modal__actions">
          <button className="pixel-btn pixel-btn--primary" onClick={() => onConfirm(name.trim() || 'Wanderer')}>
            Begin Wandering
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Daybreak: the start-of-cycle report + quest assignment ──────
// Phase 1 ("report") recaps the cycle that just ended with words of
// encouragement. Phase 2 ("assign") reveals this cycle's quests popping in,
// system-quest style, and officially assigns the Wanderer's inscribed quests.
function DaybreakReveal({
  quest,
  kind,
  index,
}: {
  quest: Quest
  kind: 'side' | 'main'
  index: number
}) {
  const c = CATEGORIES[quest.category]
  return (
    <div
      className="assign-item"
      style={{ ['--cat' as string]: c.color, animationDelay: `${0.1 + index * 0.14}s` }}
    >
      <span
        className="daybreak-tag"
        style={{ color: kind === 'main' ? 'var(--violet)' : 'var(--system)' }}
      >
        {kind === 'main' ? 'MAIN' : 'SIDE'}
      </span>
      <span className="assign-item__t">{quest.title}</span>
      <span className="qcard__cat" style={{ ['--cat' as string]: c.color, color: c.color }}>
        <CategoryIcon id={quest.category} unit={2} color={c.color} /> {c.name}
      </span>
      <span className="qcard__exp">+{quest.exp}</span>
    </div>
  )
}

export function DaybreakModal({
  recap,
  name,
  mood,
  sideQuests,
  assignments,
  onComplete,
}: {
  recap: DailyRecap | null
  name: string
  mood: PipMood
  sideQuests: Quest[]
  assignments: Quest[]
  onComplete: () => void
}) {
  const [phase, setPhase] = useState<'report' | 'assign'>(recap ? 'report' : 'assign')

  // ── Phase 1: cycle report ──
  if (phase === 'report' && recap) {
    const date = recap.date.replace(/-/g, '.')
    return (
      <div className="scrim">
        <div className="panel modal">
          <div className="modal__system">EarthOnline · Cycle Report</div>
          <div className="modal__pip">
            <div className="pip-float">
              <Pip mood={mood} unit={6} />
            </div>
          </div>
          <h2 className="modal__title">Cycle {date} complete, {name}.</h2>
          <p className="modal__lead">Here is what you carried through the last cycle.</p>

          <div className="recap-stats">
            <div className="recap-stat">
              <div className="recap-stat__num">{recap.questsCompleted}</div>
              <div className="recap-stat__label">Quests Done</div>
            </div>
            <div className="recap-stat">
              <div className="recap-stat__num recap-stat__num--gold">+{recap.expGained}</div>
              <div className="recap-stat__label">EXP Gained</div>
            </div>
            <div className="recap-stat">
              <div className="recap-realms">
                {recap.categories.length === 0 ? (
                  <span className="recap-stat__num" style={{ color: 'var(--ink-faint)' }}>
                    —
                  </span>
                ) : (
                  recap.categories.map((id) => (
                    <CategoryIcon key={id} id={id} unit={3} color={CATEGORIES[id].color} />
                  ))
                )}
              </div>
              <div className="recap-stat__label">Realms Touched</div>
            </div>
          </div>

          <p className="recap-encourage">{encouragement(recap)}</p>

          <div className="modal__actions">
            <button className="pixel-btn pixel-btn--primary" onClick={() => setPhase('assign')}>
              Receive Today's Quests
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Phase 2: quest assignment / reveal ──
  const total = assignments.length + sideQuests.length
  return (
    <div className="scrim">
      <div className="panel modal">
        <div className="modal__system">EarthOnline · Quest Assignment</div>
        <div className="modal__pip">
          <div className="pip-float">
            <Pip mood="radiant" unit={6} />
          </div>
        </div>
        <h2 className="modal__title">A new cycle dawns, Wanderer.</h2>
        <p className="modal__lead">
          The System issues your quests for this cycle.
          {assignments.length > 0
            ? ' The quests you inscribed are now made official, alongside today’s shared side quests.'
            : ' Today’s side quests are shared by every Wanderer across EarthOnline.'}
        </p>
        <div className="assign-list">
          {assignments.map((q, i) => (
            <DaybreakReveal key={q.id} quest={q} kind="main" index={i} />
          ))}
          {sideQuests.map((q, i) => (
            <DaybreakReveal key={q.id} quest={q} kind="side" index={assignments.length + i} />
          ))}
        </div>
        <div className="modal__actions">
          <button className="pixel-btn pixel-btn--primary" onClick={onComplete}>
            Begin Cycle {total > 0 ? `· ${total} Quests` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
