
import { useRef, useState } from 'react'
import { getVisibleObjects, type SkyTarget } from './astronomy'
import { searchLocation, type LocationResult } from './location'
import { getObservationDate } from './timezone'
import Mission from './Mission'
import SkyChart from './SkyChart'
import './App.css'

function App() {
  const [location, setLocation] = useState('Oshawa')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const [targets, setTargets] = useState<SkyTarget[] | null>(null)
  const [missionId, setMissionId] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [resolvedLocation, setResolvedLocation] =
    useState<LocationResult | null>(null)

  // Identifies the latest request so outdated searches are ignored.
  const requestId = useRef(0)

  // Clear outdated results whenever the observation inputs change.
  function clearPreviousMission() {
    requestId.current += 1
    setTargets(null)
    setMissionId('')
    setResolvedLocation(null)
    setError('')
    setLoading(false)
  }

  // Generate astronomy recommendations for the selected city.
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!location.trim() || !date || !time) {
      setError('Please enter a location, date, and time.')
      return
    }

    const currentRequest = ++requestId.current

    setLoading(true)
    setError('')
    setTargets(null)
    setMissionId('')
    setResolvedLocation(null)

    try {
      // Convert the city name into coordinates and a time zone.
      const place = await searchLocation(location)

      // Ignore responses from previous searches.
      if (currentRequest !== requestId.current) {
        return
      }

      // Interpret the observation time in the city's time zone.
      const observationDate = getObservationDate(
        date,
        time,
        place.timezone
      )

      if (Number.isNaN(observationDate.getTime())) {
        throw new Error('Please select a valid date and time.')
      }

      // Calculate objects using the city's coordinates.
      const results = getVisibleObjects(
        observationDate,
        place.latitude,
        place.longitude
      )

      // Unique identifier for this observing session.
      const newMissionId =
        `${place.latitude}-${place.longitude}-${date}-${time}`

      // Only display results from the latest request.
      if (currentRequest !== requestId.current) {
        return
      }

      setMissionId(newMissionId)
      setResolvedLocation(place)
      setTargets(results)

    } catch (err) {
      if (currentRequest !== requestId.current) {
        return
      }

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )

    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false)
      }
    }
  }

  return (
    <main className="app">

      <h1>✨ SkyScout</h1>
      <p>Your personal guide to the night sky.</p>

      <h2>Plan Your Stargazing Mission</h2>
      <p>
        Discover the night sky with a guided 30-minute mission.
      </p>

      {/* Observation form */}
      <form onSubmit={handleSubmit}>

        <label htmlFor="location">Your Location</label>
        <input
          id="location"
          type="text"
          placeholder="e.g. Toronto"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value)
            clearPreviousMission()
          }}
          required
        />

        <label htmlFor="date">Observation Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value)
            clearPreviousMission()
          }}
          required
        />

        <label htmlFor="time">Observation Time</label>
        <input
          id="time"
          type="time"
          value={time}
          onChange={(e) => {
            setTime(e.target.value)
            clearPreviousMission()
          }}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Finding your sky...' : 'Plan My Mission'}
        </button>

      </form>

      {/* Location lookup errors */}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      {/* Confirm the selected observing location */}
      {resolvedLocation && (
        <p className="resolved-location">
          Observing from: {resolvedLocation.name}
          {' | '}
          Time zone: {resolvedLocation.timezone}
        </p>
      )}

      {/* Astronomy results */}
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

                <p>
                  Altitude: {target.altitude.toFixed(1)}°
                </p>

                <p>
                  Azimuth: {target.azimuth.toFixed(1)}°
                </p>

              </div>
            ))
          )}

          <p>
            These are preliminary astronomy recommendations.
            Weather and local obstructions are not included.
          </p>

        </section>
      )}

      {/* Directional sky chart */}
      {targets !== null && targets.length > 0 && (
        <SkyChart targets={targets} />
      )}

      {/* Guided mission with separately saved progress */}
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
