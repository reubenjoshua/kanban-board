export function isDoneColumn(columnTitle: string): boolean {
  const n = columnTitle.trim().toLowerCase()
  return /^(done|complete|completed|finished)$/.test(n)
}
