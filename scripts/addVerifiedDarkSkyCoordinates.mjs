
import fs from 'node:fs/promises'

const FILE = 'src/darkSkyCoordinates.ts'

const verified = {
  'james-river-state-park-dark-sky-park': {
    latitude: 37.623063,
    longitude: -78.796575
  },
  'devils-river-state-natural-area-dark-sky-sanctuary': {
    latitude: 29.939694,
    longitude: -100.970206
  },
  'warrumbungle-dark-sky-park': {
    latitude: -31.3998571,
    longitude: 148.7306985
  }
}

async function main() {
  const source = await fs.readFile(FILE, 'utf8')

  const entryRegex =
    /"([^"]+)":\s*\{\s*"latitude":\s*(-?\d+(?:\.\d+)?),\s*"longitude":\s*(-?\d+(?:\.\d+)?)\s*\}/g

  const coordinates = {}

  for (const match of source.matchAll(entryRegex)) {
    coordinates[match[1]] = {
      latitude: Number(match[2]),
      longitude: Number(match[3])
    }
  }

  const before = Object.keys(coordinates).length
  let added = 0

  for (const [id, value] of Object.entries(verified)) {
    if (coordinates[id]) {
      console.log(`Already exists: ${id}`)
      continue
    }

    coordinates[id] = value
    added++
  }

  if (before === 0) {
    throw new Error('No existing coordinates found. File unchanged.')
  }

  const output =
    `import type { DarkSkyCoordinates } from './darkSkyTypes'\n\n` +
    `export const DARK_SKY_COORDINATES: Record<string, DarkSkyCoordinates> = ` +
    JSON.stringify(coordinates, null, 2) +
    '\n'

  await fs.writeFile(FILE, output)

  console.log('\n--- SUMMARY ---')
  console.log(`Previously existing: ${before}`)
  console.log(`Verified coordinates added: ${added}`)
  console.log(`Total coordinates: ${Object.keys(coordinates).length}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
