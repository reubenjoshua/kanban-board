import { describe, expect, it } from 'vitest'
import { getWipLimit, isOverWipLimit } from './wipLimit.ts'

describe('wipLimit', () => {
  it('suggests limit for in progress', () => {
    expect(getWipLimit('In Progress')).toBe(5)
  })

  it('has no limit for todo', () => {
    expect(getWipLimit('To Do')).toBeNull()
  })

  it('flags over limit', () => {
    expect(isOverWipLimit(6, 5)).toBe(true)
    expect(isOverWipLimit(5, 5)).toBe(false)
  })
})
