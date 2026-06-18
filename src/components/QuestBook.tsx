import { useEffect, useRef, useState } from 'react'
import { formatStamp } from '../lib/date'
import type { JournalEntry } from '../lib/types'
import { Glyph } from './PixelArt'

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
  const taRef = useRef<HTMLTextAreaElement>(null)

  // A softly ticking clock so the "now" stamp feels alive while you write.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function record() {
    const t = draft.trim()
    if (!t) return
    onAdd(t)
    setDraft('')
    taRef.current?.focus()
  }

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
          <button className="qbook__close" onClick={onClose} aria-label="Close Quest Book">
            <Glyph kind="cross" unit={3} />
          </button>
        </div>

        {/* Composer — a fresh page */}
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
            rows={4}
            autoFocus
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

        {/* Past pages */}
        <div className="qbook__entries">
          {entries.length === 0 ? (
            <div className="qbook__empty">
              The book is blank for now.
              <br />
              Every page you write is kept here, stamped with its moment.
            </div>
          ) : (
            entries.map((e) => (
              <div className="qbook__page qbook__entry" key={e.id}>
                <div className="qbook__stamp">{formatStamp(new Date(e.createdAt))}</div>
                <p className="qbook__text">{e.text}</p>
                <button
                  className="qbook__del"
                  onClick={() => onDelete(e.id)}
                  aria-label="Tear out this page"
                >
                  <Glyph kind="cross" unit={2} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
