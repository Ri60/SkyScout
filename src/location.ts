
export type LocationResult = {
  id: number
  name: string
  latitude: number
  longitude: number
  timezone: string
}

type GeocodingResult = {
  id: number
  name: string
  admin1?: string
  country?: string
  latitude: number
  longitude: number
  timezone: string
}

type GeocodingResponse = {
  results?: GeocodingResult[]
}

export async function searchLocations(
  city: string
): Promise<LocationResult[]> {
  const query = city.trim()

  if (!query) {
    throw new Error('Please enter a city.')
  }

  const url = new URL(
    'https://geocoding-api.open-meteo.com/v1/search'
  )

  url.searchParams.set('name', query)
  url.searchParams.set('count', '10')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      'Could not connect to the location service.'
    )
  }

  const data: GeocodingResponse = await response.json()

  if (!data.results?.length) {
    throw new Error(
      'Location not found. Try another city name.'
    )
  }

  return data.results.map(place => ({
    id: place.id,
    name: [
      place.name,
      place.admin1,
      place.country
    ].filter(Boolean).join(', '),
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone
  }))
}
