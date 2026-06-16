import { CATEGORIES } from '../data/categories'
import type { Quest } from '../lib/types'
import { CategoryIcon, Glyph } from './PixelArt'

export default function QuestCard({
  quest,
  onToggle,
  onDelete,
}: {
  quest: Quest
  onToggle: (id: string) => void
  onDelete?: (id: string) => void
}) {
  const cat = CATEGORIES[quest.category]
  const done = quest.status === 'completed'
  const pending = quest.status === 'drafted'

  return (
    <div
      className={`qcard${done ? ' qcard--done' : ''}`}
      style={{ ['--cat' as string]: cat.color }}
    >
      <button
        className={`qcheck${done ? ' qcheck--on' : ''}`}
        onClick={() => onToggle(quest.id)}
        aria-pressed={done}
        aria-label={done ? `Mark "${quest.title}" not done` : `Complete "${quest.title}"`}
      >
        {done && <Glyph kind="check" unit={2} color="#06121a" />}
      </button>

      <div className="qcard__body">
        <div className="qcard__title">{quest.title}</div>
        {quest.detail && <div className="qcard__detail">{quest.detail}</div>}
        <div className="qcard__meta">
          <span className="qcard__cat">
            <CategoryIcon id={quest.category} unit={2} color={cat.color} />{' '}
            {cat.name}
          </span>
          <span className="qcard__exp">+{quest.exp} EXP</span>
          {pending && <span className="qcard__pending">AWAITING ASSIGNMENT</span>}
        </div>
      </div>

      {onDelete && (
        <button
          className="qcard__del"
          onClick={() => onDelete(quest.id)}
          aria-label={`Discard "${quest.title}"`}
        >
          <Glyph kind="cross" unit={2} />
        </button>
      )}
    </div>
  )
}
