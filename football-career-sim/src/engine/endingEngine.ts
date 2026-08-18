import { endingDefinitions } from '../data/world/worldData'
import type { CareerEnding, EndingDimensions, SimCareer } from './careerTypes'

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function calculateEndingDimensions(career: SimCareer): EndingDimensions {
  const appearances = career.seasonRecords.reduce((sum, season) => sum + season.statistics.appearances, 0)
  const trophies = career.seasonRecords.reduce((sum, season) => sum + season.statistics.trophyCount, 0)
  const longestClubSpell = career.clubHistory.reduce((longest, entry) => {
    const seasons = (entry.toSeason ?? career.seasonYear) - entry.fromSeason + 1
    return Math.max(longest, seasons)
  }, 0)
  const mostAppearancesAtAClub = career.clubHistory.reduce((highest, entry) => Math.max(highest, entry.appearances), 0)
  const majorAchievements = career.unlockedAchievementIds.length

  return {
    sporting: clamp((career.player.peakOverall - 50) * 2.1 + trophies * 5 + Math.min(12, majorAchievements)),
    longevity: clamp((career.player.age - 16) * 4.3 + Math.min(12, appearances / 35)),
    clubLegacy: clamp(
      career.player.metrics.belonging * 0.25
      + career.player.metrics.leadership * 0.15
      + Math.min(35, longestClubSpell * 2.5)
      + Math.min(20, mostAppearancesAtAClub / 15),
    ),
    nationalLegacy: clamp(career.player.nationalTeam.caps * 1.35 + career.player.nationalTeam.tournamentAppearances * 12 + career.player.nationalTeam.goals * 1.5),
    life: clamp(career.player.metrics.wellbeing * 0.55 + career.player.metrics.financialSecurity * 0.2 + career.player.metrics.belonging * 0.2 + majorAchievements),
  }
}

function qualifies(dimensions: EndingDimensions, thresholds: EndingDimensions) {
  return (Object.keys(thresholds) as Array<keyof EndingDimensions>).every((key) => dimensions[key] >= thresholds[key])
}

function narrativeCondition(endingId: string, career: SimCareer) {
  const clubCount = new Set(career.clubHistory.map((entry) => entry.clubId)).size
  if (endingId === 'era-legend') return career.player.peakOverall >= 90
  if (endingId === 'world-star') return career.player.peakOverall >= 85
  if (endingId === 'one-club-legend') return clubCount === 1
  if (endingId === 'national-hero') return career.player.nationalTeam.tournamentAppearances > 0
  if (endingId === 'promotion-hero') return Boolean(career.flags.promotionHero || career.flags.stayedAfterRelegation)
  if (endingId === 'journeyman-home') return clubCount >= 3
  if (endingId === 'injury-return') return Boolean(career.flags.injuryPositionRebuild)
  if (endingId === 'mentor') return career.player.metrics.leadership >= 75
  return true
}

export function createCareerEnding(career: SimCareer): CareerEnding {
  const dimensions = calculateEndingDimensions(career)
  const candidates = endingDefinitions
    .filter((ending) => qualifies(dimensions, ending.thresholds) && narrativeCondition(ending.id, career))
    .sort((a, b) => Object.values(b.thresholds).reduce((sum, value) => sum + value, 0) - Object.values(a.thresholds).reduce((sum, value) => sum + value, 0))
  const selected = candidates[0] ?? endingDefinitions.find((ending) => ending.id === 'what-might-have-been') ?? endingDefinitions[endingDefinitions.length - 1]
  const fulfilmentScore = dimensions.sporting * 0.32
    + dimensions.longevity * 0.14
    + dimensions.clubLegacy * 0.2
    + dimensions.nationalLegacy * 0.12
    + dimensions.life * 0.22
  const isGoodEnding = fulfilmentScore >= 75.5
    || dimensions.sporting >= 90
    || dimensions.clubLegacy >= 90
    || dimensions.nationalLegacy >= 90
    || dimensions.life >= 90
  const clubCount = new Set(career.clubHistory.map((entry) => entry.clubId)).size
  const biography = `${career.player.name}在 ${career.player.age} 岁结束职业生涯，最高 OVR ${career.player.peakOverall}，代表 ${clubCount} 家俱乐部出场，并留下 ${career.player.nationalTeam.caps} 次国家队经历。`

  return { endingId: selected.id, title: selected.title, dimensions, isGoodEnding, biography }
}
