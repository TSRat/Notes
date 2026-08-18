import { describe, expect, it } from 'vitest'
import { getWorldClub } from '../data/world/worldData'
import { createCareer } from './careerEngine'
import { simulateSeasonStatistics } from './matchEngine'

describe('season match simulation', () => {
  it('is deterministic and produces position-aware statistics', () => {
    const winger = createCareer({
      seed: 'match-season', name: '苏原', primaryNationality: 'CHN', birthplace: '成都', dominantFoot: 'left', primaryPosition: 'RW', trait: 'gifted', difficulty: 'standard', startingClubId: 'shanghai-port',
    })
    const defender = { ...winger.player, primaryPosition: 'CB' as const, attributes: { ...winger.player.attributes, finishing: 35, marking: 78, tackling: 80 } }
    const club = getWorldClub(winger.player.currentClubId)
    expect(club).toBeDefined()
    if (!club) return

    const first = simulateSeasonStatistics({ ...winger.player, clubRole: 'starter' }, club, winger.rng)
    const replay = simulateSeasonStatistics({ ...winger.player, clubRole: 'starter' }, club, winger.rng)
    const defensive = simulateSeasonStatistics({ ...defender, clubRole: 'starter' }, club, winger.rng)
    expect(first).toEqual(replay)
    expect(first.statistics.appearances).toBeGreaterThan(0)
    expect(first.statistics.averageRating).toBeGreaterThanOrEqual(5.4)
    expect(first.statistics.goals).toBeGreaterThanOrEqual(defensive.statistics.goals)
  })
})

