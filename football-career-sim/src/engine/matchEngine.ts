import { POSITION_FAMILIES } from '../domain/types'
import type { ClubProfile } from '../data/world/worldData'
import type { CareerPlayer, SeasonStatistics } from './careerTypes'
import { nextRandom, randomInt, type RandomState } from './random'

const ROLE_APPEARANCE_RANGES = {
  academy: [0, 6],
  prospect: [5, 20],
  rotation: [16, 34],
  starter: [29, 42],
  'key-player': [34, 46],
  captain: [34, 46],
  surplus: [0, 12],
} as const

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

function roundedRate(state: RandomState, appearances: number, rate: number) {
  const expected = appearances * rate
  const base = Math.floor(expected)
  const roll = nextRandom(state)
  return { value: base + (roll.value < expected - base ? 1 : 0), state: roll.state }
}

export function simulateSeasonStatistics(
  player: CareerPlayer,
  club: ClubProfile,
  randomState: RandomState,
): { statistics: SeasonStatistics; state: RandomState } {
  const [minimum, maximum] = ROLE_APPEARANCE_RANGES[player.clubRole]
  const availability = clamp((player.metrics.fitness - player.metrics.fatigue * 0.35) / 100, 0.35, 1)
  const appearanceRoll = randomInt(randomState, minimum, maximum)
  const appearances = Math.round(appearanceRoll.value * availability)
  const startShare = player.clubRole === 'starter' || player.clubRole === 'key-player' || player.clubRole === 'captain' ? 0.78 : player.clubRole === 'rotation' ? 0.45 : 0.2
  const starts = Math.min(appearances, Math.round(appearances * startShare))

  const family = POSITION_FAMILIES[player.primaryPosition]
  const attackingQuality = (player.attributes.finishing + player.attributes.attackingPositioning + player.attributes.composure) / 300
  const creativeQuality = (player.attributes.vision + player.attributes.shortPassing + player.attributes.dribbling) / 300
  const goalRate = family === 'forward' ? 0.18 + attackingQuality * 0.28 : family === 'wing' ? 0.08 + attackingQuality * 0.18 : family === 'midfield' ? 0.03 + attackingQuality * 0.1 : family === 'fullback' ? 0.015 : 0.02
  const assistRate = family === 'wing' || family === 'midfield' ? 0.07 + creativeQuality * 0.16 : family === 'fullback' ? 0.05 + creativeQuality * 0.1 : family === 'forward' ? 0.04 + creativeQuality * 0.08 : 0.02

  const goalResult = roundedRate(appearanceRoll.state, appearances, goalRate)
  const assistResult = roundedRate(goalResult.state, appearances, assistRate)
  const cleanSheetRate = clamp((club.strengthBaseline.rating + player.attributes.marking * 0.25) / 180, 0.16, 0.55)
  const cleanSheetResult = roundedRate(assistResult.state, appearances, cleanSheetRate)
  const finishNoise = randomInt(cleanSheetResult.state, -2, 3)
  const teamFinish = clamp(Math.round(1 + (95 - club.strengthBaseline.rating) / 4 + finishNoise.value), 1, 20)
  const trophyRoll = nextRandom(finishNoise.state)
  const trophyChance = teamFinish === 1 ? 0.72 : teamFinish <= 3 ? 0.2 : 0.04
  const trophyCount = trophyRoll.value < trophyChance ? 1 : 0
  const ratingRoll = nextRandom(trophyRoll.state)
  const rolePenalty = player.clubRole === 'surplus' || player.clubRole === 'academy' ? -0.25 : 0
  const averageRating = clamp(
    5.7 + (player.overall - 55) / 30 + (player.metrics.form - 50) / 120 + rolePenalty + (ratingRoll.value - 0.5) * 0.5,
    5.4,
    8.4,
  )

  return {
    statistics: {
      appearances,
      starts,
      goals: goalResult.value,
      assists: assistResult.value,
      cleanSheets: cleanSheetResult.value,
      averageRating: Number(averageRating.toFixed(2)),
      teamFinish,
      trophyCount,
    },
    state: ratingRoll.state,
  }
}

