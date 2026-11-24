
const API = 'https://darksky.org/wp-json/wp/v2'

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

async function main() {
  const first = await getPage(1)

  const records = [...first.records]

  for (let page = 2; page <= first.totalPages; page++) {
    console.log(`Downloading page ${page}/${first.totalPages}...`)

    const result = await getPage(page)
    records.push(...result.records)
  }

  const categoryCounts = {}
  const missingCategory = []
  const duplicateSlugs = []
  const seenSlugs = new Set()

  const places = records.map(record => {
    const category = getTerms(record, 'idsp_type')[0]
    const location = getTerms(record, 'locations_terms')

    if (!category) {
      missingCategory.push(record.title.rendered)
    } else {
      categoryCounts[category.slug] =
        (categoryCounts[category.slug] ?? 0) + 1
    }

    if (seenSlugs.has(record.slug)) {
      duplicateSlugs.push(record.slug)
    }

    seenSlugs.add(record.slug)

    return {
      name: record.title.rendered,
      slug: record.slug,
      category: category?.name ?? 'MISSING',
      categorySlug: category?.slug ?? null,
      region: location.map(term => term.name).join(', '),
      url: record.link
    }
  })

  console.log('\n========== AUDIT RESULTS ==========')
  console.log('API total:', first.total)
  console.log('Downloaded:', records.length)
  console.log('Published:', records.filter(r => r.status === 'publish').length)

  console.log('\nCATEGORY COUNTS:')
  console.table(categoryCounts)

  console.log('\nMISSING CATEGORY:')
  console.log(missingCategory)

  console.log('\nDUPLICATE SLUGS:')
  console.log(duplicateSlugs)

  console.log('\nFIRST 15 RECORDS:')
  console.table(places.slice(0, 15))

  console.log('\nLAST 15 RECORDS:')
  console.table(places.slice(-15))
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
