import { useMemo, useState, type KeyboardEvent } from 'react'
import { getObservationDate } from './timezone'
import { buildSky } from './skyView'
import { DEFAULT_FILTERS, makeCatalogue, type SkyObject } from './catalogue'
import type { LocationResult } from './location'
import type { SkyTarget } from './astronomy'
import NightSky from './NightSky'
import Mission from './Mission'
import LocationMap from './LocationMap'
import SkyChart from './SkyChart'
import ObjectExplorer from './ObjectExplorer'
import ObservationPlanner from './ObservationPlanner'
import { Icon } from './Icons'

export type Observation = {
  place: LocationResult
  date: string
  time: string
  targets: SkyTarget[]
}

export default function ObservationPage({
  observation,
  onEdit
}: {
  observation: Observation
  onEdit: () => void
}) {
  const { place, date, time, targets } = observation
  const missionId = `${place.latitude}-${place.longitude}-${date}-${time}`
  const sky = useMemo(
    () =>
      buildSky(
        getObservationDate(date, time, place.timezone),
        place.latitude,
        place.longitude
      ),
    [date, time, place]
  )
  const objects = useMemo(() => makeCatalogue(sky), [sky])
  const [tab, setTab] = useState<'discover' | 'mission' | 'location'| 'planner'>(
    'discover'
  )
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [focusTarget, setFocusTarget] = useState<SkyObject | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      const parsed: unknown = JSON.parse(
        localStorage.getItem(`skyscout-shortlist-${missionId}`) || 'null'
      )
      if (Array.isArray(parsed))
        return parsed.filter(
          (id): id is string =>
            typeof id === 'string' && objects.some((object) => object.id === id)
        )
    } catch {
      /* Use suggestions if storage cannot be read. */
    }
    return objects
      .filter((object) => targets.some((target) => target.name === object.name))
      .map((object) => object.id)
  })
  const selected = objects.filter((object) => selectedIds.includes(object.id))
  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((value) => value !== id)
      : [...selectedIds, id]
    setSelectedIds(next)
    try {
      localStorage.setItem(
        `skyscout-shortlist-${missionId}`,
        JSON.stringify(next)
      )
    } catch {
      /* Shortlisting remains available for this visit. */
    }
  }
  function locate(object: SkyObject) {
    setFilters({ ...DEFAULT_FILTERS })
    setFocusTarget({ ...object })
    document
      .getElementById('night-heading')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  function switchTabWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).getAttribute('role') !== 'tab') return
    const tabs = ['discover', 'mission', 'location', 'planner'] as const
    const index = tabs.indexOf(tab)
    const next =
      event.key === 'ArrowRight'
        ? tabs[(index + 1) % tabs.length]
        : event.key === 'ArrowLeft'
          ? tabs[(index + tabs.length - 1) % tabs.length]
          : event.key === 'Home'
            ? tabs[0]
            : event.key === 'End'
              ? tabs[3]
              : null
    if (!next) return
    event.preventDefault()
    setTab(next)
    requestAnimationFrame(() => document.getElementById(`tab-${next}`)?.focus())
  }
  const formattedDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: place.timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(getObservationDate(date, time, place.timezone))
  const darkness =
    sky.sunAltitude < -18
      ? 'Astronomical night'
      : sky.sunAltitude < -6
        ? 'Twilight sky'
        : 'Daylight sky'
  return (
    <div className="observation-page">
      <div className="observation-title">
        <div>
          <p className="eyebrow">YOUR WINDOW INTO THE UNIVERSE</p>
          <h1>
            A sky full of <em>possibility.</em>
          </h1>
          <p>Look around. Find your favourites. Make the night your own.</p>
        </div>
        <button className="secondary-button" onClick={onEdit}>
          <Icon name="sliders" size={16} /> Edit details
        </button>
      </div>
      <div className="observation-meta">
        <span>
          <Icon name="pin" size={16} />
          {place.name}
        </span>
        <span>
          <Icon name="clock" size={16} />
          {formattedDate} · {time} local
        </span>
        <span className="darkness-status">
          <span className="status-dot" />
          {darkness}
        </span>
      </div>
      <div
        className="observation-tabs"
        role="tablist"
        onKeyDown={switchTabWithKeyboard}
        aria-label="Explore your observation"
      >
        <button
          role="tab"
          id="tab-discover"
          tabIndex={tab === 'discover' ? 0 : -1}
          aria-selected={tab === 'discover'}
          aria-controls="observation-panel"
          onClick={() => setTab('discover')}
        >
          <Icon name="spark" size={17} /> Sky & discoveries
        </button>
        <button
          role="tab"
          id="tab-mission"
          tabIndex={tab === 'mission' ? 0 : -1}
          aria-selected={tab === 'mission'}
          aria-controls="observation-panel"
          onClick={() => setTab('mission')}
        >
          <Icon name="bookmark" size={17} /> My mission{' '}
          <span>{selected.length}</span>
        </button>
        <button
          role="tab"
          id="tab-location"
          tabIndex={tab === 'location' ? 0 : -1}
          aria-selected={tab === 'location'}
          aria-controls="observation-panel"
          onClick={() => setTab('location')}
        >
          <Icon name="pin" size={17} /> Observing location
        </button>
        <button
          role="tab"
          id="tab-planner"
          tabIndex={tab === 'planner' ? 0 : -1}
          aria-selected={tab === 'planner'}
          aria-controls="observation-panel"
          onClick={() => setTab('planner')}
        >
          <Icon name="spark" size={17} /> Best time to observe
        </button>
      </div>
      <div
        role="tabpanel"
        id="observation-panel"
        aria-labelledby={`tab-${tab}`}
      >
        {tab === 'discover' && (
          <>
            <div className="sky-overview">
              <NightSky
                place={place}
                date={date}
                time={time}
                targets={targets}
                baseSky={sky}
                category={filters.category}
                nakedEyeOnly={filters.nakedEye}
                focusTarget={focusTarget}
              />
              <aside className="sky-side-note">
                <span className="icon-tile">
                  <Icon name="spark" size={23} />
                </span>
                <p className="eyebrow">YOUR SKY AT A GLANCE</p>
                <h2>
                  Wonder is
                  <br />
                  closer than
                  <br />
                  <em>you think.</em>
                </h2>
                <p>
                  The sky moves with your location and time. Turn the view to
                  find your bearings, then explore the discoveries below.
                </p>
                <div className="sky-stat">
                  <strong>{sky.planets.length}</strong>
                  <span>
                    Moon & planets
                    <br />
                    above the horizon
                  </span>
                </div>
                <div className="sky-stat">
                  <strong>{sky.constellations.length}</strong>
                  <span>
                    constellation figures
                    <br />
                    at least partly up
                  </span>
                </div>
                <a href="#discoveries">
                  Find something to observe <Icon name="arrow" size={16} />
                </a>
              </aside>
            </div>
            {sky.sunAltitude >= -6 && (
              <div className="notice">
                <Icon name="info" />
                <p>
                  The Sun is still high enough to hide most stars. These
                  positions describe what is above your horizon, not what you
                  can see in daylight. Choose a later time for stargazing. Never
                  aim binoculars or a telescope toward the Sun.
                </p>
              </div>
            )}
            <ObjectExplorer
              objects={objects}
              filters={filters}
              onFilters={(next) => {
                setFilters(next)
                setFocusTarget(null)
              }}
              selectedIds={selectedIds}
              recommendedNames={targets.map((target) => target.name)}
              onToggle={toggle}
              onLocate={locate}
            />
            <div className="mission-callout">
              <div>
                <span className="eyebrow">TAKE YOUR CURIOSITY OUTSIDE</span>
                <h2>
                  {selected.length
                    ? `${selected.length} discoveries. One little adventure.`
                    : 'Your next adventure starts with a save.'}
                </h2>
                <p>Bookmark objects to build a personal observing checklist.</p>
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  setTab('mission')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Open my mission <Icon name="arrow" size={18} />
              </button>
            </div>
          </>
        )}
        {tab === 'mission' && (
          <div className="mission-page">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR LITTLE ADVENTURE</p>
                <h2>A plan for looking up.</h2>
                <p>
                  Your saved targets and a gentle 30-minute guide. Progress
                  stays on this device.
                </p>
              </div>
              <button
                className="secondary-button"
                onClick={() => setTab('discover')}
              >
                Find more objects <Icon name="arrow" size={17} />
              </button>
            </div>
            {selected.length === 0 ? (
              <div className="empty-state">
                <Icon name="bookmark" size={38} />
                <h3>Leave a little room for wonder.</h3>
                <p>
                  Save objects from the discoveries page to start your mission.
                </p>
                <button
                  className="primary-button"
                  onClick={() => setTab('discover')}
                >
                  Browse discoveries <Icon name="arrow" size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="notice">
                  <Icon name="info" />
                  <p>
                    Your custom targets are above the horizon at the start time.
                    Use the sky’s 30-minute preview to check how they move.
                    Suggested targets have also passed the original 30-minute
                    brightness and altitude checks.
                  </p>
                </div>
                <Mission targets={selected} missionId={missionId} />
                <details className="chart-disclosure">
                  <summary>View an overhead target chart</summary>
                  <SkyChart targets={selected} />
                </details>
                <div className="shortlist-edit">
                  <h3>Manage your shortlist</h3>
                  {selected.map((object) => (
                    <button
                      className="saved-chip"
                      key={object.id}
                      onClick={() => toggle(object.id)}
                      aria-label={`Remove ${object.name} from mission`}
                    >
                      {object.name}
                      <Icon name="close" size={14} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {tab === 'planner' && (
          <ObservationPlanner
            place={place}
            availableObjects={objects}
          />
        )}
        {tab === 'location' && (
          <div className="location-page">
            <div className="section-heading">
              <div>
                <p className="eyebrow">SET THE SCENE</p>
                <h2>Your patch of the planet.</h2>
                <p>Find an open horizon and a place away from bright lights.</p>
              </div>
            </div>
            <LocationMap place={place} />
            <div className="location-tips">
              {[
                [
                  'eye',
                  'Find the dark',
                  'Look for a safe, accessible place with fewer lights. The map does not measure light pollution.'
                ],
                [
                  'compass',
                  'Leave room for the horizon',
                  'Trees and buildings can hide objects that are calculated to be above the horizon.'
                ],
                [
                  'clock',
                  'Give your eyes time',
                  'Allow time to adjust to darkness. Keep your screen dim while observing.'
                ]
              ].map(([icon, title, copy]) => (
                <article key={title}>
                  <Icon name={icon} size={23} />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="observation-source">
        Calculated for {place.timezone}. Catalogue positions are estimates of
        viewing opportunities, not guarantees of visibility.
      </p>
    </div>
  )
}
