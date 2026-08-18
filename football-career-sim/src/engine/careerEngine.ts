import { clampRating, type AttributeKey, type PlayerAttributes, type PlayerPosition } from '../domain/types'
import { achievementDefinitions, getWorldClub } from '../data/world/worldData'
import { findNewAchievements } from './achievementEngine'
import type {
  CareerMetrics,
  CareerPlayer,
  CareerTrait,
  CareerUpdate,
  CreateCareerInput,
  EngineNotice,
  SeasonRecord,
  SimCareer,
} from './careerTypes'
import { createCareerEnding } from './endingEngine'
import { generateSeasonEvents, rollEventOutcome, stageForAge, type EventOutcome } from './eventEngine'
import { simulateSeasonStatistics } from './matchEngine'
import { simulateNationalTeamSeason } from './nationalTeamEngine'
import { calculateOverall, getPositionAttributeKeys } from './overall'
import { createRandomState, randomInt, type RandomState } from './random'
import { generateTransferOffers, selectTransferTarget } from './transferEngine'

const ATTRIBUTE_KEYS: AttributeKey[] = [
  'acceleration',
  'pace',
  'stamina',
  'strength',
  'agility',
  'ballControl',
  'dribbling',
  'shortPassing',
  'longPassing',
  'vision',
  'finishing',
  'shotPower',
  'attackingPositioning',
  'tackling',
  'marking',
  'aerial',
  'anticipation',
  'composure',
  'decisions',
  'goalkeeping',
]

const POSITION_BOOSTS: Record<PlayerPosition, Partial<Record<AttributeKey, number>>> = {
  GK: { goalkeeping: 26, anticipation: 12, composure: 10, decisions: 9, aerial: 7, longPassing: 5 },
  RB: { pace: 14, acceleration: 13, stamina: 14, tackling: 10, marking: 8, shortPassing: 7 },
  RWB: { pace: 16, acceleration: 14, stamina: 15, dribbling: 10, shortPassing: 8, tackling: 6 },
  CB: { marking: 16, tackling: 15, aerial: 14, strength: 13, anticipation: 12, decisions: 8 },
  LB: { pace: 14, acceleration: 13, stamina: 14, tackling: 10, marking: 8, shortPassing: 7 },
  LWB: { pace: 16, acceleration: 14, stamina: 15, dribbling: 10, shortPassing: 8, tackling: 6 },
  DM: { anticipation: 14, tackling: 13, marking: 10, decisions: 12, shortPassing: 11, stamina: 10 },
  CM: { shortPassing: 15, vision: 13, decisions: 12, ballControl: 12, stamina: 10, longPassing: 11 },
  AM: { vision: 16, ballControl: 14, dribbling: 13, shortPassing: 12, attackingPositioning: 10, agility: 9 },
  RW: { pace: 15, acceleration: 15, dribbling: 16, ballControl: 12, attackingPositioning: 10, agility: 10 },
  LW: { pace: 15, acceleration: 15, dribbling: 16, ballControl: 12, attackingPositioning: 10, agility: 10 },
  ST: { finishing: 18, attackingPositioning: 16, shotPower: 13, composure: 11, acceleration: 10, strength: 9 },
}

