import { useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { careerReducer, initialCareerState } from './careerState'
import { CareerContext } from './CareerContext'
import {
  createBrowserSaveRepository,
  createMemorySaveBackend,
  SaveRepository,
} from '../storage/saveRepository'
import {
  isLegacyPlayerSave,
  LEGACY_PLAYER_STORAGE_KEY,
  migrateLegacyPlayer,
} from '../storage/migrations'

const LAST_SAVE_POINTER_KEY = 'football-career-sim.last-save.v2'

function makeRepository() {
  try {
    return { repository: createBrowserSaveRepository(), volatile: false }
  } catch {
    return { repository: new SaveRepository(createMemorySaveBackend()), volatile: true }
  }
}

export function CareerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(careerReducer, initialCareerState)
  const repositorySetup = useMemo(makeRepository, [])
  const repository = repositorySetup.repository
  const lastSavedSnapshot = useRef<string | null>(null)
  const saveQueue = useRef(Promise.resolve())

  useEffect(() => {
    let active = true

    async function hydrate() {
      let recoveryMessage = repositorySetup.volatile
        ? '浏览器未提供持久化数据库，本次只能使用临时存档。'
        : undefined
      try {
        const pointer = window.localStorage.getItem(LAST_SAVE_POINTER_KEY)
        if (pointer) {
          try {
            const career = await repository.load(pointer)
            if (career && active) {
              lastSavedSnapshot.current = JSON.stringify(career)
              dispatch({ type: 'hydrate', payload: { career, recoveryMessage } })
              return
            }
          } catch {
            recoveryMessage = '最近存档无法读取，已尝试寻找上一份可用档案。'
          }
        }

        const summaries = await repository.list()
        if (summaries.length > 0) {
          const recovered = await repository.load(summaries[0].id)
          if (recovered && active) {
            window.localStorage.setItem(LAST_SAVE_POINTER_KEY, recovered.id)
            lastSavedSnapshot.current = JSON.stringify(recovered)
            dispatch({ type: 'hydrate', payload: { career: recovered, recoveryMessage } })
            return
          }
        }

        const legacyRaw = window.localStorage.getItem(LEGACY_PLAYER_STORAGE_KEY)
        if (legacyRaw) {
          const legacy: unknown = JSON.parse(legacyRaw)
          if (isLegacyPlayerSave(legacy)) {
            const migrated = migrateLegacyPlayer(legacy)
            await repository.save(migrated)
            window.localStorage.setItem(LAST_SAVE_POINTER_KEY, migrated.id)
            window.localStorage.removeItem(LEGACY_PLAYER_STORAGE_KEY)
            lastSavedSnapshot.current = JSON.stringify(migrated)
            if (active) {
              dispatch({
                type: 'hydrate',
                payload: { career: migrated, recoveryMessage: '旧版原型档案已安全迁移。' },
              })
            }
            return
          }
        }

        if (active) dispatch({ type: 'hydrate', payload: { career: null, recoveryMessage } })
      } catch {
        if (active) {
          dispatch({
            type: 'hydrate',
            payload: { career: null, recoveryMessage: '本地存档无法读取；没有覆盖或删除现有数据。' },
          })
        }
      }
    }

    void hydrate()
    return () => {
      active = false
    }
  }, [repository, repositorySetup.volatile])

  useEffect(() => {
    if (state.lifecycle !== 'ready' || !state.career) return
    const career = state.career
    const snapshot = JSON.stringify(career)
    if (snapshot === lastSavedSnapshot.current) return
    dispatch({ type: 'save-started' })
    saveQueue.current = saveQueue.current
      .then(async () => {
        await repository.save(career)
        lastSavedSnapshot.current = snapshot
        window.localStorage.setItem(LAST_SAVE_POINTER_KEY, career.id)
        dispatch({ type: 'save-complete' })
      })
      .catch((error: unknown) => {
        const detail = error instanceof Error ? error.message : '未知写入错误。'
        dispatch({ type: 'save-failed', payload: detail })
      })
  }, [repository, state.career, state.lifecycle])

  const importCareer = useCallback(async (json: string) => {
    try {
      const career = await repository.importJson(json)
      lastSavedSnapshot.current = JSON.stringify(career)
      window.localStorage.setItem(LAST_SAVE_POINTER_KEY, career.id)
      dispatch({ type: 'hydrate', payload: { career } })
      return true
    } catch (error) {
      dispatch({ type: 'import-failed', payload: error instanceof Error ? error.message : '存档内容无效。' })
      return false
    }
  }, [repository])

  const exportCareer = useCallback(() => {
    return state.career ? repository.exportJson(state.career) : null
  }, [repository, state.career])

  const listCareers = useCallback(() => repository.list(), [repository])

  const loadCareer = useCallback(async (id: string) => {
    try {
      const career = await repository.load(id)
      if (!career) throw new Error('找不到这份职业档案。')
      lastSavedSnapshot.current = JSON.stringify(career)
      window.localStorage.setItem(LAST_SAVE_POINTER_KEY, career.id)
      dispatch({ type: 'hydrate', payload: { career } })
      return true
    } catch (error) {
      dispatch({ type: 'import-failed', payload: error instanceof Error ? error.message : '档案无法读取。' })
      return false
    }
  }, [repository])

  return (
    <CareerContext.Provider value={{ state, dispatch, importCareer, exportCareer, listCareers, loadCareer }}>
      {children}
    </CareerContext.Provider>
  )
}
