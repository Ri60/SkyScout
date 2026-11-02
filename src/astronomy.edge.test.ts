
import { describe, it, expect } from 'vitest'
import { getVisibleObjects } from './astronomy'

describe('SkyScout Astronomy Edge Cases', () => {
  it('rejects an invalid date', () => {
    expect(() =>
      getVisibleObjects(
        new Date('invalid'),
        43.65,
        -79.38
      )
    ).toThrow('Invalid observation date or coordinates.')
  })

  it('rejects non-finite coordinates', () => {
    const date = new Date('2026-11-04T02:00:00Z')

    expect(() =>
      getVisibleObjects(date, Infinity, -79.38)
    ).toThrow('Invalid observation date or coordinates.')

    expect(() =>
      getVisibleObjects(date, 43.65, NaN)
    ).toThrow('Invalid observation date or coordinates.')
  })

  it('returns no more than three targets', () => {
    const results = getVisibleObjects(
      new Date('2026-11-04T02:00:00Z'),
      43.65,
      -79.38
    )

    expect(results.length).toBeLessThanOrEqual(3)
  })
})
