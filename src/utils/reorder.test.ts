import { describe, expect, it } from 'vitest'
import { arrayMove } from './reorder.ts'

describe('arrayMove', () => {
  it('moves an item to a new index', () => {
    expect(arrayMove(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
  })

  it('returns unchanged order when indices match', () => {
    expect(arrayMove(['a', 'b'], 1, 1)).toEqual(['a', 'b'])
  })
})
