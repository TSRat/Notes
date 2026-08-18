import { describe, expect, it } from 'vitest'
import type { PlayerAttributes } from '../domain/types'
import { calculateOverall, calculatePositionRatings, overallBand } from './overall'

const balanced: PlayerAttributes = {
  acceleration: 70,
  pace: 70,
  stamina: 70,
  strength: 70,
  agility: 70,
  ballControl: 70,
  dribbling: 70,
  shortPassing: 70,
  longPassing: 70,
  vision: 70,
  finishing: 70,
  shotPower: 70,
  attackingPositioning: 70,
  tackling: 70,
  marking: 70,
  aerial: 70,
  anticipation: 70,
  composure: 70,
  decisions: 70,
  goalkeeping: 70,
}

describe('position-weighted overall', () => {
  it('keeps a balanced player stable across positions', () => {
    expect(calculateOverall(balanced, 'GK')).toBe(70)
    expect(calculateOverall(balanced, 'CB')).toBe(70)
    expect(calculateOverall(balanced, 'CM')).toBe(70)
    expect(calculateOverall(balanced, 'RW')).toBe(70)
    expect(calculateOverall(balanced, 'ST')).toBe(70)
  })

  it('values the attributes relevant to each position', () => {
    const specialist = {
      ...balanced,
      goalkeeping: 92,
      finishing: 42,
      attackingPositioning: 44,
      dribbling: 45,
    }
    expect(calculateOverall(specialist, 'GK')).toBeGreaterThan(calculateOverall(specialist, 'ST'))
    expect(calculateOverall(specialist, 'GK')).toBeGreaterThan(calculateOverall(specialist, 'RW'))
  })

  it('returns unique primary and secondary position ratings', () => {
    expect(calculatePositionRatings(balanced, ['CM', 'DM', 'CM'])).toEqual([
      { position: 'CM', overall: 70 },
      { position: 'DM', overall: 70 },
    ])
  })

  it('clamps malformed attribute values into the public 1-99 range', () => {
    const malformed = { ...balanced, finishing: 200, attackingPositioning: Number.NaN }
    const rating = calculateOverall(malformed, 'ST')
    expect(rating).toBeGreaterThanOrEqual(1)
    expect(rating).toBeLessThanOrEqual(99)
  })

  it('maps the approved OVR bands', () => {
    expect(overallBand(50)).toBe('academy')
    expect(overallBand(60)).toBe('lower-league')
    expect(overallBand(70)).toBe('professional')
    expect(overallBand(78)).toBe('top-flight-starter')
    expect(overallBand(83)).toBe('league-star')
    expect(overallBand(88)).toBe('world-class')
    expect(overallBand(92)).toBe('ballon-level')
    expect(overallBand(96)).toBe('era-legend')
  })
})
