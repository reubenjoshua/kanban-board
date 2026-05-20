import { useEffect } from 'react'

type Options = {
  onEscape?: () => void
  onFocusSearch?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onEscape,
  onFocusSearch,
  enabled = true,
}: Options) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if (e.key === 'Escape') {
        onEscape?.()
        return
      }

      if (e.key === '/' && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        onFocusSearch?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onEscape, onFocusSearch])
}
