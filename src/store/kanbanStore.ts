import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { normalizeBoard } from '../utils/boardValidate.ts'
import { isDoneColumn } from '../utils/columnMatch.ts'
import { STORAGE_KEY } from '../utils/persistMigrate.ts'
import { createKanbanPersistStorage } from '../utils/kanbanStorage.ts'
import { applyMoveTask } from './actions.ts'
import { createEmptyBoard, createSeedBoard } from './seed.ts'
import type { Board, Column, Task } from './types.ts'

type KanbanState = {
  boards: Record<string, Board>
  boardOrder: string[]
  activeBoardId: string | null

  setActiveBoard: (boardId: string) => void
  addBoard: (name: string) => void
  renameBoard: (boardId: string, name: string) => void
  deleteBoard: (boardId: string) => void
  addColumn: (title: string) => void
  renameColumn: (columnId: string, title: string) => void
  deleteColumn: (columnId: string) => void
  addTask: (columnId: string, title: string) => void
  updateTask: (
    taskId: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'labelIds' | 'dueDate'>>,
  ) => void
  deleteTask: (taskId: string) => void
  duplicateTask: (taskId: string) => void
  clearDoneColumn: () => void
  moveTask: (activeId: string, overId: string) => void
  resetToSeed: () => void
}

const seedBoard = createSeedBoard()

const initialData = {
  boards: { [seedBoard.id]: seedBoard },
  boardOrder: [seedBoard.id],
  activeBoardId: seedBoard.id,
}

