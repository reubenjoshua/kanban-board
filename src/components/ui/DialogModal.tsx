import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useDialogStore } from '../../store/dialogStore.ts'
import { cn } from '../../utils/cn.ts'

export function DialogModal() {
  const current = useDialogStore((s) => s.current)
  const close = useDialogStore((s) => s.close)
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!current) return
    if (current.type === 'prompt') {
      setValue(current.defaultValue)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [current])

  if (!current) return null

  const handlePromptSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (current.type !== 'prompt') return
    const trimmed = value.trim()
    current.resolve(trimmed || null)
    useDialogStore.setState({ current: null })
  }

  const handleConfirm = (confirmed: boolean) => {
    if (current.type !== 'confirm') return
    current.resolve(confirmed)
    useDialogStore.setState({ current: null })
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/60"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="modal-panel w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {current.type === 'prompt' ? (
          <form onSubmit={handlePromptSubmit}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {current.title}
              </h2>
            </div>
            <div className="px-6 py-4">
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={current.placeholder}
                className="input-field"
              />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={close} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {current.confirmLabel ?? 'OK'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="modal-header">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {current.title}
              </h2>
            </div>
            <p className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
              {current.message}
            </p>
            <div className="modal-footer">
              <button type="button" onClick={close} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirm(true)}
                className={cn(
                  current.destructive ? 'btn-danger' : 'btn-primary',
                )}
              >
                {current.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
