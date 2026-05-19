import { useKanbanStore } from "../store/kanbanStore";
import type { Board } from "../store/types";

export function useActiveBoard(): Board | null {
    const activeBoardId = useKanbanStore((s) => s.activeBoardId)
    const board = useKanbanStore((s) => 
        activeBoardId ? s.boards[activeBoardId] : undefined,
)
return board ?? null
}