import { Link } from 'react-router-dom'
import type { SeasonRecord } from '../engine/careerTypes'
import { ClubWordmark } from './ClubWordmark'

export function SeasonLedger({ seasons, compact = false }: { seasons: SeasonRecord[]; compact?: boolean }) {
  if (seasons.length === 0) return <p className="empty-copy">第一份赛季账本将在你处理关键决定后生成。</p>
  const visible = compact ? seasons.slice(-5).reverse() : [...seasons].reverse()
  return (
    <div className="season-ledger" role="table" aria-label="赛季账本">
      <div className="season-ledger__head" role="row">
        <span role="columnheader">赛季 / 俱乐部</span><span role="columnheader">出场</span><span role="columnheader">进球</span><span role="columnheader">助攻</span><span role="columnheader">OVR</span>
      </div>
      {visible.map((season) => (
        <Link to={`/season/${season.seasonYear}`} className="season-ledger__row" role="row" key={`${season.seasonYear}-${season.clubId}`}>
          <span role="cell"><strong>{season.seasonYear}/{String(season.seasonYear + 1).slice(-2)}</strong><ClubWordmark clubId={season.clubId} compact /></span>
          <span role="cell">{season.statistics.appearances}</span>
          <span role="cell">{season.statistics.goals}</span>
          <span role="cell">{season.statistics.assists}</span>
          <span role="cell">{season.overallStart} → {season.overallEnd}</span>
        </Link>
      ))}
    </div>
  )
}
