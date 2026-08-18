export interface RandomState {
  value: number
  draws: number
}

export interface RandomResult<T> {
  value: T
  state: RandomState
}

function hashSeed(seed: string) {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  const unsigned = hash >>> 0
  return unsigned === 0 ? 0x9e3779b9 : unsigned
}

export function createRandomState(seed: string): RandomState {
  return { value: hashSeed(seed), draws: 0 }
}

export function nextRandom(state: RandomState): RandomResult<number> {
  let nextValue = state.value >>> 0
  nextValue ^= nextValue << 13
  nextValue ^= nextValue >>> 17
  nextValue ^= nextValue << 5
  nextValue >>>= 0

  return {
    value: nextValue / 0x1_0000_0000,
    state: { value: nextValue || 0x9e3779b9, draws: state.draws + 1 },
  }
}

export function randomInt(state: RandomState, minimum: number, maximum: number): RandomResult<number> {
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || maximum < minimum) {
    throw new RangeError('randomInt requires integer bounds with maximum >= minimum')
  }
  const next = nextRandom(state)
  return {
    value: Math.floor(next.value * (maximum - minimum + 1)) + minimum,
    state: next.state,
  }
}

export function pickOne<T>(state: RandomState, items: readonly T[]): RandomResult<T> {
  if (items.length === 0) throw new RangeError('pickOne requires at least one item')
  const index = randomInt(state, 0, items.length - 1)
  return { value: items[index.value], state: index.state }
}

export function weightedPick<T>(
  state: RandomState,
  items: readonly { value: T; weight: number }[],
): RandomResult<T> {
  if (items.length === 0 || items.some((item) => !Number.isFinite(item.weight) || item.weight < 0)) {
    throw new RangeError('weightedPick requires non-negative finite weights')
  }
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  if (total <= 0) throw new RangeError('weightedPick requires a positive total weight')

  const next = nextRandom(state)
  const target = next.value * total
  let cursor = 0
  for (const item of items) {
    cursor += item.weight
    if (target < cursor) return { value: item.value, state: next.state }
  }

  return { value: items[items.length - 1].value, state: next.state }
}

export function forkRandom(state: RandomState, branch: string): RandomState {
  return createRandomState(`${state.value}:${state.draws}:${branch}`)
}
