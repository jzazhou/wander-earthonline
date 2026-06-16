import { useMemo } from 'react'
import { mulberry32 } from '../lib/rng'

/** A cheap, deterministic field of twinkling stars behind everything. */
export default function Starfield({ count = 70 }: { count?: number }) {
  const stars = useMemo(() => {
    const rng = mulberry32(8675309)
    return Array.from({ length: count }, () => ({
      left: rng() * 100,
      top: rng() * 100,
      dur: 2.5 + rng() * 4,
      delay: rng() * 5,
      size: rng() < 0.15 ? 3 : rng() < 0.5 ? 2 : 1,
    }))
  }, [count])

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s, i) => (
        <i
          key={i}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            ['--dur' as string]: `${s.dur}s`,
            ['--delay' as string]: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
