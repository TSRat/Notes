import { eventTemplates, getEventTemplate, type CareerEventTemplate } from '../data/world/worldData'
import type { CareerEventInstance, SimCareer } from './careerTypes'
import { nextRandom, pickOne, type RandomState } from './random'

const ONE_TIME_EVENTS = new Set([
  'first-professional-contract',
  'first-loan',
  'dual-national-call',
  'peak-transfer',
  'long-injury',
  'relegation-choice',
  'final-contract',
])

export function stageForAge(age: number) {
  if (age <= 17) return 'academy' as const
  if (age <= 21) return 'breakthrough' as const
  if (age <= 25) return 'established' as const
  if (age <= 30) return 'prime' as const
  if (age <= 34) return 'turning-point' as const
  return 'legacy' as const
}

function priorityTemplateId(career: SimCareer) {
  const { age, secondaryNationality } = career.player
  const occurrence = career.eventOccurrences
  if (age >= 18 && !occurrence['first-professional-contract']) return 'first-professional-contract'
  if (age >= 19 && !occurrence['first-loan']) return 'first-loan'
  if (age >= 20 && secondaryNationality && !occurrence['dual-national-call'] && !career.player.nationalTeam.committedAssociationId) return 'dual-national-call'
  if (age >= 25 && !occurrence['peak-transfer']) return 'peak-transfer'
  if (age >= 30 && !occurrence['long-injury']) return 'long-injury'
  if (age >= 32 && !occurrence['relegation-choice']) return 'relegation-choice'
  if (age >= 35 && !occurrence['final-contract']) return 'final-contract'
  return undefined
}

function canUseTemplate(career: SimCareer, template: CareerEventTemplate) {
  if (career.player.age < template.ageRange[0] || career.player.age > template.ageRange[1]) return false
  const occurrences = career.eventOccurrences[template.id] ?? 0
  if (ONE_TIME_EVENTS.has(template.id)) return occurrences === 0
  const lastDecision = [...career.timeline].reverse().find((entry) => entry.type === 'decision')
  if (lastDecision?.sourceEventId === template.id) return false
  return occurrences < 2
}

function makeInstance(career: SimCareer, template: CareerEventTemplate, sequence: number): CareerEventInstance {
  const occurrence = (career.eventOccurrences[template.id] ?? 0) + 1
  return {
    instanceId: `${career.seasonYear}-${sequence}-${template.id}-${occurrence}`,
    templateId: template.id,
    seasonYear: career.seasonYear,
    stage: template.stage,
    title: template.title,
    summary: template.summary,
    timedSeconds: template.timedSeconds,
    choices: template.choices,
  }
}

export function generateSeasonEvents(career: SimCareer, randomState: RandomState) {
  const selected: CareerEventTemplate[] = []
  let state = randomState
  const priorityId = priorityTemplateId(career)
  const priority = priorityId ? getEventTemplate(priorityId) : undefined
  if (priority && canUseTemplate(career, priority)) selected.push(priority)

  const shouldIncludeMatch = career.seasonIndex % 2 === 0
  if (shouldIncludeMatch && !selected.some((template) => template.kind === 'match')) {
    const matchPool = eventTemplates.filter((template) => template.kind === 'match' && canUseTemplate(career, template))
    if (matchPool.length > 0) {
      const match = pickOne(state, matchPool)
      selected.push(match.value)
      state = match.state
    }
  }

  while (selected.length < 2) {
    const pool = eventTemplates.filter((template) => {
      return canUseTemplate(career, template)
        && !selected.some((selectedTemplate) => selectedTemplate.id === template.id)
        && (template.stage === career.stage || template.kind === 'life' || template.kind === 'media')
    })
    if (pool.length === 0) break
    const next = pickOne(state, pool)
    selected.push(next.value)
    state = next.state
  }

  return {
    events: selected.map((template, index) => makeInstance(career, template, index + 1)),
    state,
  }
}

export type EventOutcome = 'breakthrough' | 'solid' | 'complicated' | 'setback'

export function rollEventOutcome(career: SimCareer, randomState: RandomState) {
  const roll = nextRandom(randomState)
  const player = career.player
  const positiveContext = player.overall * 0.0025
    + player.metrics.form * 0.0015
    + player.metrics.coachTrust * 0.001
    + player.metrics.tacticalFit * 0.001
    + player.metrics.wellbeing * 0.0007
  const negativeContext = player.metrics.fatigue * 0.0012
    + player.metrics.pressure * 0.0008
    + player.metrics.injuryRisk * 0.0006
  const difficultyAdjustment = career.difficulty === 'story' ? 0.08 : career.difficulty === 'journeyman' ? -0.06 : 0
  const score = roll.value + positiveContext - negativeContext + difficultyAdjustment

  let outcome: EventOutcome
  if (score >= 1.03) outcome = 'breakthrough'
  else if (score >= 0.73) outcome = 'solid'
  else if (score >= 0.43) outcome = 'complicated'
  else outcome = 'setback'

  return { outcome, state: roll.state }
}
