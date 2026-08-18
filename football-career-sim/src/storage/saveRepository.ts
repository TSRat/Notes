import type { SimCareer } from '../engine/careerTypes'
import { migrateUnknownCareer, parseCareerJson } from './migrations'

const DATABASE_NAME = 'football-career-sim'
const STORE_NAME = 'career-saves'

export interface StoredCareerRecord {
  id: string
  updatedAt: string
  revision: number
  career: unknown
}

export interface SaveSummary {
  id: string
  playerName: string
  age: number
  overall: number
  clubId: string
  status: SimCareer['status']
  updatedAt: string
  revision: number
}

export interface SaveBackend {
  get(id: string): Promise<StoredCareerRecord | undefined>
  getAll(): Promise<StoredCareerRecord[]>
  put(record: StoredCareerRecord): Promise<void>
  delete(id: string): Promise<void>
}

function cloneRecord(record: StoredCareerRecord): StoredCareerRecord {
  return JSON.parse(JSON.stringify(record)) as StoredCareerRecord
}

export function createMemorySaveBackend(initial: StoredCareerRecord[] = []): SaveBackend {
  const records = new Map(initial.map((record) => [record.id, cloneRecord(record)]))
  return {
    async get(id) {
      const record = records.get(id)
      return record ? cloneRecord(record) : undefined
    },
    async getAll() {
      return [...records.values()].map(cloneRecord)
    },
    async put(record) {
      records.set(record.id, cloneRecord(record))
    },
    async delete(id) {
      records.delete(id)
    },
  }
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB 请求失败。'))
  })
}

function openDatabase(indexedDb: IDBFactory) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDb.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('无法打开本地存档数据库。'))
  })
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('存档事务失败。'))
    transaction.onabort = () => reject(transaction.error ?? new Error('存档事务已中止。'))
  })
}

export function createIndexedDbSaveBackend(indexedDb: IDBFactory): SaveBackend {
  return {
    async get(id) {
      const database = await openDatabase(indexedDb)
      try {
        const transaction = database.transaction(STORE_NAME, 'readonly')
        return await requestResult(transaction.objectStore(STORE_NAME).get(id)) as StoredCareerRecord | undefined
      } finally {
        database.close()
      }
    },
    async getAll() {
      const database = await openDatabase(indexedDb)
      try {
        const transaction = database.transaction(STORE_NAME, 'readonly')
        return await requestResult(transaction.objectStore(STORE_NAME).getAll()) as StoredCareerRecord[]
      } finally {
        database.close()
      }
    },
    async put(record) {
      const database = await openDatabase(indexedDb)
      try {
        const transaction = database.transaction(STORE_NAME, 'readwrite')
        transaction.objectStore(STORE_NAME).put(record)
        await transactionComplete(transaction)
      } finally {
        database.close()
      }
    },
    async delete(id) {
      const database = await openDatabase(indexedDb)
      try {
        const transaction = database.transaction(STORE_NAME, 'readwrite')
        transaction.objectStore(STORE_NAME).delete(id)
        await transactionComplete(transaction)
      } finally {
        database.close()
      }
    },
  }
}

export class SaveRepository {
  constructor(private readonly backend: SaveBackend) {}

  async save(career: SimCareer) {
    const previous = await this.backend.get(career.id)
    const record: StoredCareerRecord = {
      id: career.id,
      updatedAt: new Date().toISOString(),
      revision: (previous?.revision ?? 0) + 1,
      career,
    }
    await this.backend.put(record)
    return record
  }

  async load(id: string) {
    const record = await this.backend.get(id)
    if (!record) return undefined
    return migrateUnknownCareer(record.career)
  }

  async list(): Promise<SaveSummary[]> {
    const records = await this.backend.getAll()
    return records.flatMap((record) => {
      try {
        const career = migrateUnknownCareer(record.career)
        return [{
          id: career.id,
          playerName: career.player.name,
          age: career.player.age,
          overall: career.player.overall,
          clubId: career.player.currentClubId,
          status: career.status,
          updatedAt: record.updatedAt,
          revision: record.revision,
        }]
      } catch {
        return []
      }
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async delete(id: string) {
    await this.backend.delete(id)
  }

  async importJson(json: string) {
    const career = parseCareerJson(json)
    await this.save(career)
    return career
  }

  exportJson(career: SimCareer) {
    return JSON.stringify({
      format: 'football-career-sim-save',
      exportedAt: new Date().toISOString(),
      career,
    }, null, 2)
  }
}

export function createBrowserSaveRepository() {
  if (!globalThis.indexedDB) throw new Error('当前浏览器不支持 IndexedDB。')
  return new SaveRepository(createIndexedDbSaveBackend(globalThis.indexedDB))
}
