import { DEFAULT_LABELS } from '../store/seed.ts'
import type { Board, PersistedKanbanState } from '../store/types.ts'

function syncDefaultLabelColors(labels: Board['labels']): Board['labels'] {
  const synced = { ...labels }
  for (const [id, defaults] of Object.entries(DEFAULT_LABELS)) {
    if (synced[id]) {
      synced[id] = { ...synced[id], color: defaults.color }
    }
  }
  return synced
}

export function isValidPersistedState(data: unknown): data is PersistedKanbanState {
  if (!data || typeof data !== 'object') return false
  const s = data as PersistedKanbanState
  return (
    typeof s.boards === 'object' &&
    Array.isArray(s.boardOrder) &&
    (s.activeBoardId === null || typeof s.activeBoardId === 'string')
  )
}

export function normalizeBoard(board: Board): Board {
  const tasks: Board['tasks'] = {}
  for (const [id, task] of Object.entries(board.tasks)) {
    tasks[id] = {
      ...task,
      dueDate: task.dueDate ?? null,
      labelIds: task.labelIds ?? [],
      description: task.description ?? '',
    }
  }
  return { ...board, tasks, labels: syncDefaultLabelColors(board.labels) }
}

export function normalizePersistedState(state: PersistedKanbanState): PersistedKanbanState {
  const boards: Record<string, Board> = {}
  for (const [id, board] of Object.entries(state.boards)) {
    boards[id] = normalizeBoard(board)
  }
  return { ...state, boards }
}