const OUTCOME_LABELS: Record<EventOutcome, { title: string; tone: EngineNotice['tone']; multiplier: number }> = {
  breakthrough: { title: '这次决定打开了新的道路', tone: 'major', multiplier: 1.35 },
  solid: { title: '决定产生了积极效果', tone: 'positive', multiplier: 1 },
  complicated: { title: '结果比预想更复杂', tone: 'neutral', multiplier: 0.55 },
  setback: { title: '这次结果没有站在你这一边', tone: 'difficult', multiplier: 0.2 },
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function addAttribute(attributes: PlayerAttributes, key: AttributeKey, amount: number) {
  return { ...attributes, [key]: clampRating(attributes[key] + amount) }
}

function createAttributes(position: PlayerPosition, trait: CareerTrait, randomState: RandomState) {
  let state = randomState
  let attributes = {} as PlayerAttributes
  for (const key of ATTRIBUTE_KEYS) {
    const roll = randomInt(state, key === 'goalkeeping' && position !== 'GK' ? 8 : 43, key === 'goalkeeping' && position !== 'GK' ? 18 : 54)
    attributes[key] = roll.value
    state = roll.state
  }
  for (const [key, boost] of Object.entries(POSITION_BOOSTS[position])) {
    attributes = addAttribute(attributes, key as AttributeKey, boost)
  }

  if (trait === 'gifted') {
    for (const key of ['ballControl', 'dribbling', 'shortPassing', 'vision', 'finishing'] as AttributeKey[]) attributes = addAttribute(attributes, key, 4)
  } else if (trait === 'late-bloomer') {
    for (const key of ATTRIBUTE_KEYS) attributes = addAttribute(attributes, key, -2)
  } else if (trait === 'street-football') {
    attributes = addAttribute(addAttribute(attributes, 'dribbling', 6), 'ballControl', 5)
    attributes = addAttribute(attributes, 'decisions', -3)
  } else if (trait === 'coach-child') {
    attributes = addAttribute(addAttribute(attributes, 'decisions', 5), 'vision', 4)
  }

  return { attributes, state }
}

function initialMetrics(trait: CareerTrait): CareerMetrics {
  return {
    fitness: 86,
    form: 55,
    coachTrust: trait === 'coach-child' ? 58 : 50,
    reputation: trait === 'gifted' ? 20 : 12,
    wellbeing: 76,
    tacticalFit: trait === 'coach-child' ? 62 : 54,
    adaptability: trait === 'dual-heritage' ? 66 : 54,
    financialSecurity: 35,
    belonging: 56,
    leadership: 32,
    pressure: trait === 'gifted' ? 35 : 22,
    fatigue: 8,
    injuryRisk: 12,
  }
}

function roleForPlayer(player: CareerPlayer) {
  if (player.age <= 16) return 'academy' as const
  if (player.age <= 18) return 'prospect' as const
  const club = getWorldClub(player.currentClubId)
  const difference = player.overall - (club?.strengthBaseline.rating ?? 72)
  if (difference >= 4) return player.metrics.leadership >= 75 && player.age >= 29 ? 'captain' as const : 'key-player' as const
  if (difference >= -2) return 'starter' as const
  if (difference >= -7) return 'rotation' as const
  if (difference >= -13) return 'prospect' as const
  if (player.age <= 22) return 'prospect' as const
  return 'surplus' as const
}

function nextPotential(trait: CareerTrait, state: RandomState) {
  const rareRoll = randomInt(state, 0, 999)
  if (rareRoll.value < 30) {
    const generational = randomInt(rareRoll.state, 90, 94)
    return { potential: generational.value, state: generational.state }
  }
  const roll = randomInt(rareRoll.state, 72, 77)
  const bonus = trait === 'gifted' ? 6 : trait === 'late-bloomer' ? 3 : 0
  return { potential: clampRating(roll.value + bonus), state: roll.state }
}

function withGeneratedEvents(career: SimCareer) {
  const generated = generateSeasonEvents(career, career.rng)
  let nextCareer = { ...career, rng: generated.state, pendingEvents: generated.events }
  if (generated.events.some((event) => ['first-loan', 'peak-transfer'].includes(event.templateId))) {
    const transferResult = generateTransferOffers(nextCareer, nextCareer.rng)
    nextCareer = { ...nextCareer, transferOffers: transferResult.offers, rng: transferResult.state }
  } else {
    nextCareer = { ...nextCareer, transferOffers: [] }
  }
  return nextCareer
}

export function createCareer(input: CreateCareerInput): SimCareer {
  if (!getWorldClub(input.startingClubId)) throw new Error(`Unknown starting club: ${input.startingClubId}`)
  let state = createRandomState(input.seed)
  const attributeResult = createAttributes(input.primaryPosition, input.trait, state)
  state = attributeResult.state
  const potentialResult = nextPotential(input.trait, state)
  state = potentialResult.state
  const overall = calculateOverall(attributeResult.attributes, input.primaryPosition)
  const eligibleAssociationIds = [...new Set([input.primaryNationality, input.secondaryNationality].filter(Boolean) as string[])]
  const player: CareerPlayer = {
    id: `player-${state.value.toString(16)}`,
    name: input.name.trim(),
    birthYear: 2010,
    age: 16,
    primaryNationality: input.primaryNationality,
    secondaryNationality: input.secondaryNationality,
    birthplace: input.birthplace,
    dominantFoot: input.dominantFoot,
    primaryPosition: input.primaryPosition,
    secondaryPositions: input.secondaryPositions ?? [],
    trait: input.trait,
    childhoodClubId: input.childhoodClubId,
    currentClubId: input.startingClubId,
    clubRole: 'academy',
    attributes: attributeResult.attributes,
    overall,
    peakOverall: overall,
    potential: potentialResult.potential,
    metrics: initialMetrics(input.trait),
    nationalTeam: {
      eligibleAssociationIds,
      committedAssociationId: input.secondaryNationality ? undefined : input.primaryNationality,
      status: input.secondaryNationality ? 'eligible' : 'youth',
      caps: 0,
      goals: 0,
      tournamentAppearances: 0,
    },
  }
  const base: SimCareer = {
    schemaVersion: 2,
    contentVersion: '2026.08',
    id: `career-${state.value.toString(16)}`,
    seed: input.seed,
    rng: state,
    difficulty: input.difficulty,
    status: 'active',
    seasonYear: 2026,
    seasonIndex: 0,
    stage: 'academy',
    player,
    clubHistory: [{ clubId: input.startingClubId, fromSeason: 2026, appearances: 0, goals: 0, assists: 0, isLoan: false }],
    seasonRecords: [],
    timeline: [{
      id: 'career-start',
      seasonYear: 2026,
      age: 16,
      type: 'career-start',
      title: '职业档案建立',
      detail: `${player.name}进入${getWorldClub(input.startingClubId)?.zhName}青训体系，初始 OVR ${overall}。`,
      clubId: input.startingClubId,
      tone: 'major',
    }],
    pendingEvents: [],
    eventOccurrences: { 'academy-offers': 1 },
    resolvedEventInstanceIds: ['create-academy-offers'],
    unlockedAchievementIds: [],
    transferOffers: [],
    flags: {},
  }
  return withGeneratedEvents(base)
}

function applyMetric(metrics: CareerMetrics, key: string, amount: number) {
  const mapping: Record<string, keyof CareerMetrics> = {
    trust: 'coachTrust',
    reputation: 'reputation',
    wellbeing: 'wellbeing',
    fit: 'tacticalFit',
    adaptation: 'adaptability',
    security: 'financialSecurity',
    belonging: 'belonging',
    leadership: 'leadership',
    pressure: 'pressure',
    fatigue: 'fatigue',
    injuryRisk: 'injuryRisk',
    health: 'fitness',
    form: 'form',
  }
  const target = mapping[key]
  if (!target) return metrics
  return { ...metrics, [target]: clamp(metrics[target] + amount) }
}

function developForChoice(player: CareerPlayer, key: string, amount: number) {
  let attributes = player.attributes
  if (key === 'decisions' || key === 'pace') attributes = addAttribute(attributes, key, amount)
  if (['development', 'training', 'specialism'].includes(key)) {
    const weighted = Object.keys(POSITION_BOOSTS[player.primaryPosition]) as AttributeKey[]
    for (const attribute of weighted.slice(0, 5)) attributes = addAttribute(attributes, attribute, Math.max(1, Math.round(amount / 2)))
  }
  if (key === 'versatility') {
    attributes = addAttribute(attributes, 'decisions', Math.max(1, Math.round(amount / 2)))
    attributes = addAttribute(attributes, 'stamina', Math.max(1, Math.round(amount / 3)))
  }
  const overall = calculateOverall(attributes, player.primaryPosition)
  if (amount > 0 && overall > player.potential + 2) return player
  return { ...player, attributes, overall, peakOverall: Math.max(player.peakOverall, overall) }
}

function applyChoiceEffects(player: CareerPlayer, effects: Record<string, number>, multiplier: number) {
  let nextPlayer = player
  let metrics = player.metrics
  for (const [key, rawAmount] of Object.entries(effects)) {
    const amount = Math.round(rawAmount * multiplier)
    metrics = applyMetric(metrics, key, amount)
    nextPlayer = developForChoice({ ...nextPlayer, metrics }, key, amount)
  }
  return { ...nextPlayer, metrics }
}

function applyTransfer(career: SimCareer, mode: 'strongest' | 'different-confederation' | 'best-fit', isLoan = false) {
  const offer = selectTransferTarget(career, mode)
  if (!offer) return career
  const previousClubId = career.player.currentClubId
  const clubHistory = career.clubHistory.map((entry, index) => index === career.clubHistory.length - 1 && !entry.toSeason ? { ...entry, toSeason: career.seasonYear } : entry)
  clubHistory.push({ clubId: offer.clubId, fromSeason: career.seasonYear, appearances: 0, goals: 0, assists: 0, isLoan: isLoan || offer.isLoan })
  return {
    ...career,
    player: { ...career.player, currentClubId: offer.clubId, clubRole: offer.role, metrics: { ...career.player.metrics, tacticalFit: offer.fit, adaptability: clamp(career.player.metrics.adaptability - 4) } },
    clubHistory,
    timeline: [...career.timeline, {
      id: `transfer-${career.seasonYear}-${offer.clubId}`,
      seasonYear: career.seasonYear,
      age: career.player.age,
      type: 'transfer' as const,
      title: isLoan || offer.isLoan ? '租借生效' : '转会完成',
      detail: `${getWorldClub(previousClubId)?.zhName} → ${getWorldClub(offer.clubId)?.zhName}，预计角色：${offer.role}。`,
      clubId: offer.clubId,
      tone: 'major' as const,
    }],
  }
}

function applyEventSpecificConsequences(career: SimCareer, templateId: string, choiceId: string, outcome: EventOutcome) {
  let next = career
  const flags = { ...next.flags }

  if (templateId === 'first-loan' && choiceId === 'accept-loan') next = applyTransfer(next, 'best-fit', true)
  if (templateId === 'peak-transfer') {
    if (choiceId === 'superclub') {
      next = applyTransfer(next, 'strongest')
      flags.joinedSuperclub = true
    } else if (choiceId === 'new-continent') {
      next = applyTransfer(next, 'different-confederation')
      flags.continentsPlayed = Number(flags.continentsPlayed ?? 1) + 1
    } else {
      flags.declinedSuperclub = true
    }
  }
  if (templateId === 'dual-national-call') {
    const committedAssociationId = choiceId === 'heritage-nation'
      ? next.player.secondaryNationality
      : choiceId === 'primary-nation'
        ? next.player.primaryNationality
        : undefined
    if (committedAssociationId) {
      next = { ...next, player: { ...next.player, nationalTeam: { ...next.player.nationalTeam, committedAssociationId, status: 'fringe' } } }
      flags.dualNationChoice = true
    }
  }
  if (templateId === 'long-injury' && choiceId === 'rebuild-role') flags.injuryPositionRebuild = true
  if (templateId === 'relegation-choice' && choiceId === 'stay-promotion') flags.stayedAfterRelegation = true
  if (templateId === 'debut-last-ten' && outcome === 'breakthrough') flags.subChangedCareer = true
  if (templateId === 'final-contract' && choiceId === 'retire') flags.retirementChosen = true

  return { ...next, flags }
}

export function resolveCareerEvent(career: SimCareer, instanceId: string, choiceId: string): CareerUpdate {
  if (career.status !== 'active') return { career, notices: [{ title: '生涯已经结束', detail: '这份档案已进入生涯博物馆。', tone: 'neutral' }] }
  const event = career.pendingEvents.find((candidate) => candidate.instanceId === instanceId)
  if (!event || career.resolvedEventInstanceIds.includes(instanceId)) {
    return { career, notices: [{ title: '这个决定已经关闭', detail: '时间线没有被重复修改。', tone: 'neutral' }] }
  }
  const choice = event.choices.find((candidate) => candidate.id === choiceId)
  if (!choice) return { career, notices: [{ title: '无法识别这个选择', detail: '请重新打开当前事件。', tone: 'difficult' }] }

  const result = rollEventOutcome(career, career.rng)
  const outcomeMeta = OUTCOME_LABELS[result.outcome]
  let next: SimCareer = {
    ...career,
    rng: result.state,
    player: applyChoiceEffects(career.player, choice.effects, outcomeMeta.multiplier),
    pendingEvents: career.pendingEvents.filter((candidate) => candidate.instanceId !== instanceId),
    eventOccurrences: { ...career.eventOccurrences, [event.templateId]: (career.eventOccurrences[event.templateId] ?? 0) + 1 },
    resolvedEventInstanceIds: [...career.resolvedEventInstanceIds, instanceId],
    timeline: [...career.timeline, {
      id: `decision-${instanceId}`,
      seasonYear: career.seasonYear,
      age: career.player.age,
      type: 'decision',
      title: event.title,
      detail: `${choice.label}。${outcomeMeta.title}。`,
      clubId: career.player.currentClubId,
      tone: outcomeMeta.tone,
      sourceEventId: event.templateId,
    }],
  }
  next = applyEventSpecificConsequences(next, event.templateId, choice.id, result.outcome)

  if (next.flags.retirementChosen) {
    return retireCareer(next, '你选择按自己的时间结束职业生涯。')
  }

  return {
    career: next,
    notices: [{ title: outcomeMeta.title, detail: `已记录：${choice.label}。后续影响可能在未来赛季出现。`, tone: outcomeMeta.tone }],
  }
}

function growthForSeason(player: CareerPlayer, state: RandomState) {
  const roll = randomInt(state, 0, 2)
  let growth = 0
  if (player.age <= 20) growth = 2 + roll.value
  else if (player.age <= 24) growth = 1 + roll.value
  else if (player.age <= 28) growth = roll.value === 2 ? 1 : 0
  else if (player.age <= 31) growth = 0
  else growth = -(player.age >= 35 ? 1 + Math.round(roll.value / 2) : Math.round(roll.value / 2))
  if (player.overall >= player.potential && growth > 0) growth = 0
  if (player.potential >= 90 && player.age <= 24 && growth > 0) growth += 1
  if (player.trait === 'late-bloomer' && player.age >= 22 && player.age <= 28) growth += 1
  return { growth, state: roll.state }
}

function applySeasonGrowth(player: CareerPlayer, growth: number) {
  let attributes = player.attributes
  const weightedAttributes = player.potential >= 90
    ? getPositionAttributeKeys(player.primaryPosition)
    : Object.keys(POSITION_BOOSTS[player.primaryPosition]) as AttributeKey[]
  let appliedGrowth = growth
  if (growth > 0) {
    while (appliedGrowth > 0) {
      let candidate = player.attributes
      for (const attribute of weightedAttributes) candidate = addAttribute(candidate, attribute, appliedGrowth)
      if (calculateOverall(candidate, player.primaryPosition) <= player.potential + 2) {
        attributes = candidate
        break
      }
      appliedGrowth -= 1
    }
  } else {
    for (const attribute of weightedAttributes) attributes = addAttribute(attributes, attribute, growth)
  }
  if (growth < 0 && player.age >= 32) {
    attributes = addAttribute(attributes, 'pace', growth)
    attributes = addAttribute(attributes, 'acceleration', growth)
    attributes = addAttribute(attributes, 'decisions', 1)
    attributes = addAttribute(attributes, 'anticipation', 1)
  }
  const overall = calculateOverall(attributes, player.primaryPosition)
  return { ...player, attributes, overall, peakOverall: Math.max(player.peakOverall, overall) }
}

function updateClubHistory(career: SimCareer, statistics: SeasonRecord['statistics']) {
  return career.clubHistory.map((entry, index) => index === career.clubHistory.length - 1
    ? { ...entry, appearances: entry.appearances + statistics.appearances, goals: entry.goals + statistics.goals, assists: entry.assists + statistics.assists }
    : entry)
}

export function advanceCareerSeason(career: SimCareer): CareerUpdate {
  if (career.status !== 'active') return { career, notices: [{ title: '生涯已经结束', detail: '可以在博物馆查看完整时间线。', tone: 'neutral' }] }
  if (career.pendingEvents.length > 0) {
    return { career, notices: [{ title: '还有关键决定等待处理', detail: '完成当前事件后才能推进赛季。', tone: 'neutral' }] }
  }
  const club = getWorldClub(career.player.currentClubId)
  if (!club) return { career, notices: [{ title: '俱乐部资料缺失', detail: '赛季没有推进，当前存档保持不变。', tone: 'difficult' }] }

  const overallStart = career.player.overall
  const simulated = simulateSeasonStatistics(career.player, club, career.rng)
  const national = simulateNationalTeamSeason(career.player, simulated.statistics, simulated.state)
  const growth = growthForSeason(career.player, national.state)
  let player = applySeasonGrowth({ ...career.player, nationalTeam: national.nationalTeam }, growth.growth)
  const nextAge = player.age + 1
  const formTarget = 50 + (simulated.statistics.averageRating - 6.4) * 18
  player = {
    ...player,
    age: nextAge,
    metrics: {
      ...player.metrics,
      form: clamp(formTarget),
      fitness: clamp(player.metrics.fitness - Math.max(0, player.metrics.injuryRisk - 40) / 12 + 3),
      coachTrust: clamp(player.metrics.coachTrust + (simulated.statistics.starts >= 20 ? 3 : simulated.statistics.starts <= 5 ? -2 : 1)),
      reputation: clamp(player.metrics.reputation + simulated.statistics.goals + simulated.statistics.assists / 2 + national.newCaps / 2),
      financialSecurity: clamp(player.metrics.financialSecurity + Math.max(1, Math.round((club.strengthBaseline.rating - 60) / 10))),
      leadership: clamp(player.metrics.leadership + (nextAge >= 27 ? 2 : 1)),
      fatigue: clamp(Math.max(6, player.metrics.fatigue - 4)),
      pressure: clamp(Math.max(8, player.metrics.pressure - 2)),
    },
  }
  player = { ...player, clubRole: roleForPlayer(player) }

  const seasonRecord: SeasonRecord = {
    seasonYear: career.seasonYear,
    age: career.player.age,
    clubId: career.player.currentClubId,
    role: career.player.clubRole,
    overallStart,
    overallEnd: player.overall,
    statistics: simulated.statistics,
    nationalCaps: national.newCaps,
    achievementIds: [],
    summary: `${getWorldClub(career.player.currentClubId)?.zhName}赛季第 ${simulated.statistics.teamFinish} 位；${simulated.statistics.appearances} 次出场，OVR ${overallStart} → ${player.overall}。`,
  }
  let next: SimCareer = {
    ...career,
    rng: growth.state,
    seasonYear: career.seasonYear + 1,
    seasonIndex: career.seasonIndex + 1,
    stage: stageForAge(nextAge),
    player,
    clubHistory: updateClubHistory(career, simulated.statistics),
    seasonRecords: [...career.seasonRecords, seasonRecord],
    timeline: [...career.timeline, {
      id: `season-${career.seasonYear}`,
      seasonYear: career.seasonYear,
      age: career.player.age,
      type: 'season',
      title: `${career.seasonYear}/${String(career.seasonYear + 1).slice(-2)} 赛季`,
      detail: seasonRecord.summary,
      clubId: career.player.currentClubId,
      tone: simulated.statistics.trophyCount > 0 ? 'major' : simulated.statistics.averageRating >= 6.8 ? 'positive' : 'neutral',
    }],
  }
  const newAchievements = findNewAchievements({ ...next, seasonRecords: career.seasonRecords }, seasonRecord)
  const finalSeasonRecord = { ...seasonRecord, achievementIds: newAchievements }
  next = {
    ...next,
    seasonRecords: [...career.seasonRecords, finalSeasonRecord],
  }
  if (newAchievements.length > 0) {
    next = {
      ...next,
      unlockedAchievementIds: [...next.unlockedAchievementIds, ...newAchievements],
      timeline: [...next.timeline, ...newAchievements.map((achievementId) => {
        const definition = achievementDefinitions.find((achievement) => achievement.id === achievementId)
        return {
          id: `achievement-${career.seasonYear}-${achievementId}`,
          seasonYear: career.seasonYear,
          age: career.player.age,
          type: 'achievement' as const,
          title: definition?.title ?? '新的生涯印记',
          detail: definition?.description ?? '这段经历已经写入生涯博物馆。',
          clubId: career.player.currentClubId,
          tone: 'positive' as const,
        }
      })],
    }
  }

  if (nextAge >= 39) return retireCareer(next, '身体与时间共同告诉你，这已经是最后一个完整赛季。')
  next = withGeneratedEvents(next)

  const notices: EngineNotice[] = [{ title: '赛季已经结算', detail: seasonRecord.summary, tone: simulated.statistics.trophyCount > 0 ? 'major' : 'neutral' }]
  if (national.newCaps > 0) notices.push({ title: '国家队名单里出现了你的名字', detail: `本赛季新增 ${national.newCaps} 次国家队出场。`, tone: 'major' })
  if (newAchievements.length > 0) notices.push({ title: '获得新的生涯印记', detail: `本赛季解锁 ${newAchievements.length} 项成就。`, tone: 'positive' })
  return { career: next, notices }
}

export function retireCareer(career: SimCareer, reason = '职业生涯结束。'): CareerUpdate {
  if (career.status === 'retired' && career.ending) return { career, notices: [] }
  const ending = createCareerEnding(career)
  let next: SimCareer = {
    ...career,
    status: 'retired',
    ending,
    pendingEvents: [],
    transferOffers: [],
    timeline: [...career.timeline, {
      id: `retirement-${career.seasonYear}`,
      seasonYear: career.seasonYear,
      age: career.player.age,
      type: 'retirement',
      title: ending.title,
      detail: `${reason}${ending.biography}`,
      clubId: career.player.currentClubId,
      tone: ending.isGoodEnding ? 'major' : 'difficult',
    }],
  }
  const finalAchievements = findNewAchievements(next)
  next = { ...next, unlockedAchievementIds: [...next.unlockedAchievementIds, ...finalAchievements] }
  return { career: next, notices: [{ title: ending.title, detail: ending.biography, tone: ending.isGoodEnding ? 'major' : 'difficult' }] }
}

export function autoplayCareer(career: SimCareer, choose: (career: SimCareer) => string = (current) => current.pendingEvents[0]?.choices[0]?.id ?? '') {
  let current = career
  let guard = 0
  while (current.status === 'active' && guard < 200) {
    if (current.pendingEvents.length > 0) {
      const event = current.pendingEvents[0]
      current = resolveCareerEvent(current, event.instanceId, choose(current)).career
    } else {
      current = advanceCareerSeason(current).career
    }
    guard += 1
  }
  return current
}
