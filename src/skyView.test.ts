import { describe, expect, it } from 'vitest'
import { buildSky, project } from './skyView'
import { getVisibleObjects } from './astronomy'

describe('location-specific sky projection', () => {
  it('centres an object in the viewing direction and hides objects behind the camera', () => {
    expect(project({ altitude: 25, azimuth: 180 }, 180, 25, 100)).toEqual({ x: 480, y: 270 })
    expect(project({ altitude: 0, azimuth: 0 }, 180, 0, 100)).toBeNull()
    expect(project({ altitude: 0, azimuth: 90 }, 0, 0, 100)?.x ?? 1000).toBeGreaterThan(480)
  })
  it('moves stars with time and changes the sky with observer location', () => {
    const date = new Date('2026-11-25T07:40:00Z')
    const sky = buildSky(date, 43.8971, -78.8658)
    const later = buildSky(new Date(date.getTime() + 30 * 60000), 43.8971, -78.8658)
    const elsewhere = buildSky(date, -33.86, 151.2)
    expect(sky.stars.length).toBeGreaterThan(1000)
    expect(later.namedStars.Sirius.azimuth).not.toBeCloseTo(sky.namedStars.Sirius.azimuth, 1)
    expect(elsewhere.namedStars.Sirius.altitude).not.toBeCloseTo(sky.namedStars.Sirius.altitude, 1)
    expect(sky.planets.some(body => body.name === 'Jupiter')).toBe(true)
    expect(sky.stars.every(star => star.altitude > 0)).toBe(true)
  })
  it('does not alter mission recommendations when rendering its large star catalogue', () => {
    const date = new Date('2026-11-25T07:40:00Z')
    const before = getVisibleObjects(date, 43.8971, -78.8658)
    buildSky(date, 43.8971, -78.8658)
    expect(getVisibleObjects(date, 43.8971, -78.8658)).toEqual(before)
  })
})
