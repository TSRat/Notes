import type { PlayerPosition } from '../domain/types'
import { createCareer } from '../engine/careerEngine'
import type { SimCareer } from '../engine/careerTypes'

export const LEGACY_PLAYER_STORAGE_KEY = 'football-career-sim.player.v1'
export const CURRENT_SAVE_SCHEMA = 2

export interface LegacyPlayerSave {
  name: string
  position: PlayerPosition
  playStyle?: string
  currentClubId?: string
  completedChoices: string[]
}

function isPosition(value: unknown): value is PlayerPosition {
  return ['GK', 'RB', 'RWB', 'CB', 'LB', 'LWB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'].includes(String(value))
}

export function isLegacyPlayerSave(value: unknown): value is LegacyPlayerSave {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<LegacyPlayerSave>
  return typeof candidate.name === 'string'
    && isPosition(candidate.position)
    && Array.isArray(candidate.completedChoices)
    && candidate.completedChoices.every((choice) => typeof choice === 'string')
}

export function isCurrentCareer(value: unknown): value is SimCareer {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SimCareer>
  const player = candidate.player as Partial<SimCareer['player']> | undefined
  return candidate.schemaVersion === CURRENT_SAVE_SCHEMA
    && candidate.contentVersion === '2026.08'
    && typeof candidate.id === 'string'
    && typeof candidate.seed === 'string'
    && typeof candidate.seasonYear === 'number'
    && (candidate.status === 'active' || candidate.status === 'retired')
    && Boolean(candidate.rng && typeof candidate.rng.value === 'number')
    && Array.isArray(candidate.timeline)
    && Array.isArray(candidate.seasonRecords)
    && Array.isArray(candidate.pendingEvents)
    && Array.isArray(candidate.clubHistory)
    && Array.isArray(candidate.resolvedEventInstanceIds)
    && Boolean(player
      && typeof player.name === 'string'
      && typeof player.age === 'number'
      && typeof player.currentClubId === 'string'
      && typeof player.overall === 'number'
      && player.attributes
      && player.metrics
      && player.nationalTeam)
}

function stableLegacySeed(player: LegacyPlayerSave) {
  return `legacy:${player.name.trim()}:${player.position}:${player.completedChoices.join('|')}`
}

export function migrateLegacyPlayer(player: LegacyPlayerSave): SimCareer {
  const migrated = createCareer({
    seed: stableLegacySeed(player),
    name: player.name.trim() || '未命名球员',
    primaryNationality: 'CHN',
    birthplace: '未记录',
    dominantFoot: 'right',
    primaryPosition: player.position,
    trait: player.playStyle?.includes('空间') ? 'street-football' : 'late-bloomer',
    difficulty: 'standard',
    startingClubId: 'shanghai-shenhua',
  })
  const migratedChoiceIds = player.completedChoices.map((choice) => `legacy:${choice}`)
  return {
    ...migrated,
    resolvedEventInstanceIds: [...migrated.resolvedEventInstanceIds, ...migratedChoiceIds],
    flags: {
      ...migrated.flags,
      migratedFromPrototype: true,
      legacyChoiceCount: player.completedChoices.length,
    },
    timeline: [
      ...migrated.timeline,
      {
        id: 'legacy-prototype-import',
        seasonYear: migrated.seasonYear,
        age: migrated.player.age,
        type: 'career-start',
        title: '旧版档案已迁移',
        detail: `保留了姓名、位置与 ${player.completedChoices.length} 项既有选择；虚构俱乐部经历未映射为真实俱乐部事实。`,
        clubId: migrated.player.currentClubId,
        tone: 'neutral',
      },
    ],
  }
}

export function migrateUnknownCareer(value: unknown): SimCareer {
  if (isCurrentCareer(value)) return value
  if (isLegacyPlayerSave(value)) return migrateLegacyPlayer(value)
  throw new Error('无法识别或存档内容已经损坏。')
}

export function parseCareerJson(json: string) {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('JSON 文件格式无效。')
  }
  if (parsed && typeof parsed === 'object' && 'career' in parsed) {
    return migrateUnknownCareer((parsed as { career?: unknown }).career)
  }
  return migrateUnknownCareer(parsed)
}
