
import fs from 'node:fs/promises'

const API_URL =
  'https://darksky.org/wp-json/wp/v2/darksky_place'

async function getAllPlaces() {
  const places = []

  for (let page = 1; ; page++) {
    const url =
      `${API_URL}?per_page=100&page=${page}`

    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 400 && page > 1) break
      throw new Error(`API error: ${response.status}`)
    }

    const records = await response.json()

    if (records.length === 0) break

    places.push(...records)

    if (records.length < 100) break
  }

  return places
}

function extractCoordinates(html) {
  if (!html) return null

  const patterns = [
    // Google Maps: latitude followed by longitude
    /!3d(-?\d+(?:\.\d+)?)!2d(-?\d+(?:\.\d+)?)/,

    // Google Maps: longitude followed by latitude
    /!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/,

    // Google Maps URL: @latitude,longitude
    /@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,

    // Google Maps query parameters
    /[?&](?:q|query|ll|center)=(-?\d+(?:\.\d+)?)[,%2C]+(-?\d+(?:\.\d+)?)/i
  ]

  for (let i = 0; i < patterns.length; i++) {
    const match = html.match(patterns[i])

    if (!match) continue

    let latitude = Number(match[1])
    let longitude = Number(match[2])

    // The second pattern stores longitude before latitude.
    if (i === 1) {
      ;[latitude, longitude] = [longitude, latitude]
    }

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180
    ) {
      return { latitude, longitude }
    }
  }

  return null
}

async function main() {
  const places = await getAllPlaces()

  const coordinates = {}
  const missing = []

  for (const place of places) {
    if (place.status !== 'publish') continue

    const html =
      `${place.content?.rendered ?? ''} ${place.excerpt?.rendered ?? ''}`

    let result = extractCoordinates(html)

    // If the API content has no coordinates, inspect the official webpage.
    if (!result && place.link) {
    try {
        const pageResponse = await fetch(place.link, {
        headers: {
            'User-Agent': 'SkyScout DarkSky Directory Importer'
        }
        })

        if (pageResponse.ok) {
        const pageHtml = await pageResponse.text()
        result = extractCoordinates(pageHtml)
        }
    } catch (error) {
        console.log(`Could not retrieve: ${place.slug}`)
    }

    // Avoid sending requests too quickly.
    await new Promise(resolve => setTimeout(resolve, 150))
    }

    if (result) {
    coordinates[place.slug] = result
    } else {
    missing.push({
        name: place.title?.rendered ?? place.slug,
        id: place.slug,
        url: place.link
    })
    }
  }

  const output = `import type { DarkSkyCoordinates } from './darkSkyTypes'

export const DARK_SKY_COORDINATES: Record<string, DarkSkyCoordinates> = ${JSON.stringify(
    coordinates,
    null,
    2
  )}
`

  await fs.writeFile(
    'src/darkSkyCoordinates.ts',
    output,
    'utf8'
  )

  console.log(`Official API records: ${places.length}`)
  console.log(`Coordinates extracted: ${Object.keys(coordinates).length}`)
  console.log(`Missing coordinates: ${missing.length}`)

  console.log('\nMISSING COORDINATES:')

  for (const place of missing) {
    console.log(`- ${place.name} (${place.id})`)
    console.log(`  ${place.url}`)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
