import { useActiveBoard } from '../../hooks/useBoard.ts'
import { useKanbanStore } from '../../store/kanbanStore.ts'
import { cn } from '../../utils/cn.ts'
import { ThemeToggle } from './ThemeToggle.tsx'

type HeaderProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const board = useActiveBoard()
  const renameBoard = useKanbanStore((s) => s.renameBoard)

  if (!board) return null

  const taskCount = Object.keys(board.tasks).length

  const handleRenameBoard = () => {
    const name = window.prompt('Rename board', board.name)
    if (name?.trim()) renameBoard(board.id, name.trim())
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {board.name}
            </h1>
            <button
              type="button"
              onClick={handleRenameBoard}
              className="btn-ghost !px-2 !py-1 text-xs"
              title="Rename board"
            >
              Rename
            </button>
          </div>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-brand-600 dark:text-brand-400">{taskCount}</span>
            {' '}
            {taskCount === 1 ? 'task' : 'tasks'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-md sm:w-80">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className={cn(
                'input-field !rounded-xl !py-2.5 !pl-10 !pr-10',
                searchQuery && 'ring-2 ring-brand-500/20',
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M4.47 4.47a.75.75 0 0 1 1.06 0L8 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L9.06 8l2.47 2.47a.75.75 0 1 1-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 1 1-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 0 1 0-1.06z" />
                </svg>
              </button>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
