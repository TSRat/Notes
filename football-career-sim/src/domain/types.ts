export const PLAYER_POSITIONS = [
  'GK',
  'RB',
  'RWB',
  'CB',
  'LB',
  'LWB',
  'DM',
  'CM',
  'AM',
  'RW',
  'LW',
  'ST',
] as const

export type PlayerPosition = (typeof PLAYER_POSITIONS)[number]

export type PositionFamily = 'goalkeeper' | 'fullback' | 'centre-back' | 'midfield' | 'wing' | 'forward'

export const POSITION_FAMILIES: Record<PlayerPosition, PositionFamily> = {
  GK: 'goalkeeper',
  RB: 'fullback',
  RWB: 'fullback',
  CB: 'centre-back',
  LB: 'fullback',
  LWB: 'fullback',
  DM: 'midfield',
  CM: 'midfield',
  AM: 'midfield',
  RW: 'wing',
  LW: 'wing',
  ST: 'forward',
}

export type AttributeKey =
  | 'acceleration'
  | 'pace'
  | 'stamina'
  | 'strength'
  | 'agility'
  | 'ballControl'
  | 'dribbling'
  | 'shortPassing'
  | 'longPassing'
  | 'vision'
  | 'finishing'
  | 'shotPower'
  | 'attackingPositioning'
  | 'tackling'
  | 'marking'
  | 'aerial'
  | 'anticipation'
  | 'composure'
  | 'decisions'
  | 'goalkeeping'

export type PlayerAttributes = Record<AttributeKey, number>

export type PersonType = 'player' | 'coach' | 'executive' | 'agent' | 'medical'
export type PersonDataMode = 'simulated' | 'real' | 'historical'

export interface CareerHistoryEntry {
  organisationId: string
  role: string
  fromSeason: number
  toSeason?: number
}

export interface FootballPerson {
  id: string
  personType: PersonType
  dataMode: PersonDataMode
  displayName: string
  nationalities: string[]
  careerHistory: CareerHistoryEntry[]
  externalIds?: Record<string, string>
  dataVersion: string
  sourceRefs: string[]
  rightsStatus: 'clear' | 'name-only' | 'restricted' | 'unknown'
}

export type ClubRole = 'academy' | 'prospect' | 'rotation' | 'starter' | 'key-player' | 'captain' | 'surplus'
export type NationalTeamStatus = 'ineligible' | 'eligible' | 'youth' | 'fringe' | 'called-up' | 'starter' | 'retired'
export type CareerDifficulty = 'story' | 'standard' | 'journeyman'

export interface PositionRating {
  position: PlayerPosition
  overall: number
}

export interface PlayerProfile {
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
  attributes: PlayerAttributes
  overall: number
  positionRatings: PositionRating[]
  clubId: string
  clubRole: ClubRole
  nationalTeamStatus: NationalTeamStatus
}

export function clampRating(value: number) {
  return Math.max(1, Math.min(99, Math.round(value)))
}
