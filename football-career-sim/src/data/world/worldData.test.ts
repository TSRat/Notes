import { describe, expect, it } from 'vitest'
import {
  achievementDefinitions,
  associations,
  competitions,
  endingDefinitions,
  eventTemplates,
  getClubsForCompetition,
  getWorldClub,
  worldClubs,
  worldSources,
} from './worldData'

function expectUniqueIds(records: readonly { id: string }[]) {
  expect(new Set(records.map((record) => record.id)).size).toBe(records.length)
}

describe('real-world content contracts', () => {
  it('covers the approved 15 league ecosystems with a playable first club network', () => {
    expect(competitions).toHaveLength(15)
    expect(associations).toHaveLength(15)
    expect(worldClubs.length).toBeGreaterThanOrEqual(60)

    for (const competition of competitions) {
      expect(getClubsForCompetition(competition.id).length).toBeGreaterThanOrEqual(4)
    }
  })

  it('keeps every entity uniquely addressable and linked', () => {
    expectUniqueIds(competitions)
    expectUniqueIds(associations)
    expectUniqueIds(worldClubs)
    expectUniqueIds(worldSources)
    expectUniqueIds(eventTemplates)
    expectUniqueIds(achievementDefinitions)
    expectUniqueIds(endingDefinitions)

    const competitionIds = new Set(competitions.map((competition) => competition.id))
    const associationIds = new Set(associations.map((association) => association.id))
    const sourceIds = new Set(worldSources.map((source) => source.id))

    for (const competition of competitions) {
      expect(associationIds.has(competition.countryId)).toBe(true)
      competition.sourceRefs.forEach((sourceId) => expect(sourceIds.has(sourceId)).toBe(true))
    }
    for (const club of worldClubs) {
      expect(competitionIds.has(club.competitionId)).toBe(true)
      expect(associationIds.has(club.countryId)).toBe(true)
      club.sourceRefs.forEach((sourceId) => expect(sourceIds.has(sourceId)).toBe(true))
      expect(getWorldClub(club.id)).toEqual(club)
    }
  })

  it('marks dynamic facts, confidence and branding rights explicitly', () => {
    for (const club of worldClubs) {
      expect(club.strengthBaseline.asOf).toBe('2026-08-19')
      expect(club.strengthBaseline.basis).toBe('editorial-simulation-baseline')
      expect(club.strengthBaseline.rating).toBeGreaterThanOrEqual(1)
      expect(club.strengthBaseline.rating).toBeLessThanOrEqual(99)
      expect(club.brandingMode).toBe('text-and-color')
      expect(club.rightsStatus).toBe('name-and-color-review')
      expect(['high', 'medium', 'low']).toContain(club.confidence)
      expect(club.identityTags.length).toBeGreaterThanOrEqual(3)
      expect(club.traditionalColors.primary).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })

  it('routes club identity through topic-specific references', () => {
    expect(getWorldClub('fc-barcelona')?.sourceRefs).toContain('book-barcelona-legacy')
    expect(getWorldClub('real-madrid')?.sourceRefs).toContain('book-real-madrid-revolution')
    expect(getWorldClub('borussia-dortmund')?.sourceRefs).toContain('book-yellow-wall')
    expect(getWorldClub('bayern-munich')?.sourceRefs).toContain('book-bayern-superclub')
  })

  it('keeps choices playable and reserves real-time pressure for urgent scenes', () => {
    expect(eventTemplates.length).toBeGreaterThanOrEqual(36)
    const stages = new Set(eventTemplates.map((event) => event.stage))
    expect(stages).toEqual(new Set(['academy', 'breakthrough', 'established', 'prime', 'turning-point', 'legacy']))

    for (const event of eventTemplates) {
      expect(event.summary.length).toBeGreaterThan(20)
      expect(event.choices.length).toBeGreaterThanOrEqual(3)
      expect(event.choices.length).toBeLessThanOrEqual(4)
      expect(event.ageRange[0]).toBeLessThanOrEqual(event.ageRange[1])
      if (event.timedSeconds !== null) {
        expect(['match', 'medical']).toContain(event.kind)
        expect(event.timedSeconds).toBeGreaterThanOrEqual(5)
        expect(event.timedSeconds).toBeLessThanOrEqual(15)
      }
    }
  })

  it('ships all four achievement families and multidimensional endings', () => {
    expect(new Set(achievementDefinitions.map((achievement) => achievement.category))).toEqual(
      new Set(['milestone', 'career', 'match', 'life']),
    )
    expect(achievementDefinitions.some((achievement) => achievement.hidden)).toBe(true)
    expect(achievementDefinitions.some((achievement) => !achievement.hidden)).toBe(true)

    for (const ending of endingDefinitions) {
      expect(Object.keys(ending.thresholds).sort()).toEqual(
        ['clubLegacy', 'life', 'longevity', 'nationalLegacy', 'sporting'].sort(),
      )
    }
  })
})
