import { describe, expect, it } from 'vitest'
import { careerReducer, guestPlayer, initialCareerState } from './careerState'
import type { Choice } from './types'
import { migrateLegacyPlayer } from '../storage/migrations'

const transferChoice: Choice = {
  id: 'transfer',
  label: '接受试训',
  hint: '测试',
  effects: { stamina: -4, technique: 2, tactics: 2, wellbeing: -3, reputation: 4, currentClubId: 'red-forge' },
}

describe('careerReducer', () => {
  it('creates a named local career', () => {
    const state = careerReducer(initialCareerState, {
      type: 'register',
      payload: { name: ' 林一 ', position: 'CM', playStyle: '节拍器' },
    })

    expect(state.player.name).toBe('林一')
    expect(state.player.position).toBe('CM')
    expect(state.player.isGuest).toBe(false)
  })

  it('applies effects and changes the club theme source', () => {
    const state = careerReducer(initialCareerState, {
      type: 'apply-choice',
      payload: { eventId: 'first-contract', choice: transferChoice },
    })

    expect(state.player.stamina).toBe(guestPlayer.stamina - 4)
    expect(state.player.tactics).toBe(guestPlayer.tactics + 2)
    expect(state.player.technique).toBe(guestPlayer.technique + 2)
    expect(state.player.wellbeing).toBe(guestPlayer.wellbeing - 3)
    expect(state.player.reputation).toBe(guestPlayer.reputation + 4)
    expect(state.player.currentClubId).toBe('red-forge')
    expect(state.toast?.detail).toContain('所属俱乐部已更新')
  })

  it('does not apply the same decision twice', () => {
    const once = careerReducer(initialCareerState, {
      type: 'apply-choice',
      payload: { eventId: 'first-contract', choice: transferChoice },
    })
    const twice = careerReducer(once, {
      type: 'apply-choice',
      payload: { eventId: 'first-contract', choice: transferChoice },
    })

    expect(twice).toBe(once)
  })

  it('clamps attributes between zero and one hundred', () => {
    const state = careerReducer(initialCareerState, {
      type: 'apply-choice',
      payload: {
        eventId: 'extreme',
        choice: { id: 'extreme', label: '极端', hint: '', effects: { reputation: 200, stamina: -200 } },
      },
    })

    expect(state.player.reputation).toBe(100)
    expect(state.player.stamina).toBe(0)
  })

  it('hydrates and replaces a versioned career without losing app state', () => {
    const career = migrateLegacyPlayer({ name: '周野', position: 'RW', completedChoices: [] })
    const hydrated = careerReducer(initialCareerState, { type: 'hydrate', payload: { career } })
    const replaced = careerReducer(hydrated, {
      type: 'replace-career',
      payload: {
        career: { ...career, seasonYear: 2027 },
        notices: [{ title: '赛季结算', detail: '新赛季已经开始。', tone: 'positive' }],
      },
    })

    expect(hydrated.lifecycle).toBe('ready')
    expect(hydrated.player.name).toBe('周野')
    expect(replaced.career?.seasonYear).toBe(2027)
    expect(replaced.saveStatus).toBe('saving')
    expect(replaced.toast?.title).toBe('赛季结算')
  })
})
