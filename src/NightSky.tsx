import { useEffect, useMemo, useState } from 'react'
import { getObservationDate } from './timezone'
import type { LocationResult } from './location'
import type { SkyTarget } from './astronomy'
import { buildSky } from './skyView'
import type { Category } from './catalogue'
import type { SkyScene } from './sky/types'
import NightSkyCanvas from './sky/NightSkyCanvas'
import { COMPASS_DIRECTIONS } from './sky/types'

export default function NightSky({
  place,
  date,
  time,
  targets,
  baseSky,
  category = 'all',
  nakedEyeOnly = false,
  focusTarget
}: {
  place: LocationResult
  date: string
  time: string
  targets: SkyTarget[]
  baseSky?: SkyScene
  category?: Category
  nakedEyeOnly?: boolean
  focusTarget?: SkyTarget | null
}) {
  const [heading, setHeading] = useState(180)
  const [elevation, setElevation] = useState(25)
  const [fov, setFov] = useState(100)
  const [offset, setOffset] = useState(0)
  const [lines, setLines] = useState(true)
  const [labels, setLabels] = useState(true)
  const [limit, setLimit] = useState(5)
  const instant = useMemo(
    () =>
      new Date(
        getObservationDate(date, time, place.timezone).getTime() +
          offset * 60000
      ),
    [date, time, place.timezone, offset]
  )
  const sky = useMemo(
    () =>
      offset === 0 && baseSky
        ? baseSky
        : buildSky(instant, place.latitude, place.longitude),
    [instant, place.latitude, place.longitude, offset, baseSky]
  )
  const filteredSky = useMemo(
    () => ({
      ...sky,
      stars:
        ['all', 'star', 'constellation'].includes(category) &&
        (!nakedEyeOnly || sky.sunAltitude < -18)
          ? sky.stars
          : [],
      planets: sky.planets.filter(
        (body) =>
          (category === 'all' ||
            (category === 'moon'
              ? body.name === 'Moon'
              : category === 'planet' && body.name !== 'Moon')) &&
          (!nakedEyeOnly || (sky.sunAltitude < -18 && body.magnitude <= 6))
      ),
      lines:
        ['all', 'constellation'].includes(category) &&
        (!nakedEyeOnly || sky.sunAltitude < -18)
          ? sky.lines
          : []
    }),
    [sky, category, nakedEyeOnly]
  )
  const visibleTargets = targets.filter(
    (target) =>
      filteredSky.stars.some((star) => star.name === target.name) ||
      filteredSky.planets.some((body) => body.name === target.name)
  )

  // A catalogue selection is an external camera command at the session start time.
  useEffect(() => {
    if (!focusTarget) return
    setOffset(0)
    setLimit((focusTarget.magnitude ?? 0) > 6 ? 9 : 6)
    setLabels(true)
    setHeading(focusTarget.azimuth)
    setElevation(Math.min(80, Math.max(0, focusTarget.altitude)))
  }, [focusTarget])

  const highlightedTarget = focusTarget
    ? (sky.planets.find((body) => body.name === focusTarget.name) ??
      sky.stars.find((star) =>
        focusTarget.id
          ? star.id === focusTarget.id
          : star.name === focusTarget.name
      ) ??
      sky.constellations.find((group) => group.id === focusTarget.id))
    : undefined
  const cardinal = COMPASS_DIRECTIONS[Math.round(heading / 45) % 8]
  function focus(target: SkyTarget) {
    // Use the preview's current positions for moving planets.
    const current =
      sky.planets.find((body) => body.name === target.name) ?? target
    setHeading(current.azimuth)
    setElevation(Math.min(80, Math.max(0, current.altitude)))
  }
  const displayedTime = new Intl.DateTimeFormat('en-CA', {
    timeZone: place.timezone,
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(instant)
  return (
    <section className="night-sky panel" aria-labelledby="night-heading">
      <div className="section-header">
        <div>
          <p className="eyebrow">Look up and explore</p>
          <h2 id="night-heading">Your night sky</h2>
        </div>
        <span className="sky-badge">
          Facing {cardinal} · {Math.round(heading)}°
        </span>
      </div>
      <p>
        {displayedTime} · {place.name}
      </p>
      <div className="sky-toolbar" aria-label="Sky direction">
        {[
          ['North', 0],
          ['East', 90],
          ['South', 180],
          ['West', 270]
        ].map(([name, angle]) => (
          <button
            key={name}
            type="button"
            onClick={() => setHeading(Number(angle))}
          >
            {name}
          </button>
        ))}
      </div>
      <NightSkyCanvas
        sky={filteredSky}
        targets={visibleTargets}
        heading={heading}
        elevation={elevation}
        fieldOfView={fov}
        magnitudeLimit={nakedEyeOnly ? Math.min(6, limit) : limit}
        showConstellations={lines}
        showLabels={labels}
        description={`Simulated sky facing ${cardinal} at ${displayedTime}. Use the controls below to change the view.`}
        onHeadingChange={setHeading}
        highlightedTarget={highlightedTarget}
      />
      {sky.sunAltitude >= -18 && (
        <p className="sky-notice">
          This preview time is in daylight or twilight; faint objects may not be
          visible outdoors.
        </p>
      )}
      <p className="fine-print">
        Drag left or right to turn, or use the controls. This is a calculated
        simulation with an ideal flat horizon; weather, buildings, and light
        pollution are not included. Object sizes are enlarged for
        identification; the Moon’s illumination is shown as a percentage.
      </p>
      <details className="sky-control-disclosure">
        <summary>View sky controls</summary>
        <div className="sky-controls">
          <label>
            Direction: {Math.round(heading)}°
            <input
              aria-label="Viewing direction"
              type="range"
              min="0"
              max="359"
              value={heading}
              onChange={(e) => setHeading(Number(e.target.value))}
            />
          </label>
          <label>
            Look up: {Math.round(elevation)}°
            <input
              aria-label="Viewing elevation"
              type="range"
              min="0"
              max="80"
              value={elevation}
              onChange={(e) => setElevation(Number(e.target.value))}
            />
          </label>
          <label>
            Field of view: {fov}°
            <input
              aria-label="Field of view"
              type="range"
              min="35"
              max="120"
              value={fov}
              onChange={(e) => setFov(Number(e.target.value))}
            />
          </label>
          <label>
            Preview time: +{offset} min
            <input
              aria-label="Preview minutes"
              type="range"
              min="0"
              max="30"
              step="5"
              value={offset}
              onChange={(e) => setOffset(Number(e.target.value))}
            />
          </label>
          <label>
            Star detail
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value="3">Bright stars</option>
              <option value="5">More stars</option>
              <option value="6">Dark-sky detail</option>
              <option value="9">Include faint planets</option>
            </select>
          </label>
          <div className="sky-toggles">
            <label>
              <input
                type="checkbox"
                checked={lines}
                onChange={(e) => setLines(e.target.checked)}
              />
              Constellation lines
            </label>
            <label>
              <input
                type="checkbox"
                checked={labels}
                onChange={(e) => setLabels(e.target.checked)}
              />
              Object labels
            </label>
          </div>
        </div>
      </details>
      {visibleTargets.length > 0 && (
        <div className="sky-toolbar">
          <span>Find a mission target:</span>
          {visibleTargets.map((target) => (
            <button
              type="button"
              key={target.name}
              onClick={() =>
                focus({ ...target, ...(sky.namedStars[target.name] ?? {}) })
              }
            >
              {target.name}
            </button>
          ))}
        </div>
      )}
      <p className="fine-print">
        Star and constellation data:{' '}
        <a
          href="https://github.com/ofrohn/d3-celestial"
          target="_blank"
          rel="noreferrer"
        >
          D3-Celestial
        </a>
        . Positions: Astronomy Engine. The mission checklist remains tied to
        your original observation time.
      </p>
    </section>
  )
}
