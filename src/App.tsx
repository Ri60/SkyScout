
import { useRef, useState } from 'react'
import { getVisibleObjects, type SkyTarget } from './astronomy'
import { searchLocations, type LocationResult } from './location'
import { getObservationDate } from './timezone'
import Mission from './Mission'
import SkyChart from './SkyChart'
import './App.css'

function App() {
  const [location, setLocation] = useState('Oshawa')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const [matches, setMatches] = useState<LocationResult[]>([])
  const [selectedId, setSelectedId] = useState('')

  const [targets, setTargets] = useState<SkyTarget[] | null>(null)
  const [missionId, setMissionId] = useState('')
  const [resolvedLocation, setResolvedLocation] =
    useState<LocationResult | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const requestId = useRef(0)

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
      <h1>✨ SkyScout</h1>
      <p>Your personal guide to the night sky.</p>

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

      {resolvedLocation && (
        <p className="resolved-location">
          Observing from: {resolvedLocation.name}
          {' | '}
          Time zone: {resolvedLocation.timezone}
        </p>
      )}

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
    </main>
  )
}

export default App
