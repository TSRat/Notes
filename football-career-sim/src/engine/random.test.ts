import { describe, expect, it } from 'vitest'
import { createRandomState, forkRandom, nextRandom, pickOne, randomInt, weightedPick } from './random'

describe('deterministic random source', () => {
  it('replays the same sequence from the same seed', () => {
    let first = createRandomState('career-zhou-2031')
    let second = createRandomState('career-zhou-2031')
    const firstSequence: number[] = []
    const secondSequence: number[] = []

    for (let draw = 0; draw < 8; draw += 1) {
      const nextFirst = nextRandom(first)
      const nextSecond = nextRandom(second)
      firstSequence.push(nextFirst.value)
      secondSequence.push(nextSecond.value)
      first = nextFirst.state
      second = nextSecond.state
    }

    expect(firstSequence).toEqual(secondSequence)
    expect(first.draws).toBe(8)
  })

  it('keeps integer results inside inclusive bounds', () => {
    let state = createRandomState('bounded')
    for (let draw = 0; draw < 100; draw += 1) {
      const result = randomInt(state, 5, 15)
      expect(result.value).toBeGreaterThanOrEqual(5)
      expect(result.value).toBeLessThanOrEqual(15)
      state = result.state
    }
  })

  it('selects arrays and weighted values without mutating the source', () => {
    const teams = ['academy', 'local', 'elite'] as const
    const start = createRandomState('offers')
    const picked = pickOne(start, teams)
    const weighted = weightedPick(start, [
      { value: 'safe', weight: 3 },
      { value: 'bold', weight: 1 },
    ])

    expect(teams).toContain(picked.value)
    expect(['safe', 'bold']).toContain(weighted.value)
    expect(start.draws).toBe(0)
  })

  it('creates stable but distinct branches', () => {
    const state = createRandomState('career')
    expect(forkRandom(state, 'stay')).toEqual(forkRandom(state, 'stay'))
    expect(forkRandom(state, 'stay')).not.toEqual(forkRandom(state, 'transfer'))
  })

  it('rejects invalid selection inputs', () => {
    const state = createRandomState('invalid')
    expect(() => pickOne(state, [])).toThrow(RangeError)
    expect(() => weightedPick(state, [{ value: 'x', weight: 0 }])).toThrow(RangeError)
    expect(() => randomInt(state, 2, 1)).toThrow(RangeError)
  })
})
