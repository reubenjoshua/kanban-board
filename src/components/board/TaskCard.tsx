import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Label, Task } from '../../store/types.ts'
import { cn } from '../../utils/cn.ts'

type TaskCardContentProps = {
  task: Task
  labels: Record<string, Label>
}

export function TaskCardContent({ task, labels }: TaskCardContentProps) {
  return (
    <>
      <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-100">
        {task.title}
      </p>
      {task.description.trim() && (
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      )}
      {task.labelIds.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {task.labelIds.map((labelId) => {
            const label = labels[labelId]
            if (!label) return null
            return (
              <span
                key={label.id}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[11px] font-medium',
                  label.color,
                )}
              >
                {label.name}
              </span>
            )
          })}
        </div>
      )}
    </>
  )
}

type SortableTaskCardProps = {
  task: Task
  labels: Record<string, Label>
  dragDisabled?: boolean
  onClick?: () => void
}

export function SortableTaskCard({
  task,
  labels,
  dragDisabled = false,
  onClick,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: dragDisabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'opacity-30')}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'task-card',
          dragDisabled ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing',
        )}
        {...(dragDisabled ? {} : { ...attributes, ...listeners })}
      >
        <TaskCardContent task={task} labels={labels} />
      </button>
    </div>
  )
}

type TaskCardOverlayProps = {
  task: Task
  labels: Record<string, Label>
}

export function TaskCardOverlay({ task, labels }: TaskCardOverlayProps) {
  return (
    <div
      className="w-[17.5rem] rotate-[2deg] rounded-xl border-2 border-brand-400 bg-white p-3.5 dark:bg-slate-800 dark:border-brand-500"
      style={{ boxShadow: 'var(--shadow-modal)' }}
    >
      <TaskCardContent task={task} labels={labels} />
    </div>
  )
}
