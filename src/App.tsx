import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type FormEvent
} from 'react'
import { getVisibleObjects } from './astronomy'
import { searchLocations, type LocationResult } from './location'
import { getObservationDate } from './timezone'
import type { Observation } from './ObservationPage'
import Landing from './Landing'
import { Icon } from './Icons'
import './App.css'

const ObservationPage = lazy(() => import('./ObservationPage'))

function restoreObservation(): Observation | null {
  if (window.location.hash !== '#/mission') return null
  try {
    const saved = JSON.parse(
      sessionStorage.getItem('skyscout-current-mission') || 'null'
    )
    if (
      !saved ||
      typeof saved.date !== 'string' ||
      typeof saved.time !== 'string' ||
      typeof saved.place?.name !== 'string' ||
      typeof saved.place?.timezone !== 'string'
    )
      return null
    const targets = getVisibleObjects(
      getObservationDate(saved.date, saved.time, saved.place.timezone),
      saved.place.latitude,
      saved.place.longitude
    )
    return { ...saved, targets }
  } catch {
    return null
  }
}
function today() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function App() {
  const [observation, setObservation] = useState<Observation | null>(
    restoreObservation
  )
  const [page, setPage] = useState<'setup' | 'mission'>(() =>
    observation ? 'mission' : 'setup'
  )
  const [location, setLocation] = useState(observation?.place.name ?? 'Oshawa')
  const [date, setDate] = useState(observation?.date ?? today())
  const [time, setTime] = useState(observation?.time ?? '21:00')
  const [matches, setMatches] = useState<LocationResult[]>(
    observation ? [observation.place] : []
  )
  const [selectedId, setSelectedId] = useState(
    observation ? String(observation.place.id) : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestId = useRef(0)
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
    function syncPage() {
      setPage(
        window.location.hash === '#/mission' && observation
          ? 'mission'
          : 'setup'
      )
    }
    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [observation])
  useEffect(() => {
    main.current?.focus()
    window.scrollTo({ top: 0 })
  }, [page])

  function navigate(next: 'setup' | 'mission') {
    window.location.hash = next === 'mission' ? '/mission' : '/plan'
    setPage(next)
  }
  function clearObservation() {
    requestId.current += 1
    setObservation(null)
    setError('')
    setLoading(false)
    try {
      sessionStorage.removeItem('skyscout-current-mission')
    } catch {
      /* Inputs still work without browser storage. */
    }
  }
  async function findLocations() {
    const currentRequest = ++requestId.current
    setLoading(true)
    setError('')
    setMatches([])
    setSelectedId('')
    setObservation(null)
    try {
      const results = await searchLocations(location)
      if (currentRequest !== requestId.current) return
      setMatches(results)
      if (results.length === 1) setSelectedId(String(results[0].id))
    } catch (err) {
      if (currentRequest === requestId.current)
        setError(
          err instanceof Error ? err.message : 'Unable to search for locations.'
        )
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!date || !time) {
      setError('Please select an observation date and time.')
      return
    }
    const place = matches.find((match) => String(match.id) === selectedId)
    if (!place) {
      setError('Search for a city and select the correct location first.')
      return
    }
    try {
      const targets = getVisibleObjects(
        getObservationDate(date, time, place.timezone),
        place.latitude,
        place.longitude
      )
      const next = { place, date, time, targets }
      setObservation(next)
      setError('')
      try {
        sessionStorage.setItem('skyscout-current-mission', JSON.stringify(next))
      } catch {
        /* This visit remains usable without persistence. */
      }
      navigate('mission')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to calculate this sky. Please try another time.'
      )
    }
  }
  const form = (
    <form onSubmit={submit} className="planner-form">
      <label htmlFor="location">Your Location</label>
      <div className="location-search">
        <div className="input-with-icon">
          <Icon name="pin" size={18} />
          <input
            id="location"
            type="text"
            placeholder="Search a city"
            value={location}
            onChange={(event) => {
              setLocation(event.target.value)
              setMatches([])
              setSelectedId('')
              clearObservation()
            }}
            required
          />
        </div>
        <button
          type="button"
          className="search-location-button"
          onClick={findLocations}
          disabled={loading || !location.trim()}
          aria-label="Find Locations"
        >
          {loading ? (
            <span className="loading-dot" />
          ) : (
            <Icon name="search" size={19} />
          )}
        </button>
      </div>
      {loading && (
        <p className="form-hint" role="status">
          Finding your corner of the world…
        </p>
      )}
      {matches.length > 0 && (
        <>
          <label htmlFor="location-choice">Choose Your City</label>
          <select
            id="location-choice"
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value)
              clearObservation()
            }}
            required
          >
            <option value="">Select the correct location</option>
            {matches.map((place) => (
              <option key={place.id} value={String(place.id)}>
                {place.name}
              </option>
            ))}
          </select>
        </>
      )}
      {!matches.length && (
        <p className="form-hint">
          Search, then choose your city from the results.
        </p>
      )}
      {selectedId && (
        <p className="form-confirmation">
          <Icon name="check" size={14} />
          {matches.find((place) => String(place.id) === selectedId)?.timezone} ·
          local time
        </p>
      )}
      <div className="date-time-grid">
        <div>
          <label htmlFor="date">Observation Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value)
              clearObservation()
            }}
            required
          />
        </div>
        <div>
          <label htmlFor="time">Observation Time</label>
          <input
            id="time"
            type="time"
            value={time}
            onChange={(event) => {
              setTime(event.target.value)
              clearObservation()
            }}
            required
          />
        </div>
      </div>
      <p className="form-hint time-hint">
        <Icon name="moon" size={14} /> After dark is where the magic happens.
      </p>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <button
        className="primary-button explore-button"
        type="submit"
        disabled={loading}
      >
        Explore my sky <Icon name="arrow" size={19} />
      </button>
      <p className="form-subtext">
        Browse first. Build a mission when you’re ready.
      </p>
    </form>
  )

  return (
    <div className="site-shell">
      <header className="site-header">
        <button
          className="brand"
          onClick={() => navigate('setup')}
          aria-label="SkyScout home"
        >
          <span className="brand-mark">
            <Icon name="spark" size={24} />
          </span>
          SkyScout<span className="brand-period">.</span>
        </button>
        <nav aria-label="Main navigation">
          <button
            className={page === 'setup' ? 'nav-active' : ''}
            onClick={() => navigate('setup')}
          >
            Plan a night
          </button>
          {observation && (
            <button
              className={page === 'mission' ? 'nav-active' : ''}
              onClick={() => navigate('mission')}
            >
              Your sky
            </button>
          )}
          <button
            onClick={() => {
              navigate('setup')
              requestAnimationFrame(() =>
                document
                  .getElementById('how-it-works')
                  ?.scrollIntoView({ behavior: 'smooth' })
              )
            }}
          >
            How it works
          </button>
        </nav>
        <span className="header-note">
          <span className="status-dot" /> Made for looking up
        </span>
      </header>
      <main
        ref={main}
        tabIndex={-1}
        className={`app ${page === 'setup' ? 'setup-view' : 'explore-view'}`}
      >
        {page === 'setup' || !observation ? (
          <Landing form={form} />
        ) : (
          <Suspense
            fallback={
              <div className="sky-loading" role="status">
                <span className="loading-dot" /> Finding your place among the
                stars…
              </div>
            }
          >
            <ObservationPage
              key={`${observation.place.id}-${observation.place.latitude}-${observation.place.longitude}-${observation.date}-${observation.time}`}
              observation={observation}
              onEdit={() => navigate('setup')}
            />
          </Suspense>
        )}
      </main>
      <footer className="site-footer">
        <span className="footer-brand">
          <Icon name="spark" size={16} /> SkyScout
        </span>
        <span>A little less scrolling. A little more stargazing.</span>
        <span>
          Stay curious. Look up. <span aria-hidden="true">↗</span>
        </span>
      </footer>
    </div>
  )
}
