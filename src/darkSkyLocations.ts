
import { DARK_SKY_DIRECTORY } from './darkSkyDirectory'
import { DARK_SKY_COORDINATES } from './darkSkyCoordinates'
import type { DarkSkyLocation } from './darkSkyTypes'

export const DARK_SKY_LOCATIONS: DarkSkyLocation[] =
  DARK_SKY_DIRECTORY.flatMap((entry): DarkSkyLocation[] => {
    const coordinates = DARK_SKY_COORDINATES[entry.id]

    if (!coordinates) {
      return []
    }

    return [
      {
        ...entry,
        ...coordinates,
      },
    ]
  })
