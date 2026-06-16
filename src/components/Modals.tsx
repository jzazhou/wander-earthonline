import { useState } from 'react'
import { CATEGORIES } from '../data/categories'
import type { Quest } from '../lib/types'
import { Pip } from './PixelArt'

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

// ── The next-day assignment ceremony ────────────────────────────
export function AssignmentCeremony({
  quests,
  onAccept,
}: {
  quests: Quest[]
  onAccept: () => void
}) {
  return (
    <div className="scrim">
      <div className="panel modal">
        <div className="modal__system">EarthOnline · Quest Assignment</div>
        <div className="modal__pip">
          <div className="pip-float">
            <Pip mood="radiant" unit={6} />
          </div>
        </div>
        <h2 className="modal__title">
          A new cycle dawns, Wanderer.
        </h2>
        <p className="modal__lead">
          The System has reviewed the quests you inscribed and now makes them
          official. {quests.length === 1 ? 'It' : 'They'} {quests.length === 1 ? 'is' : 'are'} yours to
          carry today.
        </p>
        <div className="assign-list">
          {quests.map((q, i) => {
            const c = CATEGORIES[q.category]
            return (
              <div
                className="assign-item"
                key={q.id}
                style={{ ['--cat' as string]: c.color, animationDelay: `${0.15 + i * 0.12}s` }}
              >
                <span className="assign-item__t">{q.title}</span>
                <span className="qcard__cat" style={{ ['--cat' as string]: c.color, color: c.color }}>
                  {c.name}
                </span>
                <span className="qcard__exp">+{q.exp}</span>
              </div>
            )
          })}
        </div>
        <div className="modal__actions">
          <button className="pixel-btn pixel-btn--primary" onClick={onAccept}>
            Accept {quests.length === 1 ? 'Quest' : 'Quests'}
          </button>
        </div>
      </div>
    </div>
  )
}
