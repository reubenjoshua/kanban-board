import { create } from 'zustand'
import type { CelebrationPayload } from '../utils/columnCelebration.ts'

type CelebrationState = {
  current: CelebrationPayload | null
  show: (payload: CelebrationPayload) => void
  dismiss: () => void
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null

export const useCelebrationStore = create<CelebrationState>((set) => ({
  current: null,

  show: (payload) => {
    if (dismissTimer) clearTimeout(dismissTimer)
    set({ current: payload })
    dismissTimer = setTimeout(() => {
      set({ current: null })
      dismissTimer = null
    }, 3200)
  },

  dismiss: () => {
    if (dismissTimer) clearTimeout(dismissTimer)
    dismissTimer = null
    set({ current: null })
  },
}))
