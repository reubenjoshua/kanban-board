export type CelebrationVariant = 'progress' | 'done'

export type CelebrationPayload = {
  title: string
  message: string
  emoji: string
  variant: CelebrationVariant
}

/** Match column titles like "In Progress", "Done", etc. (case-insensitive). */
export function getColumnCelebration(columnTitle: string): CelebrationPayload | null {
  const normalized = columnTitle.trim().toLowerCase()

  if (/^(done|complete|completed|finished)$/.test(normalized)) {
    return {
      title: 'Nice work!',
      message: 'Task completed — you crushed it!',
      emoji: '🎉',
      variant: 'done',
    }
  }

  if (/^(in progress|in-progress|doing|wip|working on it)$/.test(normalized)) {
    return {
      title: 'Nice work!',
      message: 'Work in progress — keep it going!',
      emoji: '🚀',
      variant: 'progress',
    }
  }

  return null
}
