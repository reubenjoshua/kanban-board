import { describe, expect, it } from 'vitest'
import { taskMatchesSearch } from './taskSearch.ts'
import type { Task } from '../store/types.ts'

const task: Task = {
  id: 't1',
  columnId: 'c1',
  title: 'Build API',
  description: 'REST endpoints',
  labelIds: [],
  createdAt: 0,
  dueDate: null,
}

describe('taskMatchesSearch', () => {
  it('matches empty query', () => {
    expect(taskMatchesSearch(task, '')).toBe(true)
  })

  it('matches title', () => {
    expect(taskMatchesSearch(task, 'api')).toBe(true)
  })

  it('matches description', () => {
    expect(taskMatchesSearch(task, 'rest')).toBe(true)
  })

  it('returns false when no match', () => {
    expect(taskMatchesSearch(task, 'design')).toBe(false)
  })
})
