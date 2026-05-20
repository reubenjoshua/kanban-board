import type { PersistedKanbanState } from '../store/types.ts'
import { isValidPersistedState, normalizePersistedState } from './boardValidate.ts'

const LEGACY_KEY = 'kanban-board-v1'
export const STORAGE_KEY = 'kanban-board-v2'

export function loadAndMigrateKanbanState(): PersistedKanbanState | null {
  try {
    const v2 = localStorage.getItem(STORAGE_KEY)
    if (v2) {
      const parsed: unknown = JSON.parse(v2)
      const state = (parsed as { state?: PersistedKanbanState })?.state ?? parsed
      if (isValidPersistedState(state)) return normalizePersistedState(state)
    }

    const v1 = localStorage.getItem(LEGACY_KEY)
    if (v1) {
      const parsed: unknown = JSON.parse(v1)
      const state = (parsed as { state?: PersistedKanbanState })?.state ?? parsed
      if (isValidPersistedState(state)) {
        const normalized = normalizePersistedState(state)
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ state: normalized, version: 0 }),
        )
        return normalized
      }
    }
  } catch {
    return null
  }
  return null
}
