import type { SkyPoint, buildSky } from './skyView'

export type ObjectKind = 'planet' | 'moon' | 'star' | 'constellation'
export type Category = 'all' | ObjectKind
export type SkyObject = SkyPoint & {
  id: string
  name: string
  kind: ObjectKind
  magnitude?: number
  illumination?: number
  partial?: boolean
  description: string
  nakedEye: boolean
}
export type CatalogueFilters = {
  category: Category
  nakedEye: boolean
  query: string
  minAltitude: number
  sort: 'brightness' | 'altitude' | 'name'
}
export const DEFAULT_FILTERS: CatalogueFilters = {
  category: 'all',
  nakedEye: false,
  query: '',
  minAltitude: 0,
  sort: 'brightness'
}
export const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All objects',
  planet: 'Planets',
  moon: 'Moon',
  star: 'Stars',
  constellation: 'Constellations'
}

/** Candidate visibility only: the catalogue does not measure local conditions. */
export function makeCatalogue(sky: ReturnType<typeof buildSky>): SkyObject[] {
  const dark = sky.sunAltitude < -18
  return [
    ...sky.planets.map((body) => ({
      id: body.name.toLowerCase(),
      name: body.name,
      kind: (body.name === 'Moon' ? 'moon' : 'planet') as ObjectKind,
      altitude: body.altitude,
      azimuth: body.azimuth,
      magnitude: body.magnitude,
      illumination: body.moon,
      nakedEye: dark && body.magnitude <= 6,
      description:
        body.name === 'Moon'
          ? `${Math.round((body.moon ?? 0) * 100)}% illuminated. Look for its bright shape; binoculars reveal more surface detail.`
          : body.name === 'Uranus' || body.name === 'Neptune'
            ? 'A distant planet. Optical aid is normally needed to identify it reliably.'
            : 'Look for a steady point of light. A telescope reveals details you cannot see with your eyes alone.'
    })),
    ...sky.stars.map((star) => ({
      ...star,
      kind: 'star' as const,
      nakedEye: dark && star.magnitude <= 6,
      description: star.name.startsWith('HIP ')
        ? 'A star in the Hipparcos catalogue. Look in the indicated direction and altitude.'
        : 'A named star in your sky. Use its direction and height to locate it among neighbouring stars.'
    })),
    ...sky.constellations.map((group) => ({
      id: group.id,
      name: group.name,
      kind: 'constellation' as const,
      altitude: group.altitude,
      azimuth: group.azimuth,
      partial: group.partial,
      nakedEye: dark,
      description: group.partial
        ? 'Part of this star pattern is above the horizon. The guide position points to its highest visible vertex.'
        : 'The catalogue’s line figure is above the horizon. The guide position points to its highest vertex.'
    }))
  ]
}

export function filterCatalogue(
  objects: SkyObject[],
  filters: CatalogueFilters
) {
  const query = filters.query.trim().toLocaleLowerCase()
  return objects
    .filter(
      (object) =>
        (filters.category === 'all' || object.kind === filters.category) &&
        (!filters.nakedEye || object.nakedEye) &&
        object.altitude >= filters.minAltitude &&
        (!query ||
          `${object.name} ${object.kind}`.toLocaleLowerCase().includes(query))
    )
    .sort((a, b) =>
      filters.sort === 'name'
        ? a.name.localeCompare(b.name)
        : filters.sort === 'altitude'
          ? b.altitude - a.altitude || a.name.localeCompare(b.name)
          : (a.magnitude ?? Infinity) - (b.magnitude ?? Infinity) ||
            a.name.localeCompare(b.name)
    )
}

export function compassDirection(azimuth: number) {
  const names = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW'
  ]
  return names[Math.round((((azimuth % 360) + 360) % 360) / 22.5) % 16]
}
