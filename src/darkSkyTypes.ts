
export type DarkSkyCategory =
  | 'Park'
  | 'Reserve'
  | 'Sanctuary'
  | 'Community'
  | 'Urban Place'
  | 'DarkSky Approved Lodging'

// Information taken from the official DarkSky directory.
// Coordinates are deliberately not included here.
export type DarkSkyDirectoryEntry = {
  id: string
  name: string
  region: string
  description: string
  category: DarkSkyCategory
  officialUrl: string
}

// Coordinates are maintained separately for map calculations.
export type DarkSkyCoordinates = {
  latitude: number
  longitude: number
}

// Combined record used by the map and distance calculator.
export type DarkSkyLocation = DarkSkyDirectoryEntry &
  DarkSkyCoordinates
