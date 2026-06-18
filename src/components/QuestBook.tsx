import { useEffect, useMemo, useRef, useState } from 'react'
import { formatStamp, toISODate } from '../lib/date'
import type { JournalEntry } from '../lib/types'
import { Glyph } from './PixelArt'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

const pad = (n: number) => String(n).padStart(2, '0')
const hhmm = (iso: string) => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** A single saved page. */
function EntryPage({
  entry,
  stamp,
  onDelete,
}: {
  entry: JournalEntry
  stamp: string
  onDelete: (id: string) => void
}) {
  return (
    <div className="qbook__page qbook__entry">
      <div className="qbook__stamp">{stamp}</div>
      <p className="qbook__text">{entry.text}</p>
      <button
        className="qbook__del"
        onClick={() => onDelete(entry.id)}
        aria-label="Tear out this page"
      >
        <Glyph kind="cross" unit={2} />
      </button>
    </div>
  )
}

export default function QuestBook({
  entries,
  onAdd,
  onDelete,
  onClose,
}: {
  entries: JournalEntry[]
  onAdd: (text: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [month, setMonth] = useState(() => ({ y: now.getFullYear(), m: now.getMonth() }))
  const [selected, setSelected] = useState<string>(() => toISODate(new Date()))
  const taRef = useRef<HTMLTextAreaElement>(null)

  // A softly ticking clock so the "now" stamp feels alive while you write.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Group entries by local calendar day for the calendar view.
  const byDate = useMemo(() => {
    const map = new Map<string, JournalEntry[]>()
    for (const e of entries) {
      const key = toISODate(new Date(e.createdAt))
      const bucket = map.get(key)
      if (bucket) bucket.push(e)
      else map.set(key, [e])
    }
    return map
  }, [entries])

  function record() {
    const t = draft.trim()
    if (!t) return
    onAdd(t)
    setDraft('')
    // Surface the new page: jump to today in the calendar.
    const today = new Date()
    setMonth({ y: today.getFullYear(), m: today.getMonth() })
    setSelected(toISODate(today))
    taRef.current?.focus()
  }

  // Build the month grid cells (leading blanks + day numbers).
  const { y, m } = month
  const firstWeekday = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  const todayISO = toISODate(new Date())

  function shiftMonth(delta: number) {
    setMonth(({ y, m }) => {
      const d = new Date(y, m + delta, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  const selectedEntries = byDate.get(selected) ?? []
  const recent = entries.slice(0, 50)

  return (
    <div className="scrim" onMouseDown={onClose}>
      <div
        className="panel modal qbook"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Quest Book"
      >
        <div className="qbook__head">
          <div className="qbook__brand">
            <Glyph kind="book" unit={3} color="var(--gold)" />
            <div>
              <div className="qbook__title">QUEST BOOK</div>
              <div className="qbook__sub">Your private log, Wanderer</div>
            </div>
          </div>
          <div className="qbook__head-right">
            <div className="qbook__toggle" role="tablist">
              <button
                className={`qbook__tab${view === 'list' ? ' qbook__tab--on' : ''}`}
                onClick={() => setView('list')}
              >
                LIST
              </button>
              <button
                className={`qbook__tab${view === 'calendar' ? ' qbook__tab--on' : ''}`}
                onClick={() => setView('calendar')}
              >
                CALENDAR
              </button>
            </div>
            <button className="qbook__close" onClick={onClose} aria-label="Close Quest Book">
              <Glyph kind="cross" unit={3} />
            </button>
          </div>
        </div>

        {/* Composer — always available; a new page is stamped "now". */}
        <div className="qbook__page qbook__compose">
          <div className="qbook__stamp">
            <span className="blink">▌</span> {formatStamp(now, true)}
          </div>
          <textarea
            ref={taRef}
            className="qbook__field"
            placeholder="Write anything, Wanderer. The page is yours."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') record()
            }}
            rows={3}
          />
          <div className="qbook__compose-foot">
            <span className="qbook__hint">Ctrl/⌘ + Enter to record</span>
            <button
              className="pixel-btn pixel-btn--primary"
              onClick={record}
              disabled={!draft.trim()}
            >
              Record Entry
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="qbook__body">
          {view === 'list' ? (
            entries.length === 0 ? (
              <div className="qbook__empty">
                The book is blank for now.
                <br />
                Every page you write is kept here, stamped with its moment.
              </div>
            ) : (
              <>
                {recent.map((e) => (
                  <EntryPage
                    key={e.id}
                    entry={e}
                    stamp={formatStamp(new Date(e.createdAt))}
                    onDelete={onDelete}
                  />
                ))}
                {entries.length > recent.length && (
                  <div className="qbook__more">
                    Showing your {recent.length} most recent pages — switch to CALENDAR to browse the rest.
                  </div>
                )}
              </>
            )
          ) : (
            <div className="qcal">
              <div className="qcal__head">
                <button className="qcal__nav" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                  {'<'}
                </button>
                <span className="qcal__month">
                  {MONTHS[m]} {y}
                </span>
                <button className="qcal__nav" onClick={() => shiftMonth(1)} aria-label="Next month">
                  {'>'}
                </button>
              </div>
              <div className="qcal__grid">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="qcal__dow">
                    {w}
                  </div>
                ))}
                {cells.map((d, i) => {
                  if (d === null) return <div key={`b${i}`} className="qcal__cell qcal__cell--empty" />
                  const iso = `${y}-${pad(m + 1)}-${pad(d)}`
                  const has = byDate.has(iso)
                  const isToday = iso === todayISO
                  const isSel = iso === selected
                  return (
                    <button
                      key={iso}
                      className={`qcal__cell${has ? ' qcal__cell--has' : ''}${
                        isSel ? ' qcal__cell--sel' : ''
                      }${isToday ? ' qcal__cell--today' : ''}`}
                      onClick={() => setSelected(iso)}
                    >
                      {d}
                      {has && <span className="qcal__dot" />}
                    </button>
                  )
                })}
              </div>

              <div className="qcal__day">
                <div className="qcal__day-stamp">PAGES · {selected.replace(/-/g, '.')}</div>
                {selectedEntries.length === 0 ? (
                  <div className="qbook__empty">No pages written on this day.</div>
                ) : (
                  selectedEntries.map((e) => (
                    <EntryPage key={e.id} entry={e} stamp={hhmm(e.createdAt)} onDelete={onDelete} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
