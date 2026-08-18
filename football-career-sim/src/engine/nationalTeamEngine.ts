import { POSITION_FAMILIES } from '../domain/types'
import type { CareerPlayer, NationalTeamCareer, SeasonStatistics } from './careerTypes'
import { nextRandom, randomInt, type RandomState } from './random'

const CALL_UP_THRESHOLDS: Record<string, number> = {
  ENG: 80,
  ESP: 81,
  GER: 80,
  ITA: 80,
  FRA: 82,
  POR: 78,
  NED: 78,
  BEL: 77,
  CHN: 67,
  JPN: 72,
  KOR: 72,
  KSA: 70,
  BRA: 82,
  ARG: 81,
  USA: 72,
}

export function simulateNationalTeamSeason(
  player: CareerPlayer,
  statistics: SeasonStatistics,
  randomState: RandomState,
): { nationalTeam: NationalTeamCareer; newCaps: number; state: RandomState } {
  const current = player.nationalTeam
  const associationId = current.committedAssociationId
  if (!associationId || player.age < 18 || current.status === 'retired') {
    return { nationalTeam: current, newCaps: 0, state: randomState }
  }

  const threshold = CALL_UP_THRESHOLDS[associationId] ?? 74
  const minutesSignal = Math.min(6, statistics.starts / 6)
  const formSignal = (statistics.averageRating - 6.2) * 4
  const selectionScore = player.overall + minutesSignal + formSignal
  const roll = nextRandom(randomState)
  const selected = selectionScore >= threshold - 4 + roll.value * 8
  if (!selected) {
    const status = current.caps > 0 ? 'fringe' : player.age <= 21 ? 'youth' : 'eligible'
    return { nationalTeam: { ...current, status }, newCaps: 0, state: roll.state }
  }

  const capRoll = randomInt(roll.state, 1, player.overall >= threshold + 6 ? 8 : 5)
  const family = POSITION_FAMILIES[player.primaryPosition]
  const scoringRate = family === 'forward' ? 0.34 : family === 'wing' ? 0.19 : family === 'midfield' ? 0.1 : 0.03
  const goalRoll = nextRandom(capRoll.state)
  const goals = Math.floor(capRoll.value * scoringRate + goalRoll.value)
  const tournamentRoll = nextRandom(goalRoll.state)
  const tournamentAppearance = player.age >= 20 && tournamentRoll.value < 0.24 ? 1 : 0
  const status = player.overall >= threshold + 4 ? 'starter' : 'called-up'

  return {
    nationalTeam: {
      ...current,
      status,
      caps: current.caps + capRoll.value,
      goals: current.goals + goals,
      tournamentAppearances: current.tournamentAppearances + tournamentAppearance,
    },
    newCaps: capRoll.value,
    state: tournamentRoll.state,
  }
}
