import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { arrayMove } from '../utils/reorder.ts'
import { STORAGE_KEY } from '../utils/storage.ts'
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
    updates: Partial<Pick<Task, 'title' | 'description' | 'labelIds'>>,
  ) => void
  deleteTask: (taskId: string) => void
  moveTask: (activeId: string, overId: string) => void
}

const seedBoard = createSeedBoard()

const initialData = {
  boards: { [seedBoard.id]: seedBoard },
  boardOrder: [seedBoard.id],
  activeBoardId: seedBoard.id,
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

      moveTask: (activeId, overId) => {
        const boardId = get().activeBoardId
        if (!boardId) return

        set((state) => {
          const board = state.boards[boardId]
          if (!board) return state

          const activeTask = board.tasks[activeId]
          if (!activeTask) return state

          const activeColumn = board.columns[activeTask.columnId]
          if (!activeColumn) return state

          let overColumnId = overId
          if (!board.columns[overId]) {
            const overTask = board.tasks[overId]
            if (!overTask) return state
            overColumnId = overTask.columnId
          }

          const overColumn = board.columns[overColumnId]
          if (!overColumn) return state

          const activeIndex = activeColumn.taskIds.indexOf(activeId)
          let overIndex = overColumn.taskIds.indexOf(overId)
          if (overIndex < 0) {
            overIndex = overColumn.taskIds.length
          }

          if (activeTask.columnId === overColumnId && activeIndex === overIndex) {
            return state
          }

          if (activeTask.columnId === overColumnId) {
            const newTaskIds = arrayMove(overColumn.taskIds, activeIndex, overIndex)
            return {
              boards: {
                ...state.boards,
                [boardId]: {
                  ...board,
                  columns: {
                    ...board.columns,
                    [overColumnId]: { ...overColumn, taskIds: newTaskIds },
                  },
                },
              },
            }
          }

          const newActiveTaskIds = activeColumn.taskIds.filter((id) => id !== activeId)
          const newOverTaskIds = [...overColumn.taskIds]
          newOverTaskIds.splice(overIndex, 0, activeId)

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                tasks: {
                  ...board.tasks,
                  [activeId]: { ...activeTask, columnId: overColumnId },
                },
                columns: {
                  ...board.columns,
                  [activeTask.columnId]: { ...activeColumn, taskIds: newActiveTaskIds },
                  [overColumnId]: { ...overColumn, taskIds: newOverTaskIds },
                },
              },
            },
          }
        })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        boards: state.boards,
        boardOrder: state.boardOrder,
        activeBoardId: state.activeBoardId,
      }),
    },
  ),
)
