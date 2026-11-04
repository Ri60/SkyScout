
import { useEffect, useRef, useState } from 'react'
import { getVisibleObjects, type SkyTarget } from './astronomy'
import { searchLocations, type LocationResult } from './location'
import { getObservationDate } from './timezone'
import Mission from './Mission'
import SkyChart from './SkyChart'
import LocationMap from './LocationMap'
import NightSky from './NightSky'
import './App.css'

function App() {
  const [targets, setTargets] = useState<SkyTarget[] | null>(null)
  const [page, setPage] = useState<'setup' | 'mission'>('setup')
  const pageHeading = useRef<HTMLHeadingElement>(null)

  function navigate(next: 'setup' | 'mission') {
    window.location.hash = next === 'mission' ? '/mission' : '/plan'
    setPage(next)
  }

  useEffect(() => {
    function syncPage() {
      setPage(window.location.hash === '#/mission' && targets !== null ? 'mission' : 'setup')
    }
    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [targets])

  useEffect(() => {
    pageHeading.current?.focus()
  }, [page])

  const [location, setLocation] = useState('Oshawa')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const [matches, setMatches] = useState<LocationResult[]>([])
  const [selectedId, setSelectedId] = useState('')

  const [missionId, setMissionId] = useState('')
  const [resolvedLocation, setResolvedLocation] =
    useState<LocationResult | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const requestId = useRef(0)

  // Restore the last mission when its page is refreshed in this tab.
  useEffect(() => {
    if (window.location.hash !== '#/mission') return
    try {
      const saved = JSON.parse(sessionStorage.getItem('skyscout-current-mission') || 'null')
      if (!saved || typeof saved.date !== 'string' || typeof saved.time !== 'string' ||
          typeof saved.place?.name !== 'string' || typeof saved.place?.timezone !== 'string') {
        throw new Error('No saved mission')
      }
      const place: LocationResult = saved.place
      const instant = getObservationDate(saved.date, saved.time, place.timezone)
      const restored = getVisibleObjects(instant, place.latitude, place.longitude)
      setDate(saved.date)
      setTime(saved.time)
      setLocation(place.name)
      setMatches([place])
      setSelectedId(String(place.id))
      setResolvedLocation(place)
      setTargets(restored)
      setMissionId(`${place.latitude}-${place.longitude}-${saved.date}-${saved.time}`)
      setPage('mission')
    } catch {
      window.history.replaceState(null, '', '#/plan')
      setPage('setup')
    }
  }, [])

  function clearMission() {
    requestId.current += 1
    setTargets(null)
    setMissionId('')
    setResolvedLocation(null)
    setError('')
    setLoading(false)
  }

  function changeCity(value: string) {
    setLocation(value)
    setMatches([])
    setSelectedId('')
    clearMission()
  }

  async function findLocations() {
    const currentRequest = ++requestId.current

    setLoading(true)
    setError('')
    setMatches([])
    setSelectedId('')
    setTargets(null)
    setMissionId('')
    setResolvedLocation(null)

    try {
      const results = await searchLocations(location)

      if (currentRequest !== requestId.current) return

      setMatches(results)

      if (results.length === 1) {
        setSelectedId(String(results[0].id))
      }
    } catch (err) {
      if (currentRequest !== requestId.current) return

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to search for locations.'
      )
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false)
      }
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!date || !time) {
      setError('Please select an observation date and time.')
      return
    }

    const place = matches.find(
      match => String(match.id) === selectedId
    )

    if (!place) {
      setError('Search for a city and select the correct location first.')
      return
    }

    clearMission()

    try {
      const observationDate = getObservationDate(
        date,
        time,
        place.timezone
      )

      const results = getVisibleObjects(
        observationDate,
        place.latitude,
        place.longitude
      )

      const newMissionId =
        `${place.latitude}-${place.longitude}-${date}-${time}`

      setMissionId(newMissionId)
      setResolvedLocation(place)
      setTargets(results)
      try {
        sessionStorage.setItem('skyscout-current-mission', JSON.stringify({ place, date, time }))
      } catch { /* Navigation still works when browser storage is unavailable. */ }
      navigate('mission')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    }
  }

  return (
    <main className="app">
      <h1 ref={pageHeading} tabIndex={-1}>✨ SkyScout</h1>
      <nav aria-label="Mission steps" className="page-steps">
        <span aria-current={page === 'setup' ? 'step' : undefined}>1. Plan</span>
        <span aria-current={page === 'mission' ? 'step' : undefined}>2. Explore</span>
      </nav>
      <p>Your personal guide to the night sky.</p>

      {page === 'setup' && (<>
      <h2>Plan Your Stargazing Mission</h2>
      <p>Discover the night sky with a guided 30-minute mission.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="location">Your Location</label>
        <input
          id="location"
          type="text"
          placeholder="e.g. Toronto"
          value={location}
          onChange={e => changeCity(e.target.value)}
          required
        />

        <button
          type="button"
          onClick={findLocations}
          disabled={loading || !location.trim()}
        >
          {loading ? 'Searching...' : 'Find Locations'}
        </button>

        {matches.length > 0 && (
          <>
            <label htmlFor="location-choice">Choose Your City</label>
            <select
              id="location-choice"
              value={selectedId}
              onChange={e => {
                setSelectedId(e.target.value)
                clearMission()
              }}
              required
            >
              <option value="">Select the correct location</option>

              {matches.map(place => (
                <option key={place.id} value={String(place.id)}>
                  {place.name}
                </option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="date">Observation Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={e => {
            setDate(e.target.value)
            clearMission()
          }}
          required
        />

        <label htmlFor="time">Observation Time</label>
        <input
          id="time"
          type="time"
          value={time}
          onChange={e => {
            setTime(e.target.value)
            clearMission()
          }}
          required
        />

        <button type="submit" disabled={loading}>
          Plan My Mission
        </button>
      </form>

      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      </>)}

      {page === 'mission' && (<>
      <button type="button" onClick={() => navigate('setup')}>← Edit details</button>
      <h2>Your Stargazing Mission</h2>
      <p>{date} at {time} · Local time at your observing location</p>
      {resolvedLocation && (
        <p className="resolved-location">
          Observing from: {resolvedLocation.name}
          {' | '}
          Time zone: {resolvedLocation.timezone}
        </p>
      )}

      {resolvedLocation && targets !== null && (<>
        <LocationMap place={resolvedLocation} />
        <NightSky key={missionId} place={resolvedLocation} date={date} time={time} targets={targets} />
      </>)}

      {targets !== null && (
        <section className="results">
          <h2>Your SkyScout Results</h2>

          {targets.length === 0 ? (
            <p>
              No suitable objects found for the selected time.
              Try another observing time.
            </p>
          ) : (
            targets.map(target => (
              <div key={target.name}>
                <h3>{target.name}</h3>
                <p>Altitude: {target.altitude.toFixed(1)}°</p>
                <p>Azimuth: {target.azimuth.toFixed(1)}°</p>
              </div>
            ))
          )}

          <p>
            These are preliminary astronomy recommendations.
            Weather and local obstructions are not included.
          </p>
        </section>
      )}

      {targets !== null && targets.length > 0 && (
        <SkyChart targets={targets} />
      )}

      {targets !== null && targets.length > 0 && (
        <Mission
          key={missionId}
          targets={targets}
          missionId={missionId}
        />
      )}
      </>)}
    </main>
  )
}

export default App
