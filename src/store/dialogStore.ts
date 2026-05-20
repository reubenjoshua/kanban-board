import { create } from 'zustand'

type PromptRequest = {
  type: 'prompt'
  title: string
  defaultValue: string
  placeholder?: string
  confirmLabel?: string
  resolve: (value: string | null) => void
}

type ConfirmRequest = {
  type: 'confirm'
  title: string
  message: string
  confirmLabel?: string
  destructive?: boolean
  resolve: (confirmed: boolean) => void
}

type DialogRequest = PromptRequest | ConfirmRequest

type DialogState = {
  current: DialogRequest | null
  prompt: (options: {
    title: string
    defaultValue?: string
    placeholder?: string
    confirmLabel?: string
  }) => Promise<string | null>
  confirm: (options: {
    title: string
    message: string
    confirmLabel?: string
    destructive?: boolean
  }) => Promise<boolean>
  close: () => void
}

export const useDialogStore = create<DialogState>((set, get) => ({
  current: null,

  prompt: ({ title, defaultValue = '', placeholder, confirmLabel }) =>
    new Promise((resolve) => {
      set({
        current: {
          type: 'prompt',
          title,
          defaultValue,
          placeholder,
          confirmLabel,
          resolve,
        },
      })
    }),

  confirm: ({ title, message, confirmLabel, destructive }) =>
    new Promise((resolve) => {
      set({
        current: {
          type: 'confirm',
          title,
          message,
          confirmLabel,
          destructive,
          resolve,
        },
      })
    }),

  close: () => {
    const current = get().current
    if (!current) return
    if (current.type === 'prompt') current.resolve(null)
    else current.resolve(false)
    set({ current: null })
  },
}))
