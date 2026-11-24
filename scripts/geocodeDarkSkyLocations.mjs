
import fs from 'node:fs/promises'

const API_URL =
  'https://darksky.org/wp-json/wp/v2/darksky_place'

const COORDINATES_FILE = 'src/darkSkyCoordinates.ts'
const OUTPUT_FILE = 'scripts/darkSkyGeocodingResults.json'

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms))

function cleanText(value = '') {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8212;|&mdash;/g, '-')
    .replace(/&#\d+;/g, '')
    .trim()
}

function normalize(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(
      /\b(national park|state park|provincial park|dark sky|international|reserve|area|park|estate|state recreation|island)\b/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim()
}

function similarity(a, b) {
  const first = new Set(normalize(a).split(' ').filter(Boolean))
  const second = new Set(normalize(b).split(' ').filter(Boolean))

  if (!first.size || !second.size) return 0

  const intersection =
    [...first].filter(word => second.has(word)).length

  return intersection /
    new Set([...first, ...second]).size
}

function normalizeCountry(value = '') {
  const country = value.toLowerCase().trim()

  const aliases = {
    usa: 'united states',
    'u.s.a.': 'united states',
    'united states of america': 'united states',
    uk: 'united kingdom',
    'u.k.': 'united kingdom',
    'great britain': 'united kingdom',
    'chinese taipei': 'taiwan'
  }

  return aliases[country] ?? country
}

function getSearchNames(name) {
  const names = new Set([name])

  const cleaned = name
    .replace(/\s*\([^)]*\)/g, '')
    .replace(
      /\b(regional natural park|national park|state park|provincial park|dark sky reserve|dark sky sanctuary|dark sky park|dark sky community|international dark sky reserve|international dark sky park|international dark sky sanctuary|state recreation area|nature reserve|forest park|national monument)\b/gi,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length >= 4) names.add(cleaned)

  const beforeDash = cleaned.split(/\s+[—–-]\s+/)[0].trim()
  if (beforeDash.length >= 4) names.add(beforeDash)

  return [...names].filter(Boolean)
}

async function getPlaces() {
  const all = []

  for (let page = 1; ; page++) {
    const response = await fetch(
      `${API_URL}?per_page=100&page=${page}&_embed=1`
    )

    if (!response.ok) {
      throw new Error(`DarkSky API error: ${response.status}`)
    }

    const records = await response.json()
    all.push(...records)

    if (records.length < 100) break
  }

  return all
}

async function getExistingCoordinates() {
  const source = await fs.readFile(COORDINATES_FILE, 'utf8')

  const entryRegex =
  /"([^"]+)":\s*\{\s*"?latitude"?:\s*(-?\d+(?:\.\d+)?),\s*"?longitude"?:\s*(-?\d+(?:\.\d+)?)\s*\}/g

  const coordinates = {}

  for (const match of source.matchAll(entryRegex)) {
    coordinates[match[1]] = {
      latitude: Number(match[2]),
      longitude: Number(match[3])
    }
  }

  if (Object.keys(coordinates).length === 0) {
    throw new Error('Could not read existing coordinates. Nothing changed.')
  }

  return coordinates
}

async function geocode(name) {
  const url = new URL(
    'https://geocoding-api.open-meteo.com/v1/search'
  )

  url.searchParams.set('name', name)
  url.searchParams.set('count', '10')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Open-Meteo error: ${response.status}`)
  }

  const data = await response.json()
  return data.results ?? []
}

async function main() {
  const places = await getPlaces()
  const existing = await getExistingCoordinates()

  const results = []
  const missing = []

  const published = places.filter(
    place => place.status === 'publish'
  )

  for (const place of published) {
    if (existing[place.slug]) continue

    const name = cleanText(
      place.title?.rendered ?? place.slug
    )

    const terms =
      place._embedded?.['wp:term']?.flat() ?? []

    const country =
      terms.find(
        term => term.taxonomy === 'locations_terms'
      )?.name ?? ''

    try {
      const searchNames = getSearchNames(name)
      const allCandidates = new Map()

      for (const searchName of searchNames) {
        const candidates = await geocode(searchName)

        for (const candidate of candidates) {
          const key =
            `${candidate.latitude},${candidate.longitude}`

          const score = similarity(name, candidate.name)

          const previous = allCandidates.get(key)

          if (!previous || score > previous.similarity) {
            allCandidates.set(key, {
              name: candidate.name,
              country: candidate.country ?? '',
              latitude: candidate.latitude,
              longitude: candidate.longitude,
              similarity: Number(score.toFixed(3)),
              countryMatch:
                normalizeCountry(candidate.country) ===
                normalizeCountry(country),
              searchedAs: searchName
            })
          }
        }

        await sleep(350)
      }

      const ranked = [...allCandidates.values()].sort(
        (a, b) => {
          if (a.countryMatch !== b.countryMatch) {
            return Number(b.countryMatch) -
              Number(a.countryMatch)
          }

          return b.similarity - a.similarity
        }
      )

      const best = ranked[0]

      const accepted =
        best &&
        best.countryMatch &&
        best.similarity >= 0.5

      const result = {
        id: place.slug,
        name,
        country,
        accepted: Boolean(accepted),
        coordinates: accepted
          ? {
              latitude: best.latitude,
              longitude: best.longitude
            }
          : null,
        candidates: ranked.slice(0, 5)
      }

      results.push(result)

      if (!accepted) missing.push(result)

      console.log(
        `${accepted ? 'MATCH' : 'REVIEW'}: ${name}`
      )
    } catch (error) {
      console.log(`ERROR: ${name} - ${error.message}`)

      const result = {
        id: place.slug,
        name,
        country,
        accepted: false,
        coordinates: null,
        candidates: [],
        error: error.message
      }

      results.push(result)
      missing.push(result)
    }
  }

  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify({ results, missing }, null, 2)
  )

  console.log('\n--- SUMMARY ---')
  console.log(
    `Existing coordinates: ${Object.keys(existing).length}`
  )
  console.log(
    `New geocoding matches: ${results.length - missing.length}`
  )
  console.log(`Needs review: ${missing.length}`)
  console.log(`Results saved to: ${OUTPUT_FILE}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
