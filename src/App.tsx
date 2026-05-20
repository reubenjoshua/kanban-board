import { AnimatePresence } from 'framer-motion'
import { useCallback, useRef, useState } from 'react'
import { BoardView } from './components/board/BoardView.tsx'
import { Header } from './components/layout/Header.tsx'
import { Sidebar } from './components/layout/Sidebar.tsx'
import { TaskModal } from './components/task/TaskModal.tsx'
import { CelebrationToast } from './components/ui/CelebrationToast.tsx'
import { DialogModal } from './components/ui/DialogModal.tsx'
import { useActiveBoard } from './hooks/useBoard.ts'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts'
import { useThemeSync } from './hooks/useThemeSync.ts'

function App() {
  useThemeSync()

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const board = useActiveBoard()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleEscape = useCallback(() => {
    if (selectedTaskId) {
      setSelectedTaskId(null)
      return
    }
    if (searchQuery) setSearchQuery('')
  }, [selectedTaskId, searchQuery])

  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus()
  }, [])

  useKeyboardShortcuts({
    onEscape: handleEscape,
    onFocusSearch: handleFocusSearch,
  })

  return (
    <div className="flex min-h-screen bg-sidebar text-slate-900 dark:text-slate-100">
      <Sidebar />

      <div className="main-panel">
        <Header
          ref={searchInputRef}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="board-canvas flex-1 overflow-auto px-6 py-5">
          <BoardView searchQuery={searchQuery} onTaskClick={setSelectedTaskId} />
        </main>
      </div>

      <AnimatePresence>
        {selectedTaskId && board && (
          <TaskModal
            key={selectedTaskId}
            taskId={selectedTaskId}
            board={board}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </AnimatePresence>

      <CelebrationToast />
      <DialogModal />
    </div>
  )
}

export default App
