import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const UI_STORAGE_KEY = 'kanban-ui-v1'

type UiState = {
  compactView: boolean
  collapsedByBoard: Record<string, string[]>
  toggleCompactView: () => void
  isColumnCollapsed: (boardId: string, columnId: string) => boolean
  toggleColumnCollapsed: (boardId: string, columnId: string) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      compactView: false,
      collapsedByBoard: {},

      toggleCompactView: () => set((s) => ({ compactView: !s.compactView })),

      isColumnCollapsed: (boardId, columnId) => {
        const list = get().collapsedByBoard[boardId] ?? []
        return list.includes(columnId)
      },

      toggleColumnCollapsed: (boardId, columnId) => {
        set((s) => {
          const current = s.collapsedByBoard[boardId] ?? []
          const next = current.includes(columnId)
            ? current.filter((id) => id !== columnId)
            : [...current, columnId]
          return {
            collapsedByBoard: { ...s.collapsedByBoard, [boardId]: next },
          }
        })
      },
    }),
    {
      name: UI_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
