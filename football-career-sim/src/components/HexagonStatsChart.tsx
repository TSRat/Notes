import type { PlayerState, StatKey } from '../app/types'

const stats: Array<{ key: StatKey; label: string; angle: number }> = [
  { key: 'stamina', label: '体力', angle: -90 },
  { key: 'technique', label: '技术', angle: -30 },
  { key: 'tactics', label: '战术', angle: 30 },
  { key: 'composure', label: '心理', angle: 90 },
  { key: 'wellbeing', label: '身心', angle: 150 },
  { key: 'reputation', label: '声望', angle: 210 },
]

function polarPoint(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180
  return `${100 + Math.cos(radians) * radius},${100 + Math.sin(radians) * radius}`
}

export function HexagonStatsChart({ player }: { player: PlayerState }) {
  const valuePoints = stats
    .map(({ key, angle }) => polarPoint(angle, 22 + (player[key] / 100) * 58))
    .join(' ')
  const guidePoints = stats.map(({ angle }) => polarPoint(angle, 80)).join(' ')

  return (
    <div className="stats-chart">
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`球员属性：体力 ${player.stamina}，技术 ${player.technique}，战术理解 ${player.tactics}，心理稳定 ${player.composure}，身心状态 ${player.wellbeing}，公众声望 ${player.reputation}`}
      >
        <polygon className="stats-chart__guide" points={guidePoints} />
        <polygon className="stats-chart__guide stats-chart__guide--inner" points={stats.map(({ angle }) => polarPoint(angle, 48)).join(' ')} />
        {stats.map(({ angle }) => (
          <line key={angle} className="stats-chart__axis" x1="100" y1="100" x2={polarPoint(angle, 80).split(',')[0]} y2={polarPoint(angle, 80).split(',')[1]} />
        ))}
        <polygon className="stats-chart__value" points={valuePoints} />
        {stats.map(({ key, angle }) => {
          const [cx, cy] = polarPoint(angle, 22 + (player[key] / 100) * 58).split(',')
          return <circle key={key} className="stats-chart__point" cx={cx} cy={cy} r="4" />
        })}
      </svg>

      <dl className="stats-list">
        {stats.map(({ key, label }) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{player[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
