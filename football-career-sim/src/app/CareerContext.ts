import { createContext, useContext, type Dispatch } from 'react'
import type { CareerAction } from './careerState'
import type { CareerState } from './types'
import type { SaveSummary } from '../storage/saveRepository'

export type CareerContextValue = {
  state: CareerState
  dispatch: Dispatch<CareerAction>
  importCareer: (json: string) => Promise<boolean>
  exportCareer: () => string | null
  listCareers: () => Promise<SaveSummary[]>
  loadCareer: (id: string) => Promise<boolean>
}

export const CareerContext = createContext<CareerContextValue | null>(null)

export function useCareer() {
  const value = useContext(CareerContext)
  if (!value) throw new Error('useCareer must be used inside CareerProvider')
  return value
}
