import { achievementDefinitions } from '../data/world/worldData'
import type { SeasonRecord, SimCareer } from './careerTypes'

function totalAppearances(career: SimCareer, latest?: SeasonRecord) {
  return career.seasonRecords.reduce((sum, season) => sum + season.statistics.appearances, 0)
    + (latest?.statistics.appearances ?? 0)
}

function totalTrophies(career: SimCareer, latest?: SeasonRecord) {
  return career.seasonRecords.reduce((sum, season) => sum + season.statistics.trophyCount, 0)
    + (latest?.statistics.trophyCount ?? 0)
}

function conditionMet(conditionKey: string, career: SimCareer, latest?: SeasonRecord) {
  switch (conditionKey) {
    case 'first_start':
      return Boolean(latest && latest.statistics.starts > 0)
    case 'appearances_100':
      return totalAppearances(career, latest) >= 100
    case 'first_cap':
      return career.player.nationalTeam.caps > 0
    case 'first_trophy':
      return totalTrophies(career, latest) > 0
    case 'one_club_career':
      return career.status === 'retired' && new Set(career.clubHistory.map((entry) => entry.clubId)).size === 1
    case 'loan_return_starter':
      return career.clubHistory.some((entry) => entry.isLoan) && ['starter', 'key-player', 'captain'].includes(career.player.clubRole)
    case 'return_first_club':
      return career.clubHistory.length > 1 && career.clubHistory[0].clubId === career.player.currentClubId
    case 'three_continents':
      return Number(career.flags.continentsPlayed ?? 0) >= 3
    case 'dual_nation_choice':
      return Boolean(career.flags.dualNationChoice)
    case 'injury_position_rebuild':
      return Boolean(career.flags.injuryPositionRebuild)
    case 'stayed_after_relegation':
      return Boolean(career.flags.stayedAfterRelegation)
    case 'declined_superclub_stayed':
      return Boolean(career.flags.declinedSuperclub)
    case 'good_ending_no_superclub':
      return career.status === 'retired' && Boolean(career.ending?.isGoodEnding) && !career.flags.joinedSuperclub
    case 'complete_life_below_world_class':
      return career.status === 'retired' && (career.ending?.dimensions.life ?? 0) >= 80 && career.player.peakOverall < 85
    case 'promotion_key_player':
      return Boolean(career.flags.promotionHero)
    case 'sub_changed_career':
      return Boolean(career.flags.subChangedCareer)
    case 'decisive_penalty':
      return Boolean(career.flags.decisivePenalty)
    case 'structure_player':
      return Boolean(career.flags.structurePlayer)
    case 'rivalry_impact':
      return Number(career.flags.rivalryImpact ?? 0) >= 2
    case 'recovered_from_error':
      return Boolean(career.flags.recoveredFromError)
    case 'captain_in_crisis':
      return Boolean(career.flags.captainInCrisis)
    case 'farewell_start':
      return Boolean(career.flags.farewellStart)
    case 'independent_transfer_choices':
      return Number(career.flags.independentTransfers ?? 0) >= 3
    case 'released_then_starred':
      return Boolean(career.flags.released) && career.player.peakOverall >= 80
    default:
      return false
  }
}

export function findNewAchievements(career: SimCareer, latest?: SeasonRecord) {
  return achievementDefinitions
    .filter((achievement) => !career.unlockedAchievementIds.includes(achievement.id))
    .filter((achievement) => conditionMet(achievement.conditionKey, career, latest))
    .map((achievement) => achievement.id)
}
