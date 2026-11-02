
import { useState } from 'react'
import { getVisibleObjects, type SkyTarget } from './astronomy'
import Mission from './Mission'
import SkyChart from './SkyChart'
import './App.css'

function App() {
  const [location, setLocation] = useState('Oshawa, Ontario')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [targets, setTargets] = useState<SkyTarget[] | null>(null)
  const [missionId, setMissionId] = useState('')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!date || !time) return

    const locationName = location.trim().toLowerCase()

    // Oshawa is the supported test location
    if (
      locationName !== 'oshawa' &&
      locationName !== 'oshawa, ontario'
    ) {
      alert('Only Oshawa is supported in this test version.')
      return
    }

    const observationDate = new Date(`${date}T${time}:00`)

    if (Number.isNaN(observationDate.getTime())) {
      alert('Please select a valid date and time.')
      return
    }

    // Calculate visible objects for Oshawa
    const results = getVisibleObjects(
      observationDate,
      43.8971,
      -78.8658
    )

    // Create a unique identifier for this observing session
    const newMissionId = `oshawa-${date}-${time}`

    setMissionId(newMissionId)
    setTargets(results)
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
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <label htmlFor="date">Observation Date</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label htmlFor="time">Observation Time</label>
        <input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />

        <button type="submit">
          Plan My Mission
        </button>

      </form>

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
            targets.map((target) => (
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

      {/* Guided mission with separate saved progress */}
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
