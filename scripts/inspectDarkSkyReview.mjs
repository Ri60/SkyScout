import fs from 'node:fs/promises'

const audit = JSON.parse(
  await fs.readFile(
    'scripts/darkSkyGeocodingResults.json',
    'utf8'
  )
)

const rejected = audit.results.filter(
  result => !result.accepted
)

console.log(`Rejected results: ${rejected.length}`)
console.log('\nFirst 5 rejected results:')

for (const result of rejected.slice(0, 5)) {
  console.log(JSON.stringify(result, null, 2))
}