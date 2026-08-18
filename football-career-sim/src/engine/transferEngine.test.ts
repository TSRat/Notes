import { describe, expect, it } from 'vitest'
import { getAssociation, getWorldClub } from '../data/world/worldData'
import { createCareer } from './careerEngine'
import { createRandomState } from './random'
import { generateStartingClubOffers, generateTransferOffers } from './transferEngine'

describe('transfer engine', () => {
  it('offers three domestic academy starts when the ecosystem is available', () => {
    const result = generateStartingClubOffers('ESP', createRandomState('academy-spain'))
    expect(result.clubIds).toHaveLength(3)
    result.clubIds.forEach((clubId) => expect(getWorldClub(clubId)?.countryId).toBe('ESP'))
  })

  it('creates role, fit and cross-confederation facts instead of guaranteed starts', () => {
    const career = createCareer({
      seed: 'transfer-world', name: '周野', primaryNationality: 'CHN', birthplace: '上海', dominantFoot: 'left', primaryPosition: 'RW', trait: 'late-bloomer', difficulty: 'standard', startingClubId: 'shanghai-shenhua',
    })
    const result = generateTransferOffers(career, career.rng)
    const currentConfederation = getAssociation(getWorldClub(career.player.currentClubId)?.countryId ?? '')?.confederation
    expect(result.offers).toHaveLength(3)
    expect(result.offers.some((offer) => getAssociation(getWorldClub(offer.clubId)?.countryId ?? '')?.confederation !== currentConfederation)).toBe(true)
    result.offers.forEach((offer) => {
      expect(offer.knownFacts.some((fact) => fact.includes('预计角色'))).toBe(true)
      expect(offer.knownFacts.join(' ')).not.toContain('保证首发')
    })
  })
})

