import { useEffect, useMemo, useRef, useState } from 'react'
import Starfield from './components/Starfield'
import { Hud, Band } from './components/Dashboard'
import QuestCard from './components/QuestCard'
import AddMainQuest from './components/AddMainQuest'
import { Onboarding, AssignmentCeremony } from './components/Modals'
import { Pip } from './components/PixelArt'
import { StoreProvider, useStore } from './state/store'
import { levelFromExp } from './lib/stats'
import type { Quest } from './lib/types'

function sortQuests(quests: Quest[]): Quest[] {
  const rank = (q: Quest) =>
    q.status === 'active' ? 0 : q.status === 'drafted' ? 1 : 2
  return [...quests].sort((a, b) => rank(a) - rank(b))
}

function Game() {
  const { state, currentDate, dispatch } = useStore()
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const prevLevel = useRef(levelFromExp(state.totalExp).level)

  // Detect a level-up to fire the celebratory toast.
  useEffect(() => {
    const lvl = levelFromExp(state.totalExp).level
    if (lvl > prevLevel.current) {
      setLevelUp(lvl)
      const t = setTimeout(() => setLevelUp(null), 4200)
      prevLevel.current = lvl
      return () => clearTimeout(t)
    }
    prevLevel.current = lvl
  }, [state.totalExp])

  const sideQuests = useMemo(
    () => sortQuests(state.quests.filter((q) => q.kind === 'side')),
    [state.quests],
  )
  const mainQuests = useMemo(
    () => sortQuests(state.quests.filter((q) => q.kind === 'main')),
    [state.quests],
  )

  // Quests inscribed on a previous cycle, awaiting their official assignment.
  const pendingAssignment = useMemo(
    () =>
      state.quests.filter(
        (q) => q.kind === 'main' && q.status === 'drafted' && q.createdDate < currentDate,
      ),
    [state.quests, currentDate],
  )

  const sideDone = sideQuests.filter((q) => q.status === 'completed').length
  const mainActive = mainQuests.filter((q) => q.status !== 'completed').length

  function toggle(id: string) {
    const q = state.quests.find((x) => x.id === id)
    if (!q) return
    dispatch({ type: q.status === 'completed' ? 'UNCOMPLETE' : 'COMPLETE', id })
  }

  if (!state.initialized) {
    return (
      <>
        <Starfield />
        <Onboarding onConfirm={(name) => dispatch({ type: 'INIT', name })} />
      </>
    )
  }

  return (
    <>
      <Starfield />
      <div className="app">
        <Hud name={state.name} totalExp={state.totalExp} currentDate={currentDate} />
        <Band values={state.values} />

        <section className="board">
          {/* ── Side quests ── */}
          <div>
            <div className="column__head">
              <h3 className="column__title">
                SIDE QUESTS
                <small>Issued by The System · shared by all Wanderers</small>
              </h3>
              <span className="column__count">
                {sideDone}/{sideQuests.length}
              </span>
            </div>
            <div className="questlist">
              {sideQuests.length === 0 ? (
                <div className="empty">The System is quiet today.</div>
              ) : (
                sideQuests.map((q) => <QuestCard key={q.id} quest={q} onToggle={toggle} />)
              )}
            </div>
          </div>

          {/* ── Main quests ── */}
          <div>
            <div className="column__head">
              <h3 className="column__title">
                MAIN QUESTS
                <small>Your own — inscribed by you, assigned by The System</small>
              </h3>
              <span className="column__count">{mainActive} ACTIVE</span>
            </div>
            <div className="questlist">
              {mainQuests.length === 0 ? (
                <div className="empty">
                  No quests of your own yet.
                  <br />
                  Inscribe one below — The System assigns it next cycle.
                </div>
              ) : (
                mainQuests.map((q) => (
                  <QuestCard
                    key={q.id}
                    quest={q}
                    onToggle={toggle}
                    onDelete={(id) => dispatch({ type: 'DELETE', id })}
                  />
                ))
              )}
            </div>
            <AddMainQuest
              onAdd={(q) =>
                dispatch({ type: 'ADD_MAIN', title: q.title, detail: q.detail, category: q.category, exp: q.exp })
              }
            />
          </div>
        </section>

        <footer className="foot">
          <span>EARTHONLINE v0.1 · LOCAL TERMINAL · all progress stored on this device</span>
          <span style={{ display: 'inline-flex', gap: 16 }}>
            <button onClick={() => dispatch({ type: 'ADVANCE_DAY' })}>simulate next cycle</button>
            <button
              onClick={() => {
                if (confirm('Reset EarthOnline? All progress on this device is erased.')) {
                  dispatch({ type: 'RESET' })
                }
              }}
            >
              reset terminal
            </button>
          </span>
        </footer>
      </div>

      {pendingAssignment.length > 0 && (
        <AssignmentCeremony
          quests={pendingAssignment}
          onAccept={() =>
            dispatch({ type: 'ASSIGN_PENDING', ids: pendingAssignment.map((q) => q.id) })
          }
        />
      )}

      {levelUp !== null && (
        <div className="toast">
          <Pip mood="radiant" unit={4} />
          <div>
            <div className="toast__lv">LEVEL {String(levelUp).padStart(2, '0')} REACHED</div>
            <div className="toast__sub">The System acknowledges your ascent, Wanderer.</div>
          </div>
        </div>
      )}
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Game />
    </StoreProvider>
  )
}
