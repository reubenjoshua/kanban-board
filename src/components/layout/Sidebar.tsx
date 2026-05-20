import { motion } from 'framer-motion'
import type { MouseEvent } from 'react'
import { useDialogStore } from '../../store/dialogStore.ts'
import { useKanbanStore } from '../../store/kanbanStore.ts'
import { cn } from '../../utils/cn.ts'
import { SidebarThemeToggle } from './ThemeToggle.tsx'

export function Sidebar() {
  const boardOrder = useKanbanStore((s) => s.boardOrder)
  const boards = useKanbanStore((s) => s.boards)
  const activeBoardId = useKanbanStore((s) => s.activeBoardId)
  const setActiveBoard = useKanbanStore((s) => s.setActiveBoard)
  const addBoard = useKanbanStore((s) => s.addBoard)
  const renameBoard = useKanbanStore((s) => s.renameBoard)
  const deleteBoard = useKanbanStore((s) => s.deleteBoard)
  const prompt = useDialogStore((s) => s.prompt)
  const confirm = useDialogStore((s) => s.confirm)

  const handleNewBoard = async () => {
    const name = await prompt({ title: 'Board name', defaultValue: 'Untitled Board' })
    if (name) addBoard(name)
  }

  const handleRename = async (
    e: MouseEvent,
    boardId: string,
    currentName: string,
  ) => {
    e.stopPropagation()
    const name = await prompt({ title: 'Rename board', defaultValue: currentName })
    if (name) renameBoard(boardId, name)
  }

  const handleDelete = async (
    e: MouseEvent,
    boardId: string,
    boardName: string,
  ) => {
    e.stopPropagation()
    if (boardOrder.length <= 1) {
      await confirm({
        title: 'Cannot delete',
        message: 'You need at least one board.',
        confirmLabel: 'OK',
      })
      return
    }
    const ok = await confirm({
      title: 'Delete board',
      message: `Delete board "${boardName}"? This cannot be undone.`,
      destructive: true,
      confirmLabel: 'Delete',
    })
    if (ok) deleteBoard(boardId)
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-sidebar px-4 py-5 text-slate-300">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 text-white"
            aria-hidden
          >
            <rect x="3" y="5" width="5" height="14" rx="1.5" fill="currentColor" opacity="0.9" />
            <rect x="10" y="5" width="5" height="10" rx="1.5" fill="currentColor" opacity="0.7" />
            <rect x="17" y="5" width="5" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white">Kanban</p>
          <p className="text-[11px] text-slate-500">Organize your work</p>
        </div>
      </div>

      <h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Boards
      </h2>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {boardOrder.length === 0 ? (
          <p className="px-3 py-2 text-sm text-slate-500">No boards yet.</p>
        ) : (
          boardOrder.map((boardId) => {
            const board = boards[boardId]
            if (!board) return null
            const isActive = boardId === activeBoardId
            return (
              <motion.div
                key={boardId}
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className={cn(
                  'group flex items-center gap-0.5 rounded-lg transition',
                  isActive ? 'bg-sidebar-active' : 'hover:bg-sidebar-hover',
                )}
              >
                <button
                  type="button"
                  onClick={() => setActiveBoard(boardId)}
                  className={cn(
                    'min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm transition',
                    isActive ? 'font-medium text-white' : 'text-slate-400 hover:text-slate-200',
                  )}
                >
                  {board.name}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRename(e, boardId, board.name)}
                  className="rounded-md p-1.5 text-slate-500 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
                  title="Rename"
                  aria-label={`Rename ${board.name}`}
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M11.5 1.5a1.5 1.5 0 0 1 2.12 2.12L5.62 11.62 3 12.5l.88-2.62L11.5 1.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, boardId, board.name)}
                  className="mr-1 rounded-md p-1.5 text-slate-500 opacity-0 transition hover:bg-rose-500/20 hover:text-rose-400 group-hover:opacity-100"
                  title="Delete"
                  aria-label={`Delete ${board.name}`}
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                    <path d="M5 2V1h6v1h4v2H1V2h4zm1 4h2v7H6V6zm3 0h2v7H9V6zM4 6h2v7H4V6z" />
                  </svg>
                </button>
              </motion.div>
            )
          })
        )}
      </nav>

      <div className="mt-4 space-y-2 border-t border-slate-700/60 pt-4">
        <SidebarThemeToggle />
      </div>

      <button
        type="button"
        onClick={handleNewBoard}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 py-2.5 text-sm text-slate-400 transition hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-400"
      >
        <span className="text-lg leading-none">+</span>
        New board
      </button>
    </aside>
  )
}
