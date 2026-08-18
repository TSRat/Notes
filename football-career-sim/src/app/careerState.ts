import type { CareerState, Choice, PlayerPosition, PlayerState, StatKey, ToastMessage } from './types'
import type { EngineNotice, SimCareer } from '../engine/careerTypes'

const STAT_LABELS: Record<StatKey, string> = {
  stamina: '体力',
  technique: '技术',
  tactics: '战术理解',
  composure: '心理稳定',
  wellbeing: '身心状态',
  reputation: '公众声望',
}

export const guestPlayer: PlayerState = {
  name: '周野',
  position: 'RW',
  playStyle: '空间猎手',
  stamina: 78,
  technique: 72,
  tactics: 61,
  composure: 66,
  wellbeing: 84,
  reputation: 24,
  currentClubId: 'north-harbor',
  season: '2031 / 32',
  careerWeek: 1,
  isGuest: true,
  completedChoices: [],
}

export const initialCareerState: CareerState = {
  player: guestPlayer,
  career: null,
  toast: null,
  lifecycle: 'loading',
  saveStatus: 'idle',
  recoveryMessage: null,
}

type RegisterPayload = {
  name: string
  position: PlayerPosition
  playStyle: string
}

export type CareerAction =
  | { type: 'register'; payload: RegisterPayload }
  | { type: 'apply-choice'; payload: { eventId: string; choice: Choice } }
  | { type: 'dismiss-toast' }
  | { type: 'restore'; payload: PlayerState }
  | { type: 'hydrate'; payload: { career: SimCareer | null; recoveryMessage?: string } }
  | { type: 'start-career'; payload: SimCareer }
  | { type: 'replace-career'; payload: { career: SimCareer; notices?: EngineNotice[] } }
  | { type: 'save-started' }
  | { type: 'save-complete' }
  | { type: 'save-failed'; payload: string }
  | { type: 'import-failed'; payload: string }

function clampStat(value: number) {
  return Math.max(0, Math.min(100, value))
}

export function describeEffects(choice: Choice, previousClubId: string) {
  const statChanges = (Object.keys(STAT_LABELS) as StatKey[])
    .filter((key) => choice.effects[key])
    .map((key) => {
      const value = choice.effects[key] ?? 0
      return `${STAT_LABELS[key]} ${value > 0 ? '+' : ''}${value}`
    })

  if (choice.effects.currentClubId && choice.effects.currentClubId !== previousClubId) {
    statChanges.push('所属俱乐部已更新')
  }

  return statChanges.join('，') || '职业档案已更新'
}

function createToast(title: string, detail: string): ToastMessage {
  return { id: Date.now(), title, detail }
}

const TRAIT_LABELS: Record<SimCareer['player']['trait'], string> = {
  gifted: '天赋型',
  'late-bloomer': '后发型',
  'street-football': '街头灵感',
  'coach-child': '战术家庭',
  'dual-heritage': '双重文化',
}

export function projectCareerPlayer(career: SimCareer): PlayerState {
  const { attributes, metrics } = career.player
  return {
    name: career.player.name,
    position: career.player.primaryPosition,
    playStyle: TRAIT_LABELS[career.player.trait],
    stamina: attributes.stamina,
    technique: Math.round((attributes.ballControl + attributes.dribbling + attributes.shortPassing) / 3),
    tactics: Math.round((attributes.decisions + attributes.vision + attributes.anticipation) / 3),
    composure: attributes.composure,
    wellbeing: metrics.wellbeing,
    reputation: metrics.reputation,
    currentClubId: 'north-harbor',
    season: `${career.seasonYear} / ${String(career.seasonYear + 1).slice(-2)}`,
    careerWeek: career.seasonIndex + 1,
    isGuest: false,
    completedChoices: career.resolvedEventInstanceIds,
  }
}

export function careerReducer(state: CareerState, action: CareerAction): CareerState {
  switch (action.type) {
    case 'register': {
      const { name, position, playStyle } = action.payload
      return {
        ...state,
        player: {
          ...guestPlayer,
          name: name.trim(),
          position,
          playStyle,
          isGuest: false,
        },
        toast: createToast('档案已创建', '第一份职业选择正在等待你。'),
      }
    }
    case 'apply-choice': {
      const { choice, eventId } = action.payload
      if (state.player.completedChoices.includes(eventId)) return state

      const nextPlayer = { ...state.player }
      ;(['stamina', 'technique', 'tactics', 'composure', 'wellbeing', 'reputation'] as StatKey[]).forEach((key) => {
        const change = choice.effects[key]
        if (typeof change === 'number') nextPlayer[key] = clampStat(nextPlayer[key] + change)
      })
      if (choice.effects.currentClubId) nextPlayer.currentClubId = choice.effects.currentClubId
      nextPlayer.completedChoices = [...nextPlayer.completedChoices, eventId]

      return {
        ...state,
        player: nextPlayer,
        toast: createToast(choice.label, describeEffects(choice, state.player.currentClubId)),
      }
    }
    case 'dismiss-toast':
      return { ...state, toast: null }
    case 'restore':
      return { ...state, player: action.payload, toast: null }
    case 'hydrate': {
      const career = action.payload.career
      return {
        ...state,
        career,
        player: career ? projectCareerPlayer(career) : guestPlayer,
        lifecycle: 'ready',
        saveStatus: career ? 'saved' : 'idle',
        recoveryMessage: action.payload.recoveryMessage ?? null,
        toast: action.payload.recoveryMessage
          ? createToast('存档恢复提示', action.payload.recoveryMessage)
          : state.toast,
      }
    }
    case 'start-career':
      return {
        ...state,
        career: action.payload,
        player: projectCareerPlayer(action.payload),
        lifecycle: 'ready',
        saveStatus: 'saving',
        recoveryMessage: null,
        toast: createToast('球员档案已建立', '你的第一段职业时间线已经生成。'),
      }
    case 'replace-career': {
      const notice = action.payload.notices?.[0]
      return {
        ...state,
        career: action.payload.career,
        player: projectCareerPlayer(action.payload.career),
        saveStatus: 'saving',
        toast: notice ? createToast(notice.title, notice.detail) : state.toast,
      }
    }
    case 'save-started':
      return { ...state, saveStatus: 'saving' }
    case 'save-complete':
      return { ...state, saveStatus: 'saved' }
    case 'save-failed':
      return {
        ...state,
        saveStatus: 'error',
        toast: createToast('本地存档写入失败', `${action.payload} 当前页面中的进度仍然保留。`),
      }
    case 'import-failed':
      return { ...state, toast: createToast('无法导入存档', action.payload) }
    default:
      return state
  }
}

export function isPlayerState(value: unknown): value is PlayerState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<PlayerState>
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.stamina === 'number' &&
    typeof candidate.technique === 'number' &&
    typeof candidate.tactics === 'number' &&
    typeof candidate.composure === 'number' &&
    typeof candidate.wellbeing === 'number' &&
    typeof candidate.reputation === 'number' &&
    typeof candidate.currentClubId === 'string' &&
    Array.isArray(candidate.completedChoices)
  )
}
