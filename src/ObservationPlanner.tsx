import { useMemo, useState, type FormEvent } from 'react'
import { DateTime } from 'luxon'
import { buildSky } from './skyView'
import { compassDirection } from './catalogue'
import type { LocationResult } from './location'
import { Icon } from './Icons'

type PlannerProps = {
  place: LocationResult
  availableObjects: { name: string }[]
}

type ForecastResponse = {
  hourly?: {
    time?: string[]
    cloud_cover?: (number | null)[]
    precipitation_probability?: (number | null)[]
  }
}

type ObservationSlot = {
  date: string
  time: string
  altitude: number
  azimuth: number
  cloudCover: number | null
  precipitation: number | null
  score: number
}

const PLANETS = [
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune'
]

function positionForObject(
  sky: ReturnType<typeof buildSky>,
  objectName: string
): { altitude: number; azimuth: number } | null {
  const planet = sky.planets.find(
    (object) => object.name.toLowerCase() === objectName.toLowerCase()
  )
  if (planet) return planet

  const star = sky.stars.find(
    (object) => object.name.toLowerCase() === objectName.toLowerCase()
  )
  if (star) return star

  const constellation = sky.constellations.find(
    (object) => object.name.toLowerCase() === objectName.toLowerCase()
  )
  if (constellation) return constellation

  return null
}

function observingAdvice(name: string) {
  const normalized = name.toLowerCase()

  if (normalized === 'jupiter') {
    return [
      'Naked eye: Jupiter appears as a very bright, steady-looking point of light.',
      'Binoculars: Use a steady support to look for Jupiter’s four largest moons.',
      'Telescope: A small telescope can reveal the planet’s cloud bands and its largest moons.'
    ]
  }

  if (normalized === 'saturn') {
    return [
      'Naked eye: Look for a steady, yellowish point of light.',
      'Binoculars: Saturn will still look star-like in most binoculars.',
      'Telescope: A telescope with sufficient magnification can reveal Saturn’s rings.'
    ]
  }

  if (normalized === 'mars') {
    return [
      'Naked eye: Look for its distinctive orange-red colour.',
      'Binoculars: They help locate Mars but generally will not show surface detail.',
      'Telescope: Higher magnification may reveal a small disc; detail depends on its distance from Earth.'
    ]
  }

  if (normalized === 'venus') {
    return [
      'Naked eye: Venus is exceptionally bright and is usually seen near sunrise or sunset.',
      'Binoculars: They can help locate it, but never point them near the Sun.',
      'Telescope: Venus may show phases, similar to the Moon.'
    ]
  }

  if (normalized === 'mercury') {
    return [
      'Naked eye: Look shortly after sunset or before sunrise, close to the horizon.',
      'Binoculars: Use only when the Sun is safely below the horizon.',
      'Telescope: A telescope may show Mercury’s phases; atmospheric turbulence near the horizon can affect the view.'
    ]
  }

  if (normalized === 'uranus' || normalized === 'neptune') {
    return [
      'Naked eye: These planets are generally too faint to see without optical aid.',
      'Binoculars: Binoculars may help locate the object under a dark, clear sky.',
      'Telescope: Use a finder chart and a telescope; expect a small, star-like disc.'
    ]
  }

  return [
    'Start with the naked eye to identify the object and its position.',
    'Binoculars can help with brighter stars and larger sky patterns.',
    'Use a star chart or the SkyScout sky view to confirm you have found the right object.'
  ]
}

