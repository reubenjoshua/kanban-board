import { describe, expect, it } from 'vitest'
import { getColumnCelebration } from './columnCelebration.ts'

describe('getColumnCelebration', () => {
  it('detects done columns', () => {
    expect(getColumnCelebration('Done')?.variant).toBe('done')
  })

  it('detects in progress columns', () => {
    expect(getColumnCelebration('In Progress')?.variant).toBe('progress')
  })

  it('returns null for other columns', () => {
    expect(getColumnCelebration('Backlog')).toBeNull()
  })
})
