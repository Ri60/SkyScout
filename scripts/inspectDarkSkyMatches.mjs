
import fs from 'node:fs/promises'

const audit = JSON.parse(
  await fs.readFile(
    'scripts/darkSkyGeocodingResults.json',
    'utf8'
  )
)

const matches = audit.results.filter(
  result => result.accepted
)

console.log(`Accepted matches: ${matches.length}\n`)

for (const result of matches) {
  console.log(`LOCATION: ${result.name}`)
  console.log(`COUNTRY: ${result.country}`)
  console.log(
    `MATCH: ${result.candidates[0]?.name}`
  )
  console.log(
    `MATCH COUNTRY: ${result.candidates[0]?.country}`
  )
  console.log(
    `COORDINATES: ${JSON.stringify(result.coordinates)}`
  )
  console.log('-------------------------')
}
