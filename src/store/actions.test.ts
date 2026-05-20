import { describe, expect, it } from 'vitest'
import { createSeedBoard } from './seed.ts'
import { applyMoveTask } from './actions.ts'

describe('applyMoveTask', () => {
  it('reorders within the same column', () => {
    const board = createSeedBoard()
    const result = applyMoveTask(board, 'task-1', 'task-2')
    expect(result).not.toBeNull()
    const col = result!.columns['col-todo']
    expect(col.taskIds.indexOf('task-1')).toBe(1)
  })

  it('moves task to another column', () => {
    const board = createSeedBoard()
    const result = applyMoveTask(board, 'task-1', 'col-done')
    expect(result).not.toBeNull()
    expect(result!.tasks['task-1'].columnId).toBe('col-done')
    expect(result!.columns['col-done'].taskIds).toContain('task-1')
  })

  it('returns null for invalid task', () => {
    const board = createSeedBoard()
    expect(applyMoveTask(board, 'missing', 'task-1')).toBeNull()
  })
})