function normalizeBoardsInState(boards: Record<string, Board>): Record<string, Board> {
  return Object.fromEntries(
    Object.entries(boards).map(([id, board]) => [id, normalizeBoard(board)]),
  )
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      ...initialData,

      setActiveBoard: (boardId) => {
        if (!get().boards[boardId]) return
        set({ activeBoardId: boardId })
      },

      addBoard: (name) => {
        const id = nanoid()
        const board = createEmptyBoard(name, id)
        set((state) => ({
          boards: { ...state.boards, [id]: board },
          boardOrder: [...state.boardOrder, id],
          activeBoardId: id,
        }))
      },

      renameBoard: (boardId, name) => {
        const trimmed = name.trim()
        if (!trimmed) return
        set((state) => {
          const board = state.boards[boardId]
          if (!board) return state
          return {
            boards: {
              ...state.boards,
              [boardId]: { ...board, name: trimmed },
            },
          }
        })
      },

      deleteBoard: (boardId) => {
        set((state) => {
          if (state.boardOrder.length <= 1) return state
          const { [boardId]: _removed, ...remainingBoards } = state.boards
          const boardOrder = state.boardOrder.filter((id) => id !== boardId)
          const activeBoardId =
            state.activeBoardId === boardId
              ? boardOrder[0] ?? null
              : state.activeBoardId
          return { boards: remainingBoards, boardOrder, activeBoardId }
        })
      },

      addColumn: (title) => {
        const boardId = get().activeBoardId
        if (!boardId) return
        const trimmed = title.trim() || 'New Column'
        const colId = nanoid()

        set((state) => {
          const board = state.boards[boardId]
          if (!board) return state
          const column: Column = { id: colId, title: trimmed, taskIds: [] }
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columnIds: [...board.columnIds, colId],
                columns: { ...board.columns, [colId]: column },
              },
            },
          }
        })
      },

      renameColumn: (columnId, title) => {
        const boardId = get().activeBoardId
        if (!boardId) return
        const trimmed = title.trim()
        if (!trimmed) return

        set((state) => {
          const board = state.boards[boardId]
          const column = board?.columns[columnId]
          if (!board || !column) return state
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: {
                  ...board.columns,
                  [columnId]: { ...column, title: trimmed },
                },
              },
            },
          }
        })
      },

      deleteColumn: (columnId) => {
        const boardId = get().activeBoardId
        if (!boardId) return

        set((state) => {
          const board = state.boards[boardId]
          if (!board || board.columnIds.length <= 1) return state

          const column = board.columns[columnId]
          if (!column) return state

          const taskIdsToRemove = new Set(column.taskIds)
          const remainingTasks = Object.fromEntries(
            Object.entries(board.tasks).filter(([id]) => !taskIdsToRemove.has(id)),
          )
          const { [columnId]: _col, ...remainingColumns } = board.columns

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columnIds: board.columnIds.filter((id) => id !== columnId),
                columns: remainingColumns,
                tasks: remainingTasks,
              },
            },
          }
        })
      },

      addTask: (columnId, title) => {
        const boardId = get().activeBoardId
        if (!boardId) return

        const taskId = nanoid()
        const task: Task = {
          id: taskId,
          columnId,
          title,
          description: '',
          labelIds: [],
          createdAt: Date.now(),
          dueDate: null,
        }

        set((state) => {
          const board = state.boards[boardId]
          if (!board) return state

          const column = board.columns[columnId]
          if (!column) return state

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                tasks: { ...board.tasks, [taskId]: task },
                columns: {
                  ...board.columns,
                  [columnId]: {
                    ...column,
                    taskIds: [...column.taskIds, taskId],
                  },
                },
              },
            },
          }
        })
      },

      updateTask: (taskId, updates) => {
        const boardId = get().activeBoardId
        if (!boardId) return

        set((state) => {
          const board = state.boards[boardId]
          const task = board?.tasks[taskId]
          if (!board || !task) return state

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                tasks: {
                  ...board.tasks,
                  [taskId]: { ...task, ...updates },
                },
              },
            },
          }
        })
      },

      deleteTask: (taskId) => {
        const boardId = get().activeBoardId
        if (!boardId) return

        set((state) => {
          const board = state.boards[boardId]
          const task = board?.tasks[taskId]
          if (!board || !task) return state

          const { [taskId]: _removed, ...remainingTasks } = board.tasks
          const column = board.columns[task.columnId]
          if (!column) return state

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                tasks: remainingTasks,
                columns: {
                  ...board.columns,
                  [task.columnId]: {
                    ...column,
                    taskIds: column.taskIds.filter((id) => id !== taskId),
                  },
                },
              },
            },
          }
        })
      },

      duplicateTask: (taskId) => {
        const boardId = get().activeBoardId
        if (!boardId) return

        set((state) => {
          const board = state.boards[boardId]
          const task = board?.tasks[taskId]
          if (!board || !task) return state

          const column = board.columns[task.columnId]
          if (!column) return state

          const newId = nanoid()
          const copy: Task = {
            ...task,
            id: newId,
            title: `${task.title} (copy)`,
            createdAt: Date.now(),
          }

          const index = column.taskIds.indexOf(taskId)
          const newTaskIds = [...column.taskIds]
          newTaskIds.splice(index + 1, 0, newId)

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                tasks: { ...board.tasks, [newId]: copy },
                columns: {
                  ...board.columns,
                  [task.columnId]: { ...column, taskIds: newTaskIds },
                },
              },
            },
          }
        })
      },

      clearDoneColumn: () => {
        const boardId = get().activeBoardId
        if (!boardId) return

        set((state) => {
          const board = state.boards[boardId]
          if (!board) return state

          const doneColumn = Object.values(board.columns).find((c) =>
            isDoneColumn(c.title),
          )
          if (!doneColumn || doneColumn.taskIds.length === 0) return state

          const removeIds = new Set(doneColumn.taskIds)
          const remainingTasks = Object.fromEntries(
            Object.entries(board.tasks).filter(([id]) => !removeIds.has(id)),
          )

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                tasks: remainingTasks,
                columns: {
                  ...board.columns,
                  [doneColumn.id]: { ...doneColumn, taskIds: [] },
                },
              },
            },
          }
        })
      },

      moveTask: (activeId, overId) => {
        const boardId = get().activeBoardId
        if (!boardId) return

        set((state) => {
          const board = state.boards[boardId]
          if (!board) return state

          const updated = applyMoveTask(board, activeId, overId)
          if (!updated) return state

          return {
            boards: {
              ...state.boards,
              [boardId]: updated,
            },
          }
        })
      },

      resetToSeed: () => {
        const fresh = createSeedBoard()
        set({
          boards: { [fresh.id]: fresh },
          boardOrder: [fresh.id],
          activeBoardId: fresh.id,
        })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => createKanbanPersistStorage()),
      partialize: (state) => ({
        boards: state.boards,
        boardOrder: state.boardOrder,
        activeBoardId: state.activeBoardId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.boards = normalizeBoardsInState(state.boards)
      },
    },
  ),
)
