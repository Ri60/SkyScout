import fs from 'node:fs/promises'

const API_URL =
  'https://darksky.org/wp-json/wp/v2/darksky_place'

async function main() {
  const source = await fs.readFile(
    'src/darkSkyCoordinates.ts',
    'utf8'
  )

  const coordinates = new Set(
    [...source.matchAll(/"([^"]+)":\s*\{/g)]
      .map(match => match[1])
  )

  const places = []

  for (let page = 1; ; page++) {
    const response = await fetch(
      `${API_URL}?per_page=100&page=${page}&_embed=1`
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const records = await response.json()
    places.push(...records)

    if (records.length < 100) break
  }

  const published = places.filter(
    place => place.status === 'publish'
  )

  const missing = published.filter(
    place => !coordinates.has(place.slug)
  )

  console.log('\n--- COVERAGE SUMMARY ---')
  console.log(`Published entries: ${published.length}`)
  console.log(`With coordinates: ${published.length - missing.length}`)
  console.log(`Missing coordinates: ${missing.length}`)
  console.log(
    `Coverage: ${((published.length - missing.length) / published.length * 100).toFixed(1)}%`
  )

  console.log('\n--- MISSING LOCATIONS ---')
  missing.forEach(place => {
    console.log(`${place.slug}: ${place.title.rendered}`)
  })
}

main().catch(console.error)