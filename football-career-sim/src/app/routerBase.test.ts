import { describe, expect, it } from 'vitest'
import { getRouterBase } from './routerBase'

describe('getRouterBase', () => {
  it('supports exact-commit raw.githack builds', () => {
    expect(
      getRouterBase('/TSRat/Python/abc123/football-career-sim/dist/index.html'),
    ).toBe('/TSRat/Python/abc123/football-career-sim/dist')
  })

  it('keeps the development root', () => {
    expect(getRouterBase('/career')).toBe('/')
  })
})
