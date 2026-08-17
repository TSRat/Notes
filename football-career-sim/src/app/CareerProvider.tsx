import { useEffect, useReducer, type ReactNode } from 'react'
import { careerReducer, initialCareerState, isPlayerState } from './careerState'
import { CareerContext } from './CareerContext'
import type { CareerState } from './types'

const STORAGE_KEY = 'football-career-sim.player.v1'

function loadCareerState(): CareerState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialCareerState
    const parsed: unknown = JSON.parse(raw)
    if (isPlayerState(parsed)) return { player: parsed, toast: null }
  } catch {
    return {
      ...initialCareerState,
      toast: {
        id: Date.now(),
        title: '存档未能读取',
        detail: '已载入访客体验档，你可以从首页重新创建档案。',
      },
    }
  }

  return initialCareerState
}

export function CareerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(careerReducer, undefined, loadCareerState)

  useEffect(() => {
    if (!state.player.isGuest) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.player))
    }
  }, [state.player])

  return <CareerContext.Provider value={{ state, dispatch }}>{children}</CareerContext.Provider>
}
