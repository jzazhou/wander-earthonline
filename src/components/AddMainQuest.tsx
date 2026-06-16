import { useState } from 'react'
import {
  CATEGORIES,
  CATEGORY_ORDER,
  EXP_OPTIONS,
  type CategoryId,
  type ExpValue,
} from '../data/categories'
import { CategoryIcon, Glyph } from './PixelArt'

export default function AddMainQuest({
  onAdd,
}: {
  onAdd: (q: {
    title: string
    detail?: string
    category: CategoryId
    exp: ExpValue
    startNow: boolean
  }) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [category, setCategory] = useState<CategoryId>('growth')
  const [exp, setExp] = useState<ExpValue>(40)
  const [startNow, setStartNow] = useState(true)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    onAdd({ title: t, detail: detail.trim() || undefined, category, exp, startNow })
    setTitle('')
    setDetail('')
    setExp(40)
    setStartNow(true)
    setOpen(false)
  }

  if (!open) {
    return (
      <button className="pixel-btn add-trigger" onClick={() => setOpen(true)} style={{ width: '100%', marginTop: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <Glyph kind="plus" unit={2} /> LOG A MAIN QUEST
        </span>
      </button>
    )
  }

  return (
    <form className="panel add" onSubmit={submit}>
      <div className="add__label">Log a quest of your own</div>
      <div className="add__row">
        <input
          className="field"
          placeholder="What will you set out to do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          autoFocus
        />
      </div>
      <div className="add__row">
        <textarea
          className="field"
          placeholder="A note to your future self (optional)"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          maxLength={200}
          rows={1}
        />
      </div>

      <div className="add__label">Realm it nurtures</div>
      <div className="chips">
        {CATEGORY_ORDER.map((id) => {
          const c = CATEGORIES[id]
          return (
            <button
              type="button"
              key={id}
              className={`chip${category === id ? ' chip--on' : ''}`}
              style={{ ['--c' as string]: c.color }}
              onClick={() => setCategory(id)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <CategoryIcon id={id} unit={2} color={c.color} /> {c.name}
              </span>
            </button>
          )
        })}
      </div>

      <div className="add__label" style={{ marginTop: 14 }}>
        Effort · EXP reward
      </div>
      <div className="chips">
        {EXP_OPTIONS.map((v) => (
          <button
            type="button"
            key={v}
            className={`chip${exp === v ? ' chip--on' : ''}`}
            style={{ ['--c' as string]: 'var(--gold)' }}
            onClick={() => setExp(v)}
          >
            {v === 20 ? 'LIGHT' : v === 40 ? 'STEADY' : 'DEEP'} · {v}
          </button>
        ))}
      </div>

      <div className="add__label" style={{ marginTop: 14 }}>
        When
      </div>
      <div className="chips">
        <button
          type="button"
          className={`chip${startNow ? ' chip--on' : ''}`}
          style={{ ['--c' as string]: 'var(--system)' }}
          onClick={() => setStartNow(true)}
        >
          Start this cycle
        </button>
        <button
          type="button"
          className={`chip${!startNow ? ' chip--on' : ''}`}
          style={{ ['--c' as string]: 'var(--violet)' }}
          onClick={() => setStartNow(false)}
        >
          Inscribe for next cycle
        </button>
      </div>

      <div className="add__foot">
        <button type="button" className="pixel-btn pixel-btn--ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button type="submit" className="pixel-btn pixel-btn--primary" disabled={!title.trim()}>
          {startNow ? 'Add Quest' : 'Inscribe Quest'}
        </button>
      </div>
    </form>
  )
}
