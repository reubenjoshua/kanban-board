/** Suggested WIP limits by normalized column title (soft warning only). */
export function getWipLimit(columnTitle: string): number | null {
  const n = columnTitle.trim().toLowerCase()
  if (/^(to do|todo|backlog)$/.test(n)) return null
  if (/^(in progress|in-progress|doing|wip)$/.test(n)) return 5
  if (/^(done|complete|completed)$/.test(n)) return null
  return null
}

export function isOverWipLimit(count: number, limit: number | null): boolean {
  return limit !== null && count > limit
}
