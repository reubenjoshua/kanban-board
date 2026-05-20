import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Board } from '../../store/types.ts'
import { useDialogStore } from '../../store/dialogStore.ts'
import { useFocusTrap } from '../../hooks/useFocusTrap.ts'
import { useKanbanStore } from '../../store/kanbanStore.ts'
import { LabelPicker } from './LabelPicker.tsx'

type TaskModalProps = {
  taskId: string
  board: Board
  onClose: () => void
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 28, stiffness: 320 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: { duration: 0.15 },
  },
}

export function TaskModal({ taskId, board, onClose }: TaskModalProps) {
  const task = board.tasks[taskId]
  const updateTask = useKanbanStore((s) => s.updateTask)
  const deleteTask = useKanbanStore((s) => s.deleteTask)
  const duplicateTask = useKanbanStore((s) => s.duplicateTask)
  const confirm = useDialogStore((s) => s.confirm)

  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description)
    setLabelIds(task.labelIds)
    setDueDate(task.dueDate ?? '')
  }, [task])

  if (!task) return null

  const handleSave = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    updateTask(taskId, {
      title: trimmed,
      description: description.trim(),
      labelIds,
      dueDate: dueDate || null,
    })
    onClose()
  }

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete task',
      message: 'Delete this task? This cannot be undone.',
      destructive: true,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    deleteTask(taskId)
    onClose()
  }

  const handleDuplicate = () => {
    duplicateTask(taskId)
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-black/70"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        className="modal-panel"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <h2
              id="task-modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Edit task
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M4.47 4.47a.75.75 0 0 1 1.06 0L8 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L9.06 8l2.47 2.47a.75.75 0 1 1-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 1 1-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 0 1 0-1.06z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Labels
            </label>
            <LabelPicker
              labels={board.labels}
              selectedIds={labelIds}
              onChange={setLabelIds}
            />
          </div>
        </div>

        <div className="modal-footer">
          <div className="flex gap-2">
            <button type="button" onClick={handleDelete} className="btn-danger">
              Delete
            </button>
            <button type="button" onClick={handleDuplicate} className="btn-ghost">
              Duplicate
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="btn-primary">
              Save changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
