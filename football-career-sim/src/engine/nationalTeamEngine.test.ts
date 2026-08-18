import { describe, expect, it } from 'vitest'
import { createCareer } from './careerEngine'
import { simulateNationalTeamSeason } from './nationalTeamEngine'

describe('national team engine', () => {
  it('uses minutes, form and positional level without making call-ups automatic', () => {
    const career = createCareer({
      seed: 'national-team', name: '韩松', primaryNationality: 'KOR', birthplace: '首尔', dominantFoot: 'right', primaryPosition: 'ST', trait: 'gifted', difficulty: 'standard', startingClubId: 'fc-seoul',
    })
    const player = {
      ...career.player,
      age: 24,
      overall: 82,
      nationalTeam: { ...career.player.nationalTeam, committedAssociationId: 'KOR' },
    }
    const statistics = { appearances: 36, starts: 31, goals: 18, assists: 7, cleanSheets: 0, averageRating: 7.25, teamFinish: 2, trophyCount: 0 }
    const selected = simulateNationalTeamSeason(player, statistics, career.rng)
    const replay = simulateNationalTeamSeason(player, statistics, career.rng)
    expect(selected).toEqual(replay)
    expect(selected.newCaps).toBeGreaterThan(0)
    expect(['called-up', 'starter']).toContain(selected.nationalTeam.status)
  })
})
