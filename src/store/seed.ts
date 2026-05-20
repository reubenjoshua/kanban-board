import type { Board, Column, Label } from './types.ts'

export const DEFAULT_LABELS: Record<string, Label> = {
  'label-bug': {
    id: 'label-bug',
    name: 'Bug',
    color:
      'bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/25 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-400/35',
  },
  'label-feature': {
    id: 'label-feature',
    name: 'Feature',
    color:
      'bg-sky-500/12 text-sky-700 ring-1 ring-sky-500/25 dark:bg-sky-500/20 dark:text-sky-300 dark:ring-sky-400/35',
  },
  'label-design': {
    id: 'label-design',
    name: 'Design',
    color:
      'bg-violet-500/12 text-violet-700 ring-1 ring-violet-500/25 dark:bg-violet-500/20 dark:text-violet-300 dark:ring-violet-400/35',
  },
}

export function createSeedBoard(): Board {
  const boardId = 'board-1'
  const colTodo: Column = { id: 'col-todo', title: 'To Do', taskIds: ['task-1', 'task-2'] }
  const colProgress: Column = {
    id: 'col-progress',
    title: 'In Progress',
    taskIds: ['task-3'],
  }
  const colDone: Column = { id: 'col-done', title: 'Done', taskIds: [] }

  return {
    id: boardId,
    name: 'My Board',
    columnIds: [colTodo.id, colProgress.id, colDone.id],
    columns: {
      [colTodo.id]: colTodo,
      [colProgress.id]: colProgress,
      [colDone.id]: colDone,
    },
    tasks: {
      'task-1': {
        id: 'task-1',
        columnId: 'col-todo',
        title: 'Set up project',
        description: 'Install deps and folder structure',
        labelIds: ['label-feature'],
        createdAt: Date.now(),
        dueDate: null,
      },
      'task-2': {
        id: 'task-2',
        columnId: 'col-todo',
        title: 'Define types and store',
        description: 'Zustand + normalized board data',
        labelIds: ['label-design'],
        createdAt: Date.now(),
        dueDate: null,
      },
      'task-3': {
        id: 'task-3',
        columnId: 'col-progress',
        title: 'Build static board UI',
        description: 'Columns and cards without drag yet',
        labelIds: ['label-feature', 'label-design'],
        createdAt: Date.now(),
        dueDate: null,
      },
    },
    labels: { ...DEFAULT_LABELS },
  }
}

export function createEmptyBoard(name: string, id: string): Board {
  const columns: Column[] = [
    { id: `${id}-col-1`, title: 'To Do', taskIds: [] },
    { id: `${id}-col-2`, title: 'In Progress', taskIds: [] },
    { id: `${id}-col-3`, title: 'Done', taskIds: [] },
  ]

  return {
    id,
    name,
    columnIds: columns.map((c) => c.id),
    columns: Object.fromEntries(columns.map((c) => [c.id, c])),
    tasks: {},
    labels: { ...DEFAULT_LABELS },
  }
}
