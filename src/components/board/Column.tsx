import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState, type FormEvent } from 'react'
import { TASKS_VISIBLE_LIMIT } from '../../constants.ts'
import { useDialogStore } from '../../store/dialogStore.ts'
import { useKanbanStore } from '../../store/kanbanStore.ts'
import { useUiStore } from '../../store/uiStore.ts'
import type { Board, Column as ColumnType } from '../../store/types.ts'
import { isDoneColumn } from '../../utils/columnMatch.ts'
import { cn } from '../../utils/cn.ts'
import { getWipLimit, isOverWipLimit } from '../../utils/wipLimit.ts'
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
  const prompt = useDialogStore((s) => s.prompt)
  const confirm = useDialogStore((s) => s.confirm)
  const addTask = useKanbanStore((s) => s.addTask)
  const renameColumn = useKanbanStore((s) => s.renameColumn)
  const deleteColumn = useKanbanStore((s) => s.deleteColumn)
  const clearDoneColumn = useKanbanStore((s) => s.clearDoneColumn)
  const columnCount = useKanbanStore((s) => {
    const b = s.activeBoardId ? s.boards[s.activeBoardId] : null
    return b?.columnIds.length ?? 0
  })

  const compactView = useUiStore((s) => s.compactView)
  const collapsed = useUiStore((s) =>
    s.isColumnCollapsed(board.id, column.id),
  )
  const toggleCollapsed = useUiStore((s) => s.toggleColumnCollapsed)

  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [showAll, setShowAll] = useState(false)

  const { setNodeRef } = useDroppable({ id: column.id })

  const taskCount = isSearching ? visibleTaskIds.length : column.taskIds.length
  const wipLimit = getWipLimit(column.title)
  const overWip = isOverWipLimit(taskCount, wipLimit)
  const isDone = isDoneColumn(column.title)

  const displayedIds =
    showAll || isSearching
      ? visibleTaskIds
      : visibleTaskIds.slice(0, TASKS_VISIBLE_LIMIT)
  const hiddenCount = visibleTaskIds.length - displayedIds.length

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    addTask(column.id, trimmed)
    setTitle('')
    setIsAdding(false)
  }

  const handleRename = async () => {
    const name = await prompt({ title: 'Rename column', defaultValue: column.title })
    if (name) renameColumn(column.id, name)
  }

  const handleDelete = async () => {
    if (columnCount <= 1) {
      await confirm({
        title: 'Cannot delete',
        message: 'You need at least one column.',
        confirmLabel: 'OK',
      })
      return
    }
    const taskCountMsg = column.taskIds.length
    const message =
      taskCountMsg > 0
        ? `Delete column "${column.title}" and its ${taskCountMsg} task(s)?`
        : `Delete column "${column.title}"?`
    const ok = await confirm({
      title: 'Delete column',
      message,
      destructive: true,
      confirmLabel: 'Delete',
    })
    if (ok) deleteColumn(column.id)
  }

  const handleClearDone = async () => {
    if (!isDone || column.taskIds.length === 0) return
    const ok = await confirm({
      title: 'Clear Done',
      message: `Remove all ${column.taskIds.length} completed task(s)?`,
      destructive: true,
      confirmLabel: 'Clear',
    })
    if (ok) clearDoneColumn()
  }

  return (
    <section
      className={cn(
        'kanban-column',
        collapsed && 'kanban-column--collapsed',
        compactView && 'kanban-column--compact',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-700">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleCollapsed(board.id, column.id)}
              className="shrink-0 rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              aria-label={collapsed ? 'Expand column' : 'Collapse column'}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              <svg
                viewBox="0 0 16 16"
                className={cn('h-4 w-4 transition', collapsed && '-rotate-90')}
                fill="currentColor"
                aria-hidden
              >
                <path d="M6 4l4 4-4 4V4z" />
              </svg>
            </button>
            <h2 className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              {column.title}
            </h2>
          </div>
          {!collapsed && (
            <div className="mt-1.5 flex flex-wrap gap-3">
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
              {isDone && column.taskIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearDone}
                  className="text-xs font-medium text-slate-400 transition hover:text-amber-600"
                >
                  Clear done
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={cn(
              'flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold',
              overWip
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300',
            )}
            title={wipLimit ? `WIP limit: ${wipLimit}` : undefined}
          >
            {taskCount}
            {wipLimit ? `/${wipLimit}` : ''}
          </span>
          {overWip && (
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
              Over WIP
            </span>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          <SortableContext
            items={displayedIds}
            strategy={verticalListSortingStrategy}
          >
            <ul
              ref={setNodeRef}
              className="flex min-h-[5rem] flex-1 flex-col gap-2.5 overflow-y-auto py-1"
            >
              {displayedIds.length === 0 ? (
                <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-8 text-center text-sm text-slate-400 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-500">
                  {isSearching
                    ? 'No matching tasks'
                    : isDone
                      ? 'Completed tasks land here — drag cards from other columns when finished.'
                      : 'Drop tasks here'}
                </li>
              ) : (
                displayedIds.map((taskId) => {
                  const task = board.tasks[taskId]
                  if (!task) return null
                  return (
                    <li key={task.id}>
                      <SortableTaskCard
                        task={task}
                        labels={board.labels}
                        compact={compactView}
                        dragDisabled={dragDisabled}
                        onClick={() => onTaskClick?.(task.id)}
                      />
                    </li>
                  )
                })
              )}
            </ul>
          </SortableContext>

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-2 w-full rounded-lg py-2 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30"
            >
              Show {hiddenCount} more
            </button>
          )}

          {showAll && visibleTaskIds.length > TASKS_VISIBLE_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="mt-1 w-full rounded-lg py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700"
            >
              Show less
            </button>
          )}

          {isAdding ? (
            <form
              onSubmit={handleSubmit}
              className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-700"
            >
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
                'hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/30 dark:hover:text-brand-400',
              )}
            >
              <span className="text-base leading-none">+</span>
              Add task
            </button>
          )}
        </>
      )}
    </section>
  )
}
