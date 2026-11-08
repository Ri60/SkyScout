import { beforeAll, describe, expect, it } from 'vitest'
import { buildSky } from './skyView'
import {
  DEFAULT_FILTERS,
  filterCatalogue,
  makeCatalogue,
  type SkyObject
} from './catalogue'
let objects: SkyObject[]
beforeAll(() => {
  objects = makeCatalogue(
    buildSky(new Date('2026-11-25T07:40:00Z'), 43.8971, -78.8658)
  )
})
describe('full observing catalogue', () => {
  it('offers the full above-horizon catalogue instead of limiting browsing to three targets', () => {
    expect(objects.length).toBeGreaterThan(1000)
    expect(new Set(objects.map((object) => object.kind))).toEqual(
      new Set(['planet', 'moon', 'star', 'constellation'])
    )
    expect(new Set(objects.map((object) => object.id)).size).toBe(
      objects.length
    )
    expect(objects.every((object) => object.altitude > 0)).toBe(true)
  })
  it('separates planets, Moon, stars and constellation figures', () => {
    for (const category of [
      'planet',
      'moon',
      'star',
      'constellation'
    ] as const) {
      const matches = filterCatalogue(objects, { ...DEFAULT_FILTERS, category })
      expect(matches.length).toBeGreaterThan(0)
      expect(matches.every((object) => object.kind === category)).toBe(true)
    }
    expect(
      filterCatalogue(objects, { ...DEFAULT_FILTERS, category: 'planet' }).some(
        (object) => object.name === 'Moon'
      )
    ).toBe(false)
  })
  it('combines search, naked-eye, category and minimum-altitude filters, then sorts by height', () => {
    const matches = filterCatalogue(objects, {
      ...DEFAULT_FILTERS,
      category: 'star',
      nakedEye: true,
      query: 'Sirius',
      minAltitude: 20,
      sort: 'altitude'
    })
    expect(matches).toHaveLength(1)
    expect(matches[0].name).toBe('Sirius')
    expect(
      filterCatalogue(objects, {
        ...DEFAULT_FILTERS,
        query: 'Sirius',
        minAltitude: 80
      })
    ).toHaveLength(0)
    const sorted = filterCatalogue(objects, {
      ...DEFAULT_FILTERS,
      sort: 'altitude'
    })
    expect(sorted[0].altitude).toBeGreaterThanOrEqual(sorted[1].altitude)
  })
  it('does not promise naked-eye visibility in daylight or for a faint planet', () => {
    const daylight = makeCatalogue(
      buildSky(new Date('2026-11-25T17:00:00Z'), 43.8971, -78.8658)
    )
    expect(
      filterCatalogue(daylight, { ...DEFAULT_FILTERS, nakedEye: true })
    ).toHaveLength(0)
    const faint: SkyObject = {
      id: 'neptune',
      name: 'Neptune',
      kind: 'planet',
      altitude: 40,
      azimuth: 90,
      magnitude: 7.8,
      description: '',
      nakedEye: false
    }
    expect(
      filterCatalogue([faint], {
        ...DEFAULT_FILTERS,
        category: 'planet',
        nakedEye: true
      })
    ).toHaveLength(0)
  })
})
