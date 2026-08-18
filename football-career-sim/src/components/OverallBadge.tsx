import { overallBand } from '../engine/overall'

const BAND_LABELS: Record<ReturnType<typeof overallBand>, string> = {
  academy: '青训阶段',
  'lower-league': '职业门槛',
  professional: '职业球员',
  'top-flight-starter': '顶级联赛主力',
  'league-star': '联赛球星',
  'world-class': '世界级',
  'ballon-level': '金球级',
  'era-legend': '时代传奇',
}

export function OverallBadge({ overall, compact = false }: { overall: number; compact?: boolean }) {
  return (
    <span className={`overall-badge${compact ? ' overall-badge--compact' : ''}`} aria-label={`综合能力 ${overall}，${BAND_LABELS[overallBand(overall)]}`}>
      <span>OVR</span>
      <strong>{overall}</strong>
      {!compact ? <small>{BAND_LABELS[overallBand(overall)]}</small> : null}
    </span>
  )
}
