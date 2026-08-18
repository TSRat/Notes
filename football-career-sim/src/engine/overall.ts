import { clampRating, type AttributeKey, type PlayerAttributes, type PlayerPosition, type PositionRating } from '../domain/types'

type AttributeWeights = Partial<Record<AttributeKey, number>>

const POSITION_WEIGHTS: Record<PlayerPosition, AttributeWeights> = {
  GK: { goalkeeping: 0.5, anticipation: 0.14, composure: 0.1, decisions: 0.1, longPassing: 0.06, aerial: 0.06, strength: 0.04 },
  RB: { pace: 0.15, acceleration: 0.1, stamina: 0.13, tackling: 0.13, marking: 0.1, shortPassing: 0.09, longPassing: 0.08, ballControl: 0.07, anticipation: 0.08, decisions: 0.07 },
  RWB: { pace: 0.16, acceleration: 0.11, stamina: 0.15, dribbling: 0.1, shortPassing: 0.09, longPassing: 0.08, tackling: 0.08, ballControl: 0.08, anticipation: 0.07, decisions: 0.08 },
  CB: { marking: 0.17, tackling: 0.16, aerial: 0.15, strength: 0.12, anticipation: 0.15, decisions: 0.1, composure: 0.08, shortPassing: 0.04, pace: 0.03 },
  LB: { pace: 0.15, acceleration: 0.1, stamina: 0.13, tackling: 0.13, marking: 0.1, shortPassing: 0.09, longPassing: 0.08, ballControl: 0.07, anticipation: 0.08, decisions: 0.07 },
  LWB: { pace: 0.16, acceleration: 0.11, stamina: 0.15, dribbling: 0.1, shortPassing: 0.09, longPassing: 0.08, tackling: 0.08, ballControl: 0.08, anticipation: 0.07, decisions: 0.08 },
  DM: { anticipation: 0.14, decisions: 0.13, tackling: 0.13, marking: 0.1, shortPassing: 0.12, longPassing: 0.1, composure: 0.09, stamina: 0.09, strength: 0.05, ballControl: 0.05 },
  CM: { shortPassing: 0.15, vision: 0.13, decisions: 0.12, ballControl: 0.11, stamina: 0.1, longPassing: 0.1, composure: 0.09, anticipation: 0.08, agility: 0.06, tackling: 0.06 },
  AM: { vision: 0.16, ballControl: 0.13, shortPassing: 0.12, dribbling: 0.11, decisions: 0.1, composure: 0.09, attackingPositioning: 0.1, acceleration: 0.07, finishing: 0.07, agility: 0.05 },
  RW: { acceleration: 0.14, pace: 0.13, dribbling: 0.15, ballControl: 0.11, attackingPositioning: 0.1, finishing: 0.09, vision: 0.07, shortPassing: 0.07, agility: 0.08, composure: 0.06 },
  LW: { acceleration: 0.14, pace: 0.13, dribbling: 0.15, ballControl: 0.11, attackingPositioning: 0.1, finishing: 0.09, vision: 0.07, shortPassing: 0.07, agility: 0.08, composure: 0.06 },
  ST: { finishing: 0.2, attackingPositioning: 0.17, composure: 0.11, acceleration: 0.09, pace: 0.08, strength: 0.08, aerial: 0.08, ballControl: 0.07, shotPower: 0.07, anticipation: 0.05 },
}

function normalizedAttribute(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.min(99, value))
}

export function calculateOverall(attributes: PlayerAttributes, position: PlayerPosition) {
  const weights = POSITION_WEIGHTS[position]
  const weightedValue = Object.entries(weights).reduce((sum, [attribute, weight]) => {
    return sum + normalizedAttribute(attributes[attribute as AttributeKey]) * weight
  }, 0)
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  return clampRating(weightedValue / totalWeight)
}

export function getPositionAttributeKeys(position: PlayerPosition) {
  return Object.keys(POSITION_WEIGHTS[position]) as AttributeKey[]
}

export function calculatePositionRatings(
  attributes: PlayerAttributes,
  positions: readonly PlayerPosition[],
): PositionRating[] {
  return [...new Set(positions)].map((position) => ({ position, overall: calculateOverall(attributes, position) }))
}

export function overallBand(overall: number) {
  const rating = clampRating(overall)
  if (rating <= 54) return 'academy'
  if (rating <= 64) return 'lower-league'
  if (rating <= 72) return 'professional'
  if (rating <= 79) return 'top-flight-starter'
  if (rating <= 84) return 'league-star'
  if (rating <= 89) return 'world-class'
  if (rating <= 93) return 'ballon-level'
  return 'era-legend'
}
