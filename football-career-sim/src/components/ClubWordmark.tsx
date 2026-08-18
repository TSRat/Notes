import { getCompetition, getWorldClub } from '../data/world/worldData'
import { getClubThemeStyle } from './clubTheme'

export function ClubWordmark({ clubId, compact = false }: { clubId: string; compact?: boolean }) {
  const club = getWorldClub(clubId)
  if (!club) return <span className="club-wordmark club-wordmark--missing">未知俱乐部</span>
  const competition = getCompetition(club.competitionId)

  return (
    <span className={`club-wordmark${compact ? ' club-wordmark--compact' : ''}`} style={getClubThemeStyle(club)}>
      <span className="club-wordmark__code" aria-hidden="true">{club.monogram}</span>
      <span className="club-wordmark__copy">
        <strong>{club.zhName}</strong>
        <small>{club.city} · {competition?.zhName}</small>
      </span>
    </span>
  )
}
