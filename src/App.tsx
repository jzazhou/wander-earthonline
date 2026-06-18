import { useEffect, useMemo, useRef, useState } from 'react'
import Starfield from './components/Starfield'
import { Hud, Band } from './components/Dashboard'
import QuestCard from './components/QuestCard'
import AddMainQuest from './components/AddMainQuest'
import { Onboarding, DaybreakModal } from './components/Modals'
import QuestBook from './components/QuestBook'
import { Pip } from './components/PixelArt'
import { StoreProvider, useStore } from './state/store'
import { happinessIndex, levelFromExp, pipMood } from './lib/stats'
import type { Quest } from './lib/types'

function sortQuests(quests: Quest[]): Quest[] {
  const rank = (q: Quest) =>
    q.status === 'active' ? 0 : q.status === 'drafted' ? 1 : 2
  return [...quests].sort((a, b) => rank(a) - rank(b))
}

function Game() {
  const { state, currentDate, dispatch } = useStore()
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const [bookOpen, setBookOpen] = useState(false)
  const prevLevel = useRef(levelFromExp(state.totalExp).level)

  // Detect a level-up to fire the celebratory toast.
  useEffect(() => {
    const lvl = levelFromExp(state.totalExp).level
    if (lvl > prevLevel.current) setLevelUp(lvl)
    prevLevel.current = lvl
  }, [state.totalExp])

  // Auto-dismiss the level-up toast 5s after it appears (resets if you
  // level up again while it is still showing).
  useEffect(() => {
    if (levelUp === null) return
    const t = setTimeout(() => setLevelUp(null), 5000)
    return () => clearTimeout(t)
  }, [levelUp])

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
  // Today's main quests (active + completed) vs. those inscribed for next cycle.
  const mainToday = mainQuests.filter((q) => q.status !== 'drafted')
  const mainDrafted = mainQuests.filter((q) => q.status === 'drafted')
  const mainActive = mainQuests.filter((q) => q.status === 'active').length

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
        <Hud
          name={state.name}
          totalExp={state.totalExp}
          currentDate={currentDate}
          onOpenBook={() => setBookOpen(true)}
        />
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
                <>
                  {mainToday.length > 0 ? (
                    mainToday.map((q) => (
                      <QuestCard
                        key={q.id}
                        quest={q}
                        onToggle={toggle}
                        onDelete={(id) => dispatch({ type: 'DELETE', id })}
                      />
                    ))
                  ) : (
                    <div className="empty">
                      Nothing active this cycle.
                      <br />
                      {mainDrafted.length === 1
                        ? 'Your inscribed quest arrives next cycle.'
                        : 'Your inscribed quests arrive next cycle.'}
                    </div>
                  )}

                  {mainDrafted.length > 0 && (
                    <>
                      <div className="col-divider">
                        <span>INSCRIBED · ASSIGNED NEXT CYCLE</span>
                      </div>
                      {mainDrafted.map((q) => (
                        <QuestCard
                          key={q.id}
                          quest={q}
                          onToggle={toggle}
                          onDelete={(id) => dispatch({ type: 'DELETE', id })}
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
            <AddMainQuest
              onAdd={(q) =>
                dispatch({
                  type: 'ADD_MAIN',
                  title: q.title,
                  detail: q.detail,
                  category: q.category,
                  exp: q.exp,
                  startNow: q.startNow,
                })
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

      {(state.pendingRecap !== null ||
        pendingAssignment.length > 0 ||
        state.pendingFirstAssignment) && (
        <DaybreakModal
          recap={state.pendingRecap}
          name={state.name}
          mood={pipMood(happinessIndex(state.values))}
          sideQuests={sideQuests.filter((q) => q.status === 'active')}
          assignments={pendingAssignment}
          firstTime={state.pendingFirstAssignment && state.pendingRecap === null}
          onComplete={() => {
            if (pendingAssignment.length > 0) {
              dispatch({ type: 'ASSIGN_PENDING', ids: pendingAssignment.map((q) => q.id) })
            }
            dispatch({ type: 'DISMISS_RECAP' })
          }}
        />
      )}

      {bookOpen && (
        <QuestBook
          entries={state.journal}
          onAdd={(text) => dispatch({ type: 'ADD_JOURNAL', text })}
          onDelete={(id) => dispatch({ type: 'DELETE_JOURNAL', id })}
          onClose={() => setBookOpen(false)}
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
