
import { describe, it, expect } from 'vitest'
import { getVisibleObjects } from './astronomy'

describe('SkyScout Astronomy Tests', () => {

  it('rejects invalid latitude', () => {
    expect(() =>
      getVisibleObjects(
        new Date('2026-11-04T02:00:00Z'),
        100,
        -79.3832
      )
    ).toThrow('Invalid observation date or coordinates.')
  })

  it('rejects invalid longitude', () => {
    expect(() =>
      getVisibleObjects(
        new Date('2026-11-04T02:00:00Z'),
        43.6532,
        -200
      )
    ).toThrow('Invalid observation date or coordinates.')
  })

  it('does not recommend nighttime targets during daytime', () => {
    // November 3, 2026 at noon in Toronto (EST)
    const date = new Date('2026-11-03T17:00:00Z')

    const results = getVisibleObjects(
      date,
      43.6532,
      -79.3832
    )

    expect(results).toEqual([])
  })

  it('returns valid object information for a nighttime mission', () => {
    // November 3, 2026 at 9 PM in Toronto (EST)
    const date = new Date('2026-11-04T02:00:00Z')

    const results = getVisibleObjects(
      date,
      43.6532,
      -79.3832
    )

    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThanOrEqual(3)

    for (const target of results) {
      expect(target.name).toBeTruthy()
      expect(target.altitude).toBeGreaterThanOrEqual(20)
      expect(target.azimuth).toBeGreaterThanOrEqual(0)
      expect(target.azimuth).toBeLessThan(360)
    }
  })

})
