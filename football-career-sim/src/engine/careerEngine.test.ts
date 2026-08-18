import { describe, expect, it } from 'vitest'
import type { CreateCareerInput, SimCareer } from './careerTypes'
import { advanceCareerSeason, autoplayCareer, createCareer, resolveCareerEvent } from './careerEngine'

const input: CreateCareerInput = {
  seed: 'zhou-journey-01',
  name: '周野',
  primaryNationality: 'CHN',
  secondaryNationality: 'ESP',
  birthplace: '上海',
  dominantFoot: 'left',
  primaryPosition: 'RW',
  secondaryPositions: ['AM'],
  trait: 'late-bloomer',
  difficulty: 'standard',
  startingClubId: 'shanghai-shenhua',
  childhoodClubId: 'fc-barcelona',
}

function firstChoice(career: SimCareer) {
  return career.pendingEvents[0]?.choices[0]?.id ?? ''
}

describe('career engine', () => {
  it('creates the same playable career from the same seed', () => {
    const first = createCareer(input)
    const second = createCareer(input)
    expect(first).toEqual(second)
    expect(first.player.overall).toBeGreaterThanOrEqual(40)
    expect(first.player.overall).toBeLessThanOrEqual(75)
    expect(first.pendingEvents.length).toBeGreaterThan(0)
    expect(first.player.nationalTeam.eligibleAssociationIds).toEqual(['CHN', 'ESP'])
  })

  it('records one uncertain result and refuses to apply it twice', () => {
    const career = createCareer(input)
    const event = career.pendingEvents[0]
    const result = resolveCareerEvent(career, event.instanceId, event.choices[0].id)
    const repeated = resolveCareerEvent(result.career, event.instanceId, event.choices[0].id)

    expect(result.career.resolvedEventInstanceIds).toContain(event.instanceId)
    expect(result.career.timeline.at(-1)?.type).toBe('decision')
    expect(repeated.career).toEqual(result.career)
  })

  it('does not skip unresolved key decisions when advancing a season', () => {
    const career = createCareer(input)
    const result = advanceCareerSeason(career)
    expect(result.career).toEqual(career)
    expect(result.notices[0].title).toContain('关键决定')
  })

  it('plays a deterministic full life through retirement', () => {
    const first = autoplayCareer(createCareer(input), firstChoice)
    const second = autoplayCareer(createCareer(input), firstChoice)
    const decisions = first.timeline.filter((entry) => entry.type === 'decision')
    const keyMatches = decisions.filter((entry) => ['debut-last-ten', 'title-decider'].includes(entry.sourceEventId ?? ''))

    expect(first).toEqual(second)
    expect(first.status).toBe('retired')
    expect(first.ending).toBeDefined()
    expect(first.player.age).toBeGreaterThanOrEqual(32)
    expect(first.player.age).toBeLessThanOrEqual(39)
    expect(first.seasonRecords.length).toBeGreaterThanOrEqual(16)
    expect(first.seasonRecords.length).toBeLessThanOrEqual(23)
    expect(decisions.length).toBeGreaterThanOrEqual(28)
    expect(decisions.length).toBeLessThanOrEqual(42)
    expect(keyMatches.length).toBeGreaterThanOrEqual(6)
    expect(keyMatches.length).toBeLessThanOrEqual(12)
    expect(first.player.peakOverall).toBeGreaterThanOrEqual(first.player.overall)
    expect(first.unlockedAchievementIds.length).toBeGreaterThan(0)
    expect(first.clubHistory.length).toBeGreaterThan(1)
  })
})