export default function ObservationPlanner({
  place,
  availableObjects
}: PlannerProps) {
  const suggestions = useMemo(
    () =>
      [...new Set([...PLANETS, ...availableObjects.map((object) => object.name)])]
        .sort((a, b) => a.localeCompare(b)),
    [availableObjects]
  )

  const [objectName, setObjectName] = useState('Jupiter')
  const [result, setResult] = useState<ObservationSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [weatherNote, setWeatherNote] = useState('')

  async function findBestTime(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const requestedName = objectName.trim()

    if (!requestedName) {
      setError('Enter the name of a planet, star, or constellation.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setWeatherNote('')

    try {
      const params = new URLSearchParams({
        latitude: String(place.latitude),
        longitude: String(place.longitude),
        hourly: 'cloud_cover,precipitation_probability',
        forecast_days: '16',
        timezone: place.timezone
      })

      let forecastByHour = new Map<
        string,
        { cloudCover: number | null; precipitation: number | null }
      >()

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params.toString()}`
        )
        if (!response.ok) throw new Error('Weather forecast unavailable.')

        const forecast: ForecastResponse = await response.json()
        const times = forecast.hourly?.time ?? []
        const clouds = forecast.hourly?.cloud_cover ?? []
        const precipitation =
          forecast.hourly?.precipitation_probability ?? []

        forecastByHour = new Map<
          string,
          { cloudCover: number | null; precipitation: number | null }
        >(
          times.map((time, index) => [
            time,
            {
              cloudCover: clouds[index] ?? null,
              precipitation: precipitation[index] ?? null
            }
          ] as const)
        )
        setWeatherNote(
          'Weather conditions are included from the Open-Meteo forecast.'
        )
      } catch {
        setWeatherNote(
          'The weather forecast could not be loaded. Results are ranked using astronomical visibility only.'
        )
      }

      const start = DateTime.now()
        .setZone(place.timezone)
        .startOf('hour')
        .plus({ hours: 1 })

      let best: ObservationSlot | null = null

      // Check evening and overnight hours for the next 14 days.
      for (let offset = 0; offset < 14 * 24; offset += 1) {
        const localTime = start.plus({ hours: offset })

        if (localTime.hour >= 6 && localTime.hour < 17) continue

        const sky = buildSky(
          localTime.toJSDate(),
          place.latitude,
          place.longitude
        )

        // Require astronomical darkness or sufficiently dark twilight.
        if (sky.sunAltitude > -12) continue

        const position = positionForObject(sky, requestedName)
        if (!position || position.altitude < 15) continue

        const key = localTime.toFormat("yyyy-MM-dd'T'HH:mm")
        const weather = forecastByHour.get(key) ?? {
          cloudCover: null,
          precipitation: null
        }

        const score =
          weather.cloudCover === null
            ? position.altitude
            : position.altitude * 0.6 +
              (100 - weather.cloudCover) * 0.3 +
              (100 - (weather.precipitation ?? 0)) * 0.1

        const candidate: ObservationSlot = {
          date: localTime.toISODate() ?? '',
          time: localTime.toFormat('h:mm a'),
          altitude: position.altitude,
          azimuth: position.azimuth,
          cloudCover: weather.cloudCover,
          precipitation: weather.precipitation,
          score
        }

        if (!best || candidate.score > best.score) best = candidate
      }

      if (!best) {
        setError(
          `No suitable dark-sky observing window for ${requestedName} was found in the next 14 days. Try another object or check again later.`
        )
      } else {
        setResult(best)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to calculate an observation window. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const formattedDate = result
    ? DateTime.fromISO(result.date, { zone: place.timezone }).toLocaleString({
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    : ''

  return (
    <section className="observation-planner" aria-labelledby="planner-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PLAN YOUR NEXT LOOK UP</p>
          <h2 id="planner-heading">Find the best time to observe.</h2>
          <p>
            Choose a celestial object and SkyScout will compare upcoming nights
            for your selected location: {place.name}.
          </p>
        </div>
        <span className="planner-icon">
          <Icon name="spark" size={25} />
        </span>
      </div>

      <form className="observation-search-form" onSubmit={findBestTime}>
        <label htmlFor="planner-object">What would you like to observe?</label>
        <div className="observation-search-row">
          <input
            id="planner-object"
            list="planner-object-suggestions"
            value={objectName}
            onChange={(event) => {
              setObjectName(event.target.value)
              setResult(null)
              setError('')
            }}
            placeholder="Try Jupiter, Saturn, Sirius…"
            autoComplete="off"
          />
          <datalist id="planner-object-suggestions">
            {suggestions.map((name) => (
              <option value={name} key={name} />
            ))}
          </datalist>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-dot" /> Searching nights…
              </>
            ) : (
              <>
                <Icon name="spark" size={17} /> Find best time
              </>
            )}
          </button>
        </div>
        <p className="form-hint">
          We’ll check the next 14 nights for darkness, altitude and forecast
          conditions.
        </p>
      </form>

      {error && (
        <div className="planner-feedback planner-error" role="alert">
          <Icon name="info" size={18} />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="observation-result" aria-live="polite">
          <div className="observation-result-heading">
            <div>
              <p className="eyebrow">YOUR BEST UPCOMING WINDOW</p>
              <h3>{requestedObjectTitle(objectName)}</h3>
              <p>{formattedDate}</p>
            </div>
            <span className="result-mark">
              <Icon name="check" size={17} /> Best match
            </span>
          </div>

          <div className="observation-result-grid">
            <div className="observation-result-stat">
              <Icon name="clock" size={19} />
              <small>LOCAL TIME</small>
              <strong>{result.time}</strong>
            </div>
            <div className="observation-result-stat">
              <Icon name="compass" size={19} />
              <small>ALTITUDE</small>
              <strong>{result.altitude.toFixed(0)}°</strong>
            </div>
            <div className="observation-result-stat">
              <Icon name="compass" size={19} />
              <small>DIRECTION</small>
              <strong>{compassDirection(result.azimuth)}</strong>
            </div>
            <div className="observation-result-stat">
              <Icon name="info" size={19} />
              <small>CLOUD COVER</small>
              <strong>
                {result.cloudCover === null
                  ? 'Unavailable'
                  : `${Math.round(result.cloudCover)}%`}
              </strong>
            </div>
          </div>

          <div className="observation-howto">
            <h4>
              <Icon name="spark" size={18} /> How to observe{' '}
              {requestedObjectTitle(objectName)}
            </h4>
            <ul>
              {observingAdvice(objectName).map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
          <p className="planner-disclaimer">
            {weatherNote} This is a calculated recommendation, not a guarantee
            of visibility. Local buildings, trees, haze and light pollution may
            affect your view. Never point optical equipment at the Sun.
          </p>
        </div>
      )}

      {!result && !error && (
        <div className="planner-empty">
          <Icon name="moon" size={30} />
          <h3>A better night is out there.</h3>
          <p>
            Search for an object to compare its upcoming viewing opportunities.
          </p>
        </div>
      )}
    </section>
  )
}

function requestedObjectTitle(value: string) {
  const trimmed = value.trim()
  return trimmed
    ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
    : 'Selected object'
}
