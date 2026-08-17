export type StatKey = 'stamina' | 'technique' | 'tactics' | 'composure' | 'wellbeing' | 'reputation'

export type PlayerPosition = 'RW' | 'CM' | 'ST' | 'CB'

export interface ChoiceEffect extends Partial<Record<StatKey, number>> {
  currentClubId?: string
}

export interface Choice {
  id: string
  label: string
  hint: string
  effects: ChoiceEffect
}

export interface Club {
  id: string
  name: string
  shortName: string
  monogram: string
  league: string
  themeClass: string
  tacticsStyle: string
  pressureLevel: number
  primary: string
  secondary: string
  academyPathway: string
  ownershipModel: string
  recruitmentProfile: string
  medicalModel: string
  communityIdentity: string
  stadiumSurface: string
}

export interface NewsEvent {
  id: string
  date: string
  time: string
  type: 'urgent' | 'normal'
  source: string
  headline: string
  content: string
  termIds: string[]
  choices: Choice[]
  experienceId?: string
}

export interface MatchEvent {
  id: string
  minute: number
  type: 'goal' | 'foul' | 'sub' | 'decision'
  text: string
  isInteractive: boolean
  relatedChoice?: {
    title: string
    prompt: string
    choices: Choice[]
  }
  experienceId?: string
}

export interface MatchRecord {
  id: string
  competition: string
  date: string
  venue: string
  homeClubId: string
  awayName: string
  score: { home: number; away: number }
  currentMinute: number
  events: MatchEvent[]
}

export interface EncyclopediaTerm {
  id: string
  category: string
  title: string
  description: string
  whyItMatters: string
  deepLink: string
  englishTerm: string
  sourceIds?: string[]
}

export type CareerStage = 'academy' | 'breakthrough' | 'established' | 'prime' | 'turning-point' | 'legacy'
export type CareerSurface = 'news' | 'club' | 'match'

export interface CareerExperience {
  id: string
  stage: CareerStage
  title: string
  scenario: string
  factors: string[]
  surfaces: CareerSurface[]
  termIds: string[]
  stakes: StatKey[]
  sourceIds?: string[]
}

export interface KnowledgeSource {
  id: string
  label: string
  url: string
  scope: string
  checkedAt: string
}

export interface PlayerState {
  name: string
  position: PlayerPosition
  playStyle: string
  stamina: number
  technique: number
  tactics: number
  composure: number
  wellbeing: number
  reputation: number
  currentClubId: string
  season: string
  careerWeek: number
  isGuest: boolean
  completedChoices: string[]
}

export interface ToastMessage {
  id: number
  title: string
  detail: string
}

export interface CareerState {
  player: PlayerState
  toast: ToastMessage | null
}
