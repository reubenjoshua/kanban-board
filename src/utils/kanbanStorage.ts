import type { StateStorage } from 'zustand/middleware'
import { loadAndMigrateKanbanState, STORAGE_KEY } from './persistMigrate.ts'

/** Zustand persist storage with v1 → v2 migration on first read. */
export function createKanbanPersistStorage(): StateStorage {
  return {
    getItem: (name) => {
      const raw = localStorage.getItem(name)
      if (raw) return raw

      if (name === STORAGE_KEY) {
        const migrated = loadAndMigrateKanbanState()
        if (migrated) {
          return JSON.stringify({ state: migrated, version: 0 })
        }
      }
      return null
    },
    setItem: (name, value) => {
      localStorage.setItem(name, value)
    },
    removeItem: (name) => {
      localStorage.removeItem(name)
    },
  }
}
