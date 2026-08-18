import { describe, expect, it } from 'vitest'
import type { SaveBackend, StoredCareerRecord } from './saveRepository'
import { createMemorySaveBackend, SaveRepository } from './saveRepository'
import { migrateLegacyPlayer } from './migrations'

function sampleCareer(name = '周野') {
  return migrateLegacyPlayer({ name, position: 'RW', completedChoices: [] })
}

describe('SaveRepository', () => {
  it('saves, loads, lists, exports, imports, and deletes careers', async () => {
    const repository = new SaveRepository(createMemorySaveBackend())
    const career = sampleCareer()

    const first = await repository.save(career)
    const second = await repository.save({ ...career, player: { ...career.player, age: 17 } })
    expect(first.revision).toBe(1)
    expect(second.revision).toBe(2)
    expect((await repository.load(career.id))?.player.age).toBe(17)
    expect((await repository.list())[0].playerName).toBe('周野')

    const exported = repository.exportJson(career)
    const imported = await repository.importJson(exported)
    expect(imported.id).toBe(career.id)

    await repository.delete(career.id)
    expect(await repository.load(career.id)).toBeUndefined()
  })

  it('does not replace the previous version when a write fails', async () => {
    const career = sampleCareer()
    const initial: StoredCareerRecord = {
      id: career.id,
      updatedAt: '2026-08-19T00:00:00.000Z',
      revision: 1,
      career,
    }
    const memory = createMemorySaveBackend([initial])
    const failingBackend: SaveBackend = {
      ...memory,
      async put() {
        throw new Error('quota exceeded')
      },
    }
    const repository = new SaveRepository(failingBackend)

    await expect(repository.save({ ...career, player: { ...career.player, age: 18 } })).rejects.toThrow('quota exceeded')
    expect((await repository.load(career.id))?.player.age).toBe(16)
  })

  it('skips damaged entries in the save index and rejects damaged imports', async () => {
    const backend = createMemorySaveBackend([{
      id: 'damaged',
      updatedAt: '2026-08-19T00:00:00.000Z',
      revision: 1,
      career: { schemaVersion: 99 },
    }])
    const repository = new SaveRepository(backend)
    expect(await repository.list()).toEqual([])
    await expect(repository.importJson('{"career":{"schemaVersion":99}}')).rejects.toThrow('损坏')
  })
})
