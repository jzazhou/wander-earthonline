import type { CategoryId } from '../data/categories'
import type { PipMood } from '../lib/stats'

/* ----------------------------------------------------------------
   A tiny pixel-grid renderer. Pass rows of strings where any
   non-space / non-'.' character is a filled pixel. Everything in
   Wander's art is built this way — pixels only, never emojis.
   ---------------------------------------------------------------- */
function PixelGrid({
  rows,
  unit = 4,
  color,
  className,
  style,
}: {
  rows: string[]
  unit?: number
  color: string
  className?: string
  style?: React.CSSProperties
}) {
  const h = rows.length
  const w = rows[0]?.length ?? 0
  const rects: React.ReactNode[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = rows[y][x]
      if (c !== ' ' && c !== '.') {
        rects.push(
          <rect key={`${x}-${y}`} x={x * unit} y={y * unit} width={unit} height={unit} />,
        )
      }
    }
  }
  return (
    <svg
      className={className}
      style={style}
      width={w * unit}
      height={h * unit}
      viewBox={`0 0 ${w * unit} ${h * unit}`}
      fill={color}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  )
}

// ── Category icons (7×7 pixel glyphs) ───────────────────────────
const ICONS: Record<CategoryId, string[]> = {
  growth: [
    '...#...',
    '..###..',
    '.#####.',
    '#######',
    '...#...',
    '...#...',
    '...#...',
  ],
  body: [
    '.......',
    '##...##',
    '##...##',
    '#######',
    '##...##',
    '##...##',
    '.......',
  ],
  bond: [
    '.##.##.',
    '#######',
    '#######',
    '#######',
    '.#####.',
    '..###..',
    '...#...',
  ],
  sanctuary: [
    '...#...',
    '..###..',
    '.#####.',
    '#######',
    '.#...#.',
    '.#.#.#.',
    '.#...#.',
  ],
  wonder: [
    '...#...',
    '.#.#.#.',
    '..###..',
    '#######',
    '..###..',
    '.#.#.#.',
    '...#...',
  ],
}

export function CategoryIcon({
  id,
  unit = 3,
  color,
}: {
  id: CategoryId
  unit?: number
  color: string
}) {
  return <PixelGrid className="picon" rows={ICONS[id]} unit={unit} color={color} />
}

// ── Glyphs ──────────────────────────────────────────────────────
const CHECK = [
  '......#',
  '.....##',
  '#...##.',
  '##.##..',
  '.###...',
  '..#....',
  '.......',
]
const PLUS = [
  '..#..',
  '..#..',
  '#####',
  '..#..',
  '..#..',
]
const CROSS = [
  '#...#',
  '.#.#.',
  '..#..',
  '.#.#.',
  '#...#',
]
const HOURGLASS = [
  '#####',
  '.###.',
  '..#..',
  '.###.',
  '#####',
]
const BOOK = [
  '#.#####',
  '#.#...#',
  '#.#...#',
  '#.#...#',
  '#.#...#',
  '#.#...#',
  '#.#####',
]

const GLYPHS = {
  check: CHECK,
  plus: PLUS,
  cross: CROSS,
  hourglass: HOURGLASS,
  book: BOOK,
} as const

export function Glyph({
  kind,
  unit = 3,
  color = 'currentColor',
}: {
  kind: keyof typeof GLYPHS
  unit?: number
  color?: string
}) {
  return <PixelGrid rows={GLYPHS[kind]} unit={unit} color={color} />
}

// ── Pip, the fallen star ────────────────────────────────────────
// One body shape; mood swaps color, expression and sparkle.
const PIP_BODY = [
  '.....##.....',
  '.....##.....',
  '....####....',
  '....####....',
  '############',
  '.##########.',
  '..########..',
  '..########..',
  '..###..###..',
  '.###....###.',
  '.##......##.',
]

const MOOD_COLOR: Record<PipMood, string> = {
  radiant: '#ffe79a',
  bright: '#ffd66e',
  steady: '#eccb7f',
  dim: '#c4ac74',
  faint: '#8d896f',
}

/** Eye + mouth pixels in the 12-wide grid coordinate space. */
function pipFace(mood: PipMood, unit: number) {
  const dark = '#3a2d10'
  const px =
    (group: string) =>
    (x: number, y: number, w = 1, h = 1, fill = dark) => (
      <rect
        key={`${group}-${x}-${y}`}
        x={x * unit}
        y={y * unit}
        width={w * unit}
        height={h * unit}
        fill={fill}
      />
    )
  const eye = px('eye')
  const mth = px('mouth')
  // Eyes sit on row 6, cols 3-4 and 7-8.
  const eyes =
    mood === 'radiant'
      ? [eye(3, 6), eye(4, 5), eye(7, 6), eye(8, 5)] // happy upticks
      : mood === 'faint'
        ? [eye(3, 6), eye(8, 6)] // tiny
        : [eye(3, 5), eye(3, 6), eye(8, 5), eye(8, 6)] // round
  // Mouth on row 7-8 between eyes.
  const mouth =
    mood === 'radiant' || mood === 'bright'
      ? [mth(5, 7), mth(6, 7), mth(4, 6), mth(7, 6)] // smile
      : mood === 'steady'
        ? [mth(5, 7), mth(6, 7)] // flat
        : [mth(5, 7), mth(6, 7), mth(4, 8), mth(7, 8)] // frown
  return [...eyes, ...mouth]
}

function pipSparkle(mood: PipMood, unit: number, w: number) {
  if (mood !== 'radiant' && mood !== 'bright') return null
  const c = '#fff6cf'
  const s = (x: number, y: number) => (
    <rect key={`s${x}-${y}`} x={x * unit} y={y * unit} width={unit} height={unit} fill={c} />
  )
  return (
    <>
      {s(0, 1)} {s(w - 1, 3)} {mood === 'radiant' ? s(w - 2, 0) : null}
    </>
  )
}

export function Pip({
  mood,
  unit = 6,
  withFace = true,
}: {
  mood: PipMood
  unit?: number
  withFace?: boolean
}) {
  const w = PIP_BODY[0].length
  const h = PIP_BODY.length
  const color = MOOD_COLOR[mood]
  const bodyRects: React.ReactNode[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (PIP_BODY[y][x] === '#') {
        bodyRects.push(
          <rect key={`b${x}-${y}`} x={x * unit} y={y * unit} width={unit} height={unit} fill={color} />,
        )
      }
    }
  }
  return (
    <svg
      width={w * unit}
      height={h * unit}
      viewBox={`0 0 ${w * unit} ${h * unit}`}
      shapeRendering="crispEdges"
      style={{ opacity: mood === 'faint' ? 0.75 : 1 }}
      role="img"
      aria-label={`Pip, looking ${mood}`}
    >
      {bodyRects}
      {withFace && pipFace(mood, unit)}
      {pipSparkle(mood, unit, w)}
    </svg>
  )
}

export { MOOD_COLOR }
