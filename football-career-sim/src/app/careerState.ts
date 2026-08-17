import type { CareerState, Choice, PlayerPosition, PlayerState, StatKey, ToastMessage } from './types'

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
  toast: null,
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

export function careerReducer(state: CareerState, action: CareerAction): CareerState {
  switch (action.type) {
    case 'register': {
      const { name, position, playStyle } = action.payload
      return {
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
        player: nextPlayer,
        toast: createToast(choice.label, describeEffects(choice, state.player.currentClubId)),
      }
    }
    case 'dismiss-toast':
      return { ...state, toast: null }
    case 'restore':
      return { player: action.payload, toast: null }
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
