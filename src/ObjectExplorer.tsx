import { useState } from 'react'
import {
  CATEGORY_LABELS,
  DEFAULT_FILTERS,
  compassDirection,
  filterCatalogue,
  type CatalogueFilters,
  type Category,
  type SkyObject
} from './catalogue'
import { Icon } from './Icons'
import ObjectInfoModal from './ObjectInfoModal'

type ExplorerProps = {
  objects: SkyObject[]
  filters: CatalogueFilters
  onFilters: (filters: CatalogueFilters) => void
  selectedIds: string[]
  recommendedNames: string[]
  onToggle: (id: string) => void
  onLocate: (object: SkyObject) => void
}

export default function ObjectExplorer({
  objects,
  filters,
  onFilters,
  selectedIds,
  recommendedNames,
  onToggle,
  onLocate
}: ExplorerProps) {
  const [shown, setShown] = useState(12)
  const [infoObject, setInfoObject] = useState<SkyObject | null>(null)
  const results = filterCatalogue(objects, filters)
  function update(patch: Partial<CatalogueFilters>) {
    setShown(12)
    onFilters({ ...filters, ...patch })
  }
  const categories = Object.keys(CATEGORY_LABELS) as Category[]
  const changed =
    filters.category !== 'all' ||
    filters.nakedEye ||
    filters.query ||
    filters.minAltitude > 0
  return (
    <section
      className="catalogue-section"
      id="discoveries"
      aria-labelledby="catalogue-heading"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR SKY, YOUR WAY</p>
          <h2 id="catalogue-heading">What’s up there?</h2>
          <p>
            Everything in our catalogue above your horizon. Find what catches
            your eye.
          </p>
        </div>
        <span className="count-pill">
          {objects.length.toLocaleString()} discoveries
        </span>
      </div>
      <div className="explorer-layout">
        <aside className="filter-panel" aria-label="Observation filters">
          <div className="filter-heading">
            <span>
              <Icon name="sliders" size={17} /> Refine your sky
            </span>
            {changed && (
              <button
                className="text-button"
                onClick={() => {
                  setShown(12)
                  onFilters({ ...DEFAULT_FILTERS })
                }}
              >
                Reset
              </button>
            )}
          </div>
          <label className="toggle-option">
            <span>
              <Icon name="eye" size={18} />
              <span>
                Naked-eye candidates<small>Dark, clear skies assumed</small>
              </span>
            </span>
            <input
              type="checkbox"
              checked={filters.nakedEye}
              onChange={(event) => update({ nakedEye: event.target.checked })}
            />
          </label>
          <p className="filter-label">I WANT TO SEE</p>
          <div className="category-options">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={filters.category === category}
                onClick={() => update({ category })}
              >
                <span>
                  <Icon
                    name={category === 'all' ? 'grid' : category}
                    size={18}
                  />
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="category-count">
                  {category === 'all'
                    ? objects.length
                    : objects.filter((object) => object.kind === category)
                        .length}
                </span>
              </button>
            ))}
          </div>
          <label className="altitude-filter">
            Minimum altitude <strong>{filters.minAltitude}°</strong>
            <input
              aria-label="Minimum altitude"
              type="range"
              min="0"
              max="70"
              step="5"
              value={filters.minAltitude}
              onChange={(event) =>
                update({ minAltitude: Number(event.target.value) })
              }
            />
            <small>Higher objects clear more obstacles.</small>
          </label>
          <details className="visibility-help">
            <summary>
              <Icon name="info" size={15} /> How visibility works
            </summary>
            <p>
              Above the horizon doesn’t guarantee a clear view. Naked-eye
              candidates use magnitude 6 or brighter and a Sun altitude below
              −6°. For constellations, it means a star pattern to try without
              equipment; individual stars may still be faint.
            </p>
            <p>
              Buildings, clouds, Moon glare, and light pollution aren’t
              measured. Constellation positions are guide points on their line
              figures. Our catalogue covers 5,044 stars, 88 constellation
              figures, the Moon, and seven other planets.
            </p>
            <a
              href="https://www.nps.gov/subjects/nightskies/rateyoursky.htm"
              target="_blank"
              rel="noreferrer"
            >
              About dark-sky visibility ↗
            </a>
          </details>
        </aside>
        <div className="object-results">
          <div className="results-toolbar">
            <label className="search-field">
              <Icon name="search" size={18} />
              <input
                aria-label="Search sky objects"
                placeholder="Search a name or HIP number…"
                value={filters.query}
                onChange={(event) => update({ query: event.target.value })}
              />
            </label>
            <label className="sort-field">
              Sort by
              <select
                aria-label="Sort objects"
                value={filters.sort}
                onChange={(event) =>
                  update({
                    sort: event.target.value as CatalogueFilters['sort']
                  })
                }
              >
                <option value="brightness">Brightness</option>
                <option value="altitude">Highest in sky</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>
          <p className="results-count" role="status">
            {results.length.toLocaleString()}{' '}
            {results.length === 1 ? 'match' : 'matches'}
            {filters.category !== 'all'
              ? ` · ${CATEGORY_LABELS[filters.category]}`
              : ''}
            {filters.nakedEye ? ' · Naked-eye candidates' : ''}
            <span>Positions at your selected start time</span>
          </p>
          {results.length === 0 ? (
            <div className="empty-state">
              <Icon name="search" size={34} />
              <h3>A different view awaits.</h3>
              <p>
                No catalogue objects match these filters at this time. Try
                another category, lower the altitude, or clear your search.
              </p>
              <button
                className="secondary-button"
                onClick={() => {
                  setShown(12)
                  onFilters({ ...DEFAULT_FILTERS })
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="object-grid">
                {results.slice(0, shown).map((object) => {
                  const saved = selectedIds.includes(object.id)
                  return (
                    <article
                      className={`object-card kind-${object.kind}`}
                      key={object.id}
                    >
                      <div className="object-card-top">
                        <div className={`object-art art-${object.kind}`}>
                          <Icon name={object.kind} size={40} />
                        </div>
                        <button
                          className={`bookmark-button ${saved ? 'is-saved' : ''}`}
                          aria-label={`${saved ? 'Remove' : 'Save'} ${object.name}${saved ? ' from' : ' to'} mission`}
                          aria-pressed={saved}
                          onClick={() => onToggle(object.id)}
                        >
                          <Icon name={saved ? 'check' : 'bookmark'} size={18} />
                        </button>
                      </div>
                      <p className="object-type">
                        {object.kind}
                        {recommendedNames.includes(object.name) && (
                          <span>Suggested</span>
                        )}
                      </p>
                      <h3>{object.name}</h3>
                      <div className="object-badges">
                        <span
                          className={
                            object.nakedEye ? 'badge-green' : 'badge-muted'
                          }
                        >
                          {object.nakedEye
                            ? 'Naked-eye candidate'
                            : object.kind === 'constellation'
                              ? 'Pattern guide'
                              : 'Check sky conditions'}
                        </span>
                        {object.partial && (
                          <span className="badge-muted">
                            Partly above horizon
                          </span>
                        )}
                      </div>
                      <p className="object-description">{object.description}</p>
                      <div className="object-metrics">
                        <span>
                          <small>
                            {object.kind === 'constellation'
                              ? 'GUIDE ALTITUDE'
                              : 'ALTITUDE'}
                          </small>
                          <strong>
                            {object.altitude.toFixed(0)}°{' '}
                            <span>above horizon</span>
                          </strong>
                        </span>
                        <span>
                          <small>DIRECTION</small>
                          <strong>
                            {compassDirection(object.azimuth)}{' '}
                            <span>{object.azimuth.toFixed(0)}°</span>
                          </strong>
                        </span>
                      </div>
                      <button
                        className="info-button"
                        aria-label={`More info about ${object.name}`}
                        onClick={() => setInfoObject(object)}
                      >
                        <Icon name="info" size={16} /> More info
                      </button>
                      <button
                        className="locate-button"
                        onClick={() => onLocate(object)}
                      >
                        <Icon name="compass" size={16} /> Locate in sky{' '}
                        <Icon name="arrow" size={16} />
                      </button>
                    </article>
                  )
                })}
              </div>
              {shown < results.length && (
                <button
                  className="load-more secondary-button"
                  onClick={() => setShown((value) => value + 12)}
                >
                  Show 12 more{' '}
                  <span>
                    ({Math.min(shown, results.length)} of{' '}
                    {results.length.toLocaleString()})
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {infoObject && (
        <ObjectInfoModal object={infoObject} onClose={() => setInfoObject(null)} />
      )}
    </section>
  )
}
