import { describe, expect, it } from 'vitest'
import { migrateLegacyPlayer, migrateUnknownCareer, parseCareerJson } from './migrations'

describe('save migrations', () => {
  it('preserves the prototype name, position, and resolved choices', () => {
    const migrated = migrateLegacyPlayer({
      name: ' 林一 ',
      position: 'CM',
      playStyle: '节拍器',
      currentClubId: 'north-harbor',
      completedChoices: ['first-contract', 'media-answer'],
    })

    expect(migrated.player.name).toBe('林一')
    expect(migrated.player.primaryPosition).toBe('CM')
    expect(migrated.resolvedEventInstanceIds).toContain('legacy:first-contract')
    expect(migrated.flags.legacyChoiceCount).toBe(2)
    expect(migrated.timeline.at(-1)?.detail).toContain('虚构俱乐部经历未映射')
  })

  it('accepts a current career without changing it', () => {
    const career = migrateLegacyPlayer({ name: '周野', position: 'RW', completedChoices: [] })
    expect(migrateUnknownCareer(career)).toBe(career)
  })

  it('imports an envelope and reports invalid JSON clearly', () => {
    const career = migrateLegacyPlayer({ name: '韩川', position: 'CB', completedChoices: [] })
    expect(parseCareerJson(JSON.stringify({ career })).id).toBe(career.id)
    expect(() => parseCareerJson('{broken')).toThrow('JSON 文件格式无效')
    expect(() => parseCareerJson('{}')).toThrow('无法识别')
  })
})
