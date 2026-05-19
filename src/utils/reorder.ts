export function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const result = [...array]
    const [removed] = result.splice(from, 1)
    if (removed === undefined) return array
    result.splice(to, 0, removed)
    return result
}