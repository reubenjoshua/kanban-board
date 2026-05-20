import { arrayMove } from '../utils/reorder.ts'
import type { Board } from './types.ts'

/** Pure move-task update for tests and store. Returns new board or null if noop/invalid. */
export function applyMoveTask(board: Board, activeId: string, overId: string): Board | null {
  const activeTask = board.tasks[activeId]
  if (!activeTask) return null

  const activeColumn = board.columns[activeTask.columnId]
  if (!activeColumn) return null

  let overColumnId = overId
  if (!board.columns[overId]) {
    const overTask = board.tasks[overId]
    if (!overTask) return null
    overColumnId = overTask.columnId
  }

  const overColumn = board.columns[overColumnId]
  if (!overColumn) return null

  const activeIndex = activeColumn.taskIds.indexOf(activeId)
  let overIndex = overColumn.taskIds.indexOf(overId)
  if (overIndex < 0) overIndex = overColumn.taskIds.length

  if (activeTask.columnId === overColumnId && activeIndex === overIndex) return null

  if (activeTask.columnId === overColumnId) {
    const newTaskIds = arrayMove(overColumn.taskIds, activeIndex, overIndex)
    return {
      ...board,
      columns: {
        ...board.columns,
        [overColumnId]: { ...overColumn, taskIds: newTaskIds },
      },
    }
  }

  const newActiveTaskIds = activeColumn.taskIds.filter((id) => id !== activeId)
  const newOverTaskIds = [...overColumn.taskIds]
  newOverTaskIds.splice(overIndex, 0, activeId)

  return {
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
  }
}
