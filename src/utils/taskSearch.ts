import type { Task } from '../store/types.ts'

export function taskMatchesSearch(task: Task | undefined, query: string): boolean {
  if (!task) return false
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    task.title.toLowerCase().includes(q) ||
    task.description.toLowerCase().includes(q)
  )
}
