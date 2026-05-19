import { AnimatePresence, motion } from 'framer-motion'
import { useCelebrationStore } from '../../store/celebrationStore.ts'
import type { CelebrationVariant } from '../../utils/columnCelebration.ts'
import { cn } from '../../utils/cn.ts'

const variantStyles: Record<
  CelebrationVariant,
  { container: string; icon: string; accent: string }
> = {
  progress: {
    container:
      'border-brand-200/80 bg-gradient-to-br from-brand-50 to-white dark:border-brand-500/30 dark:from-brand-950/80 dark:to-slate-800',
    icon: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300',
    accent: 'text-brand-600 dark:text-brand-400',
  },
  done: {
    container:
      'border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-500/30 dark:from-emerald-950/60 dark:to-slate-800',
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
}

export function CelebrationToast() {
  const current = useCelebrationStore((s) => s.current)
  const dismiss = useCelebrationStore((s) => s.dismiss)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[100] flex justify-center px-4">
      <AnimatePresence>
        {current && (
          <motion.div
            key={`${current.variant}-${current.title}`}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: 'spring', damping: 18, stiffness: 320 },
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.92,
              transition: { duration: 0.2 },
            }}
            className={cn(
              'pointer-events-auto flex max-w-sm items-center gap-4 rounded-2xl border p-4 shadow-lg',
              'dark:shadow-black/40',
              variantStyles[current.variant].container,
            )}
            style={{ boxShadow: 'var(--shadow-modal)' }}
          >
            <motion.span
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl',
                variantStyles[current.variant].icon,
              )}
              initial={{ scale: 0, rotate: -20 }}
              animate={{
                scale: 1,
                rotate: 0,
                transition: { type: 'spring', delay: 0.1, stiffness: 400 },
              }}
            >
              {current.emoji}
            </motion.span>

            <div className="min-w-0 flex-1 text-left">
              <p
                className={cn(
                  'text-base font-bold tracking-tight text-slate-900 dark:text-slate-50',
                )}
              >
                {current.title}
              </p>
              <p
                className={cn(
                  'mt-0.5 text-sm font-medium',
                  variantStyles[current.variant].accent,
                )}
              >
                {current.message}
              </p>
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
              aria-label="Dismiss"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M4.47 4.47a.75.75 0 0 1 1.06 0L8 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L9.06 8l2.47 2.47a.75.75 0 1 1-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 1 1-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 0 1 0-1.06z" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

