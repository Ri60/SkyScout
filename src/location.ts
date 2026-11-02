
export type LocationResult = {
  name: string
  latitude: number
  longitude: number
  timezone: string
}

export async function searchLocation(
  city: string
): Promise<LocationResult> {
  const query = city.trim()

  if (!query) {
    throw new Error('Please enter a city.')
  }

  const url = new URL(
    'https://geocoding-api.open-meteo.com/v1/search'
  )

  url.searchParams.set('name', query)
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Could not connect to the location service.')
  }

  const data = await response.json()

  if (!data.results || data.results.length === 0) {
    throw new Error('Location not found. Try another city name.')
  }

  const place = data.results[0]

  return {
    name: `${place.name}, ${place.country}`,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone
  }
}
