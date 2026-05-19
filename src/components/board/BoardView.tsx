import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useMemo, useRef, useState } from 'react'
import { useActiveBoard } from '../../hooks/useBoard.ts'
import { useCelebrationStore } from '../../store/celebrationStore.ts'
import { useKanbanStore } from '../../store/kanbanStore.ts'
import { getColumnCelebration } from '../../utils/columnCelebration.ts'
import { taskMatchesSearch } from '../../utils/taskSearch.ts'
import { cn } from '../../utils/cn.ts'
import { EmptyState } from '../ui/EmptyState.tsx'
import { DragOverlayCard } from './DragOverlayCard.tsx'
import { Column } from './Column.tsx'

type BoardViewProps = {
  searchQuery: string
  onTaskClick?: (taskId: string) => void
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  )
}

function BoardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="4" width="6" height="16" rx="1.5" />
      <rect x="11" y="4" width="6" height="11" rx="1.5" />
      <rect x="19" y="4" width="2" height="7" rx="1" />
    </svg>
  )
}

export function BoardView({ searchQuery, onTaskClick }: BoardViewProps) {
  const board = useActiveBoard()
  const moveTask = useKanbanStore((s) => s.moveTask)
  const addColumn = useKanbanStore((s) => s.addColumn)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const sourceColumnIdRef = useRef<string | null>(null)
  const showCelebration = useCelebrationStore((s) => s.show)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const isSearching = searchQuery.trim().length > 0

  const visibleTasksByColumn = useMemo(() => {
    if (!board) return {}
    const map: Record<string, string[]> = {}
    for (const columnId of board.columnIds) {
      const column = board.columns[columnId]
      if (!column) continue
      map[columnId] = column.taskIds.filter((taskId) =>
        taskMatchesSearch(board.tasks[taskId], searchQuery),
      )
    }
    return map
  }, [board, searchQuery])

  const totalVisibleTasks = useMemo(
    () => Object.values(visibleTasksByColumn).reduce((sum, ids) => sum + ids.length, 0),
    [visibleTasksByColumn],
  )

  if (!board) {
    return (
      <EmptyState
        icon={<BoardIcon />}
        title="No board selected"
        description="Create a board from the sidebar to get started."
      />
    )
  }

  const activeTask = activeTaskId ? board.tasks[activeTaskId] : null

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string
    const task = board?.tasks[taskId]
    sourceColumnIdRef.current = task?.columnId ?? null
    setActiveTaskId(taskId)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return
    moveTask(activeId, overId)
  }

  const maybeCelebrateMove = (taskId: string) => {
    const fromColumnId = sourceColumnIdRef.current
    if (!fromColumnId) return

    const { activeBoardId, boards } = useKanbanStore.getState()
    if (!activeBoardId) return

    const freshBoard = boards[activeBoardId]
    const task = freshBoard?.tasks[taskId]
    const toColumnId = task?.columnId
    if (!toColumnId || fromColumnId === toColumnId) return

    const column = freshBoard.columns[toColumnId]
    if (!column) return

    const celebration = getColumnCelebration(column.title)
    if (celebration) showCelebration(celebration)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    const activeId = active.id as string

    if (over) {
      const overId = over.id as string
      if (activeId !== overId) {
        moveTask(activeId, overId)
      }
    }

    maybeCelebrateMove(activeId)
    sourceColumnIdRef.current = null
    setActiveTaskId(null)
  }

  const handleDragCancel = () => {
    sourceColumnIdRef.current = null
    setActiveTaskId(null)
  }

  const handleAddColumn = () => {
    const title = window.prompt('Column name', 'New Column')
    if (title?.trim()) addColumn(title.trim())
  }

  if (isSearching && totalVisibleTasks === 0) {
    return (
      <EmptyState
        icon={<SearchIcon />}
        title="No tasks found"
        description={`Nothing matches "${searchQuery.trim()}". Try another keyword.`}
      />
    )
  }

  const columnList = (
    <div className="flex gap-5 overflow-x-auto pb-2">
      {board.columnIds.map((columnId) => {
        const column = board.columns[columnId]
        if (!column) return null
        return (
          <Column
            key={column.id}
            column={column}
            board={board}
            visibleTaskIds={visibleTasksByColumn[columnId] ?? []}
            isSearching={isSearching}
            dragDisabled={isSearching}
            onTaskClick={onTaskClick}
          />
        )
      })}

      <button
        type="button"
        onClick={handleAddColumn}
        className={cn(
          'flex h-fit w-[17.5rem] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl',
          'border-2 border-dashed border-slate-300/90 bg-white/40 py-12 text-sm font-medium text-slate-500 transition',
          'hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-700',
          'dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400',
          'dark:hover:border-brand-500/50 dark:hover:bg-brand-950/30 dark:hover:text-brand-400',
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
          +
        </span>
        Add column
      </button>
    </div>
  )

  if (isSearching) {
    return columnList
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {columnList}

      <DragOverlay>
        {activeTask ? (
          <DragOverlayCard task={activeTask} labels={board.labels} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
