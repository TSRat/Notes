import { describe, expect, it } from 'vitest'
import { associations, worldClubs } from '../data/world/worldData'
import { PLAYER_POSITIONS } from '../domain/types'
import { autoplayCareer, createCareer } from './careerEngine'
import type { CareerTrait } from './careerTypes'

function traitFor(index: number): CareerTrait {
  if (index % 10 === 0) return 'gifted'
  if (index % 5 === 1) return 'late-bloomer'
  if (index % 5 === 2) return 'street-football'
  if (index % 5 === 3) return 'coach-child'
  return 'dual-heritage'
}

describe('career balance simulation', () => {
  it('keeps good lives common and stardom meaningfully rare in standard mode', () => {
    const total = 300
    let goodEndings = 0
    let stars = 0
    let legends = 0
    let generationalPotentials = 0
    let fulfilledGenerationalPotentials = 0
    const sportingValues: number[] = []
    const clubValues: number[] = []
    const lifeValues: number[] = []

    for (let index = 0; index < total; index += 1) {
      const association = associations[index % associations.length]
      const startingClub = worldClubs.find((club) => club.countryId === association.id) ?? worldClubs[0]
      const career = createCareer({
        seed: `balance-${index}`,
        name: `球员${index}`,
        primaryNationality: association.id,
        secondaryNationality: index % 4 === 0 ? associations[(index + 3) % associations.length].id : undefined,
        birthplace: startingClub.city,
        dominantFoot: index % 3 === 0 ? 'left' : 'right',
        primaryPosition: PLAYER_POSITIONS[index % PLAYER_POSITIONS.length],
        trait: traitFor(index),
        difficulty: 'standard',
        startingClubId: startingClub.id,
      })
      const complete = autoplayCareer(career, (current) => {
        const event = current.pendingEvents[0]
        if (!event) return ''
        const choiceIndex = (index + current.resolvedEventInstanceIds.length) % event.choices.length
        return event.choices[choiceIndex].id
      })

      if (complete.ending?.isGoodEnding) goodEndings += 1
      if (complete.player.peakOverall >= 80) stars += 1
      if (complete.player.peakOverall >= 90 || complete.ending?.endingId === 'era-legend') legends += 1
      if (career.player.potential >= 90) generationalPotentials += 1
      if (career.player.potential >= 90 && complete.player.peakOverall >= 90) fulfilledGenerationalPotentials += 1
      sportingValues.push(complete.ending?.dimensions.sporting ?? 0)
      clubValues.push(complete.ending?.dimensions.clubLegacy ?? 0)
      lifeValues.push(complete.ending?.dimensions.life ?? 0)
    }

    const summary = {
      goodEndingRate: goodEndings / total,
      starRate: stars / total,
      legendRate: legends / total,
      generationalPotentials,
      fulfilledGenerationalPotentials,
      sportingRange: [Math.min(...sportingValues), Math.max(...sportingValues)],
      clubRange: [Math.min(...clubValues), Math.max(...clubValues)],
      lifeRange: [Math.min(...lifeValues), Math.max(...lifeValues)],
    }
    expect(summary.goodEndingRate, JSON.stringify(summary)).toBeGreaterThanOrEqual(0.55)
    expect(summary.goodEndingRate, JSON.stringify(summary)).toBeLessThanOrEqual(0.65)
    expect(summary.starRate, JSON.stringify(summary)).toBeGreaterThanOrEqual(0.1)
    expect(summary.starRate, JSON.stringify(summary)).toBeLessThanOrEqual(0.15)
    expect(summary.legendRate, JSON.stringify(summary)).toBeGreaterThanOrEqual(0.02)
    expect(summary.legendRate, JSON.stringify(summary)).toBeLessThanOrEqual(0.04)
  })
})
