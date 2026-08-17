import { getClub } from '../data/db'

export function ClubMark({ clubId, compact = false }: { clubId: string; compact?: boolean }) {
  const club = getClub(clubId)

  return (
    <div className={`club-mark ${compact ? 'club-mark--compact' : ''}`} aria-label={club.name}>
      <span className="club-mark__monogram" aria-hidden="true">{club.monogram}</span>
      {!compact ? (
        <span className="club-mark__name">
          <strong>{club.name}</strong>
          <small>{club.league}</small>
        </span>
      ) : null}
    </div>
  )
}
