
import { useState } from 'react'
import type { SkyTarget } from './astronomy'

type MissionProps = {
  targets: SkyTarget[]
  missionId: string
}

export default function Mission({
  targets,
  missionId
}: MissionProps) {

  // Unique storage key for each mission
  const storageKey = `skyscout-mission-${missionId}`

  // Load observations saved for this mission
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)

      if (!saved) return []

      const parsed: unknown = JSON.parse(saved)

      return Array.isArray(parsed)
        ? parsed.filter(
            (item): item is string => typeof item === 'string'
          )
        : []
    } catch {
      return []
    }
  })

  // Update the checklist and save it locally
  function toggleCompleted(name: string) {
    const updated = completed.includes(name)
      ? completed.filter(item => item !== name)
      : [...completed, name]

    setCompleted(updated)

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(updated)
      )
    } catch {
      console.warn('Unable to save observation progress.')
    }
  }

  // Convert azimuth to a compass direction
  function getDirection(azimuth: number) {
    const directions = [
      'North',
      'Northeast',
      'East',
      'Southeast',
      'South',
      'Southwest',
      'West',
      'Northwest'
    ]

    return directions[
      Math.round(azimuth / 45) % 8
    ]
  }

  // Calculate progress for this mission
  const completedCount = targets.filter(
    target => completed.includes(target.name)
  ).length

  return (
    <section className="mission">

      <h2>Your 30-Minute Stargazing Mission</h2>

      <p>Follow your observing checklist below.</p>

      {/* Observation schedule */}
      <div className="mission-schedule">

        <h3>Your Observation Plan</h3>

        <div className="schedule-step">
          <strong>0–5 minutes: Get Ready</strong>
          <p>
            Find a safe, open viewing spot away from bright
            lights. Allow your eyes to adjust to the darkness.
          </p>
        </div>

        <div className="schedule-step">
          <strong>5–10 minutes: Find Your Direction</strong>
          <p>
            Use a compass to identify the direction of your
            recommended objects. Look at their altitudes to
            estimate how high above the horizon to search.
          </p>
        </div>

        <div className="schedule-step">
          <strong>10–25 minutes: Observe the Sky</strong>
          <p>
            Look for the recommended objects. Take your time,
            notice their appearance, and check them off
            when you have observed them.
          </p>
        </div>

        <div className="schedule-step">
          <strong>25–30 minutes: Complete Your Mission</strong>
          <p>
            Review your observations and finish your checklist.
          </p>
        </div>

      </div>

      {/* Recommended observation targets */}
      {targets.map(target => (
        <article
          className="mission-card"
          key={target.name}
        >

          <h3>{target.name}</h3>

          <p>
            Direction: {getDirection(target.azimuth)}
          </p>

          <p>
            Altitude: {target.altitude.toFixed(1)}°
          </p>

          <label>
            <input
              type="checkbox"
              checked={completed.includes(target.name)}
              onChange={() => toggleCompleted(target.name)}
            />
            I observed {target.name}
          </label>

        </article>
      ))}

      {/* Mission progress */}
      <p>
        Progress: {completedCount} / {targets.length} completed
      </p>

      {completedCount === targets.length && targets.length > 0 && (
        <p>
          ✨ Mission complete! Great job exploring the night sky!
        </p>
      )}

      <p>
        Your completed observations are saved on this device
        for this specific mission.
      </p>

    </section>
  )
}
