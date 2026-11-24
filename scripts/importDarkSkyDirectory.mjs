
import fs from 'node:fs/promises'

const API = 'https://darksky.org/wp-json/wp/v2'

const CATEGORY_MAP = {
  'international-dark-sky-park': 'Park',
  'international-dark-sky-reserve': 'Reserve',
  'international-dark-sky-sanctuary': 'Sanctuary',
  'international-dark-sky-community': 'Community',
  'community': 'Community',
  'urban-night-sky-place': 'Urban Place',
  'darksky-approved-lodging': 'DarkSky Approved Lodging'
}

async function getPage(page) {
  const url =
    `${API}/darksky_place?per_page=100&page=${page}&_embed=1`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Page ${page} failed: ${response.status}`)
  }

  return {
    records: await response.json(),
    total: Number(response.headers.get('X-WP-Total')),
    totalPages: Number(response.headers.get('X-WP-TotalPages'))
  }
}

function getTerms(record, taxonomy) {
  const groups = record._embedded?.['wp:term'] ?? []

  return groups
    .flat()
    .filter(term => term?.taxonomy === taxonomy)
}

function cleanHtml(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/&#038;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function getDescription(html = '') {
  const aboutSection = html.match(
    /<h[1-6][^>]*>\s*About\s*<\/h[1-6]>([\s\S]*?)(?=<h[1-6]|$)/i
  )

  const section = aboutSection?.[1] ?? html

  const paragraphs = [
    ...section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)
  ]
    .map(match => cleanHtml(match[1]))
    .filter(text => text.length > 40)

  return paragraphs[0] ??
    'Officially certified DarkSky International location.'
}

async function main() {
  const first = await getPage(1)
  const records = [...first.records]

  for (let page = 2; page <= first.totalPages; page++) {
    console.log(`Downloading ${page}/${first.totalPages}...`)

    const result = await getPage(page)
    records.push(...result.records)
  }

  const published = records.filter(
    record => record.status === 'publish'
  )

  const excluded = []
  const entries = []

  for (const record of published) {
    const categoryTerm = getTerms(record, 'idsp_type')[0]
    const category = CATEGORY_MAP[categoryTerm?.slug]

    if (!category) {
      excluded.push({
        name: record.title.rendered,
        slug: record.slug,
        url: record.link
      })
      continue
    }

    const locationTerms = getTerms(record, 'locations_terms')

    entries.push({
      id: record.slug,
      name: record.title.rendered,
      region: locationTerms.map(term => term.name).join(', '),
      description: getDescription(record.content?.rendered),
      category,
      officialUrl: record.link
    })
  }

  entries.sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const output = `import type { DarkSkyDirectoryEntry } from './darkSkyTypes'

export const DARK_SKY_DIRECTORY: DarkSkyDirectoryEntry[] = ${JSON.stringify(entries, null, 2)}
`

  await fs.writeFile(
    'src/darkSkyDirectory.ts',
    output,
    'utf8'
  )

  const counts = {}

  for (const entry of entries) {
    counts[entry.category] = (counts[entry.category] ?? 0) + 1
  }

  console.log('\n========== IMPORT COMPLETE ==========')
  console.log('API records:', records.length)
  console.log('Published records:', published.length)
  console.log('Imported certified records:', entries.length)
  console.log('Excluded without category:', excluded.length)

  console.log('\nCATEGORY COUNTS:')
  console.table(counts)

  console.log('\nEXCLUDED RECORDS:')
  console.table(excluded)

  console.log('\nCreated: src/darkSkyDirectory.ts')
}

main().catch(error => {
  console.error('Import failed:', error)
  process.exitCode = 1
})
