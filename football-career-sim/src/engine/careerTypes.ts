import type {
  CareerDifficulty,
  ClubRole,
  NationalTeamStatus,
  PlayerAttributes,
  PlayerPosition,
} from '../domain/types'
import type { CareerStage, EventChoiceTemplate } from '../data/world/worldData'
import type { RandomState } from './random'

export type CareerTrait = 'gifted' | 'late-bloomer' | 'street-football' | 'coach-child' | 'dual-heritage'
export type CareerStatus = 'active' | 'retired'

export interface CareerMetrics {
  fitness: number
  form: number
  coachTrust: number
  reputation: number
  wellbeing: number
  tacticalFit: number
  adaptability: number
  financialSecurity: number
  belonging: number
  leadership: number
  pressure: number
  fatigue: number
  injuryRisk: number
}

export interface NationalTeamCareer {
  eligibleAssociationIds: string[]
  committedAssociationId?: string
  status: NationalTeamStatus
  caps: number
  goals: number
  tournamentAppearances: number
}

export interface ClubHistoryEntry {
  clubId: string
  fromSeason: number
  toSeason?: number
  appearances: number
  goals: number
  assists: number
  isLoan: boolean
}

export interface CareerPlayer {
  id: string
  name: string
  birthYear: number
  age: number
  primaryNationality: string
  secondaryNationality?: string
  birthplace: string
  dominantFoot: 'left' | 'right'
  primaryPosition: PlayerPosition
  secondaryPositions: PlayerPosition[]
  trait: CareerTrait
  childhoodClubId?: string
  currentClubId: string
  clubRole: ClubRole
  attributes: PlayerAttributes
  overall: number
  peakOverall: number
  potential: number
  metrics: CareerMetrics
  nationalTeam: NationalTeamCareer
}

export interface SeasonStatistics {
  appearances: number
  starts: number
  goals: number
  assists: number
  cleanSheets: number
  averageRating: number
  teamFinish: number
  trophyCount: number
}

export interface SeasonRecord {
  seasonYear: number
  age: number
  clubId: string
  role: ClubRole
  overallStart: number
  overallEnd: number
  statistics: SeasonStatistics
  nationalCaps: number
  achievementIds: string[]
  summary: string
}

export interface CareerEventInstance {
  instanceId: string
  templateId: string
  seasonYear: number
  stage: CareerStage
  title: string
  summary: string
  timedSeconds: number | null
  choices: EventChoiceTemplate[]
}

export interface CareerTimelineEntry {
  id: string
  seasonYear: number
  age: number
  type: 'career-start' | 'decision' | 'season' | 'transfer' | 'national-team' | 'achievement' | 'retirement'
  title: string
  detail: string
  clubId?: string
  tone: 'neutral' | 'positive' | 'difficult' | 'major'
  sourceEventId?: string
}

export interface TransferOffer {
  clubId: string
  role: ClubRole
  contractYears: number
  salaryTier: number
  fit: number
  isLoan: boolean
  knownFacts: string[]
}

export interface EndingDimensions {
  sporting: number
  longevity: number
  clubLegacy: number
  nationalLegacy: number
  life: number
}

export interface CareerEnding {
  endingId: string
  title: string
  dimensions: EndingDimensions
  isGoodEnding: boolean
  biography: string
}

export interface SimCareer {
  schemaVersion: 2
  contentVersion: '2026.08'
  id: string
  seed: string
  rng: RandomState
  difficulty: CareerDifficulty
  status: CareerStatus
  seasonYear: number
  seasonIndex: number
  stage: CareerStage
  player: CareerPlayer
  clubHistory: ClubHistoryEntry[]
  seasonRecords: SeasonRecord[]
  timeline: CareerTimelineEntry[]
  pendingEvents: CareerEventInstance[]
  eventOccurrences: Record<string, number>
  resolvedEventInstanceIds: string[]
  unlockedAchievementIds: string[]
  transferOffers: TransferOffer[]
  flags: Record<string, number | string | boolean>
  ending?: CareerEnding
}

export interface CreateCareerInput {
  seed: string
  name: string
  primaryNationality: string
  secondaryNationality?: string
  birthplace: string
  dominantFoot: 'left' | 'right'
  primaryPosition: PlayerPosition
  secondaryPositions?: PlayerPosition[]
  trait: CareerTrait
  difficulty: CareerDifficulty
  startingClubId: string
  childhoodClubId?: string
}

export interface EngineNotice {
  title: string
  detail: string
  tone: 'neutral' | 'positive' | 'difficult' | 'major'
}

export interface CareerUpdate {
  career: SimCareer
  notices: EngineNotice[]
}
