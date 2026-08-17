import { describe, expect, it } from 'vitest'
import { getRouterBase } from './routerBase'

describe('getRouterBase', () => {
  it('supports exact-commit raw.githack builds', () => {
    expect(
      getRouterBase('/TSRat/Python/abc123/football-career-sim/dist/index.html'),
    ).toBe('/TSRat/Python/abc123/football-career-sim/dist')
  })

  it('leaves the index filename available to the route table', () => {
    const pathname = '/TSRat/Python/abc123/football-career-sim/dist/index.html'
    expect(pathname.slice(getRouterBase(pathname).length)).toBe('/index.html')
  })

  it('keeps the development root', () => {
    expect(getRouterBase('/career')).toBe('/')
  })
})
