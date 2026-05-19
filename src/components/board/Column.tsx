import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState, type FormEvent } from 'react'
import type { Board, Column as ColumnType } from '../../store/types.ts'
import { useKanbanStore } from '../../store/kanbanStore.ts'
import { cn } from '../../utils/cn.ts'
import { SortableTaskCard } from './TaskCard.tsx'

type ColumnProps = {
  column: ColumnType
  board: Board
  visibleTaskIds: string[]
  isSearching: boolean
  dragDisabled?: boolean
  onTaskClick?: (taskId: string) => void
}

export function Column({
  column,
  board,
  visibleTaskIds,
  isSearching,
  dragDisabled = false,
  onTaskClick,
}: ColumnProps) {
  const addTask = useKanbanStore((s) => s.addTask)
  const renameColumn = useKanbanStore((s) => s.renameColumn)
  const deleteColumn = useKanbanStore((s) => s.deleteColumn)
  const columnCount = useKanbanStore((s) => {
    const b = s.activeBoardId ? s.boards[s.activeBoardId] : null
    return b?.columnIds.length ?? 0
  })

  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')

  const { setNodeRef } = useDroppable({ id: column.id })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    addTask(column.id, trimmed)
    setTitle('')
    setIsAdding(false)
  }

  const handleRename = () => {
    const name = window.prompt('Rename column', column.title)
    if (name?.trim()) renameColumn(column.id, name.trim())
  }

  const handleDelete = () => {
    if (columnCount <= 1) {
      window.alert('You need at least one column.')
      return
    }
    const taskCount = column.taskIds.length
    const message =
      taskCount > 0
        ? `Delete column "${column.title}" and its ${taskCount} task(s)?`
        : `Delete column "${column.title}"?`
    if (window.confirm(message)) deleteColumn(column.id)
  }

  return (
    <section className="kanban-column">
      <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
            {column.title}
          </h2>
          <div className="mt-1.5 flex gap-3">
            <button
              type="button"
              onClick={handleRename}
              className="text-xs font-medium text-slate-400 transition hover:text-brand-600"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs font-medium text-slate-400 transition hover:text-rose-500"
            >
              Delete
            </button>
          </div>
        </div>
        <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 px-2 text-xs font-semibold text-brand-700">
          {isSearching ? visibleTaskIds.length : column.taskIds.length}
        </span>
      </div>

      <SortableContext items={visibleTaskIds} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          className="flex min-h-[5rem] flex-1 flex-col gap-2.5 overflow-y-auto py-1"
        >
          {visibleTaskIds.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-8 text-center text-sm text-slate-400 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-500">
              {isSearching ? 'No matching tasks' : 'Drop tasks here'}
            </li>
          ) : (
            visibleTaskIds.map((taskId) => {
              const task = board.tasks[taskId]
              if (!task) return null
              return (
                <li key={task.id}>
                  <SortableTaskCard
                    task={task}
                    labels={board.labels}
                    dragDisabled={dragDisabled}
                    onClick={() => onTaskClick?.(task.id)}
                  />
                </li>
              )
            })
          )}
        </ul>
      </SortableContext>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="input-field !py-2"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary !px-3 !py-1.5">
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setTitle('')
              }}
              className="btn-ghost !px-3 !py-1.5"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className={cn(
            'mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium text-slate-500 transition',
            'hover:bg-brand-50 hover:text-brand-700',
          )}
        >
          <span className="text-base leading-none">+</span>
          Add task
        </button>
      )}
    </section>
  )
}
