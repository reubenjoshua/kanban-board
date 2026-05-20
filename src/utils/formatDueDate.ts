export function formatDueDate(isoDate: string): string {
  const date = new Date(isoDate + 'T12:00:00')
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function isDueDateOverdue(isoDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(isoDate + 'T12:00:00')
  due.setHours(0, 0, 0, 0)
  return due < today
}
