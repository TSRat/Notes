import achievementsJson from './achievements.json'
import associationsJson from './associations.json'
import clubsJson from './clubs.json'
import competitionsJson from './competitions.json'
import endingsJson from './endings.json'
import eventTemplatesJson from './event-templates.json'
import sourcesJson from './sources.json'

export type AuthorityTier = 'S' | 'A' | 'B' | 'C'
export type Confidence = 'high' | 'medium' | 'low'

export interface SourceRef {
  id: string
  title: string
  authorityTier: AuthorityTier
  publisherOrInstitution: string
  editionOrDate?: string
  urlOrLocalRef: string
  scopes: string[]
  checkedAt: string
  notes?: string
}

export interface CompetitionProfile {
  id: string
  name: string
  zhName: string
  countryId: string
  calendar: 'autumn-spring' | 'calendar-year'
  tier: number
  sourceRefs: string[]
}

export interface AssociationProfile {
  id: string
  name: string
  zhName: string
  confederation: 'UEFA' | 'AFC' | 'CONMEBOL' | 'CONCACAF'
  competitionId: string
}

export interface ClubProfile {
  id: string
  name: string
  zhName: string
  shortName: string
  monogram: string
  countryId: string
  competitionId: string
  city: string
  stadium: string
  traditionalColors: { primary: string; secondary: string; ink: string }
  identityTags: string[]
  developmentProfile: { academy: number; recruitment: string; pathway: string }
  pressureProfile: { level: number; media: 'national' | 'continental' | 'global'; supporter: 'measured' | 'high' | 'demanding' | 'intense' | 'relentless' }
  strengthBaseline: { rating: number; asOf: string; basis: 'editorial-simulation-baseline' }
  brandingMode: 'text-and-color'
  rightsStatus: 'name-and-color-review'
  sourceRefs: string[]
  confidence: Confidence
}

export type CareerStage = 'academy' | 'breakthrough' | 'established' | 'prime' | 'turning-point' | 'legacy'

export interface EventChoiceTemplate {
  id: string
  label: string
  riskTag: string
  effects: Record<string, number>
}

export interface CareerEventTemplate {
  id: string
  stage: CareerStage
  kind: 'club' | 'football' | 'contract' | 'transfer' | 'match' | 'medical' | 'life' | 'media' | 'national-team'
  title: string
  summary: string
  timedSeconds: number | null
  ageRange: [number, number]
  choices: EventChoiceTemplate[]
}

export interface AchievementDefinition {
  id: string
  category: 'milestone' | 'career' | 'match' | 'life'
  title: string
  description: string
  hidden: boolean
  conditionKey: string
}

export interface EndingDefinition {
  id: string
  title: string
  tone: 'triumphant' | 'warm' | 'hopeful' | 'bittersweet'
  thresholds: {
    sporting: number
    longevity: number
    clubLegacy: number
    nationalLegacy: number
    life: number
  }
}

export const worldSources = sourcesJson as SourceRef[]
export const competitions = competitionsJson as CompetitionProfile[]
export const associations = associationsJson as AssociationProfile[]
export const worldClubs = clubsJson as ClubProfile[]
export const eventTemplates = eventTemplatesJson as unknown as CareerEventTemplate[]
export const achievementDefinitions = achievementsJson as AchievementDefinition[]
export const endingDefinitions = endingsJson as EndingDefinition[]

export const getWorldClub = (clubId: string) => worldClubs.find((club) => club.id === clubId)
export const getCompetition = (competitionId: string) => competitions.find((competition) => competition.id === competitionId)
export const getAssociation = (associationId: string) => associations.find((association) => association.id === associationId)
export const getClubsForCompetition = (competitionId: string) => worldClubs.filter((club) => club.competitionId === competitionId)
export const getEventTemplate = (eventId: string) => eventTemplates.find((event) => event.id === eventId)
