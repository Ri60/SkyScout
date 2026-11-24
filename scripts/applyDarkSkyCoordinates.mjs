
import fs from 'node:fs/promises'

const COORDINATES_FILE = 'src/darkSkyCoordinates.ts'
const RESULTS_FILE = 'scripts/darkSkyGeocodingResults.json'

async function main() {
  const source = await fs.readFile(COORDINATES_FILE, 'utf8')
  const audit = JSON.parse(
    await fs.readFile(RESULTS_FILE, 'utf8')
  )

  // Extract existing coordinate entries.
  const coordinates = {}

  const entryRegex =
    /"([^"]+)":\s*\{\s*"latitude":\s*(-?\d+(?:\.\d+)?),\s*"longitude":\s*(-?\d+(?:\.\d+)?)\s*\}/g

  for (const match of source.matchAll(entryRegex)) {
    coordinates[match[1]] = {
      latitude: Number(match[2]),
      longitude: Number(match[3])
    }
  }

  const originalCount = Object.keys(coordinates).length
  let added = 0
  let skipped = 0

  for (const result of audit.results) {
    if (
      !result.accepted ||
      !result.coordinates ||
      coordinates[result.id]
    ) {
      skipped++
      continue
    }

    const { latitude, longitude } = result.coordinates

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      skipped++
      continue
    }

    coordinates[result.id] = { latitude, longitude }
    added++
  }

  const output =
    `import type { DarkSkyCoordinates } from './darkSkyTypes'\n\n` +
    `export const DARK_SKY_COORDINATES: Record<string, DarkSkyCoordinates> = ` +
    JSON.stringify(coordinates, null, 2) +
    '\n'

  await fs.writeFile(COORDINATES_FILE, output)

  console.log('\n--- MERGE SUMMARY ---')
  console.log(`Previously existing: ${originalCount}`)
  console.log(`New coordinates added: ${added}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Total coordinates: ${Object.keys(coordinates).length}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
