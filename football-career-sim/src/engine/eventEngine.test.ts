import { describe, expect, it } from 'vitest'
import { createCareer } from './careerEngine'
import { generateSeasonEvents, rollEventOutcome, stageForAge } from './eventEngine'

describe('career event engine', () => {
  const career = createCareer({
    seed: 'events',
    name: '林川',
    primaryNationality: 'JPN',
    birthplace: '横滨',
    dominantFoot: 'right',
    primaryPosition: 'CM',
    trait: 'coach-child',
    difficulty: 'standard',
    startingClubId: 'kawasaki-frontale',
  })

  it('maps ages to the approved career phases', () => {
    expect(stageForAge(16)).toBe('academy')
    expect(stageForAge(20)).toBe('breakthrough')
    expect(stageForAge(24)).toBe('established')
    expect(stageForAge(28)).toBe('prime')
    expect(stageForAge(33)).toBe('turning-point')
    expect(stageForAge(36)).toBe('legacy')
  })

  it('generates at most two distinct events without changing the input career', () => {
    const generated = generateSeasonEvents(career, career.rng)
    expect(generated.events.length).toBeGreaterThan(0)
    expect(generated.events.length).toBeLessThanOrEqual(2)
    expect(new Set(generated.events.map((event) => event.templateId)).size).toBe(generated.events.length)
    expect(career.rng.draws).not.toBe(generated.state.draws)
  })

  it('makes outcome rolls deterministic but context-sensitive', () => {
    expect(rollEventOutcome(career, career.rng)).toEqual(rollEventOutcome(career, career.rng))
    const story = { ...career, difficulty: 'story' as const }
    const hard = { ...career, difficulty: 'journeyman' as const }
    const storyOrder = ['setback', 'complicated', 'solid', 'breakthrough'].indexOf(rollEventOutcome(story, story.rng).outcome)
    const hardOrder = ['setback', 'complicated', 'solid', 'breakthrough'].indexOf(rollEventOutcome(hard, hard.rng).outcome)
    expect(storyOrder).toBeGreaterThanOrEqual(hardOrder)
  })
})

