
import {
  Body,
  Equator,
  Horizon,
  Observer,
  DefineStar,
  Illumination
} from 'astronomy-engine'

// Small catalogue of beginner-friendly bright stars
// RA is in hours; declination is in degrees (J2000).
const brightStars = [
  {
    name: 'Sirius',
    ra: 6.7525,
    dec: -16.7161,
    magnitude: -1.46,
    description:
      'The brightest star in the night sky. Look for a brilliant star that may appear to twinkle in different colours.'
  },
  {
    name: 'Vega',
    ra: 18.6156,
    dec: 38.7837,
    magnitude: 0.03,
    description:
      'A bright blue-white star in the constellation Lyra. It is part of the Summer Triangle.'
  },
  {
    name: 'Arcturus',
    ra: 14.2610,
    dec: 19.1824,
    magnitude: -0.05,
    description:
      'A bright orange-coloured star in the constellation Boötes.'
  }
]

const descriptions: Record<string, string> = {
  Moon:
    'Look for the Moon and notice its illuminated shape. A telescope is not needed to see its phase.',
  Venus:
    'An exceptionally bright planet that often appears as a white point of light.',
  Mars:
    'A planet that can appear reddish or orange. Its brightness varies throughout the year.',
  Jupiter:
    'A very bright planet that usually appears as a steady point of light.',
  Saturn:
    'A planet that looks like a point of light to the naked eye. Its rings require optical magnification.'
}

// Keep existing fields for compatibility
export type SkyTarget = {
  name: string
  altitude: number
  azimuth: number
  magnitude?: number
  description?: string
}

// Configuration for our first MVP recommendation rules
const MIN_ALTITUDE = 20
const MAX_MAGNITUDE = 1.5
const MAX_TARGETS = 3

export function getVisibleObjects(
  date: Date,
  latitude: number,
  longitude: number
): SkyTarget[] {

  // Validate calculation inputs
  if (
    Number.isNaN(date.getTime()) ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error('Invalid observation date or coordinates.')
  }

  const observer = new Observer(latitude, longitude, 0)

  // Check the beginning, middle, and end of the mission
  const times = [0, 15, 30].map(minutes =>
    new Date(date.getTime() + minutes * 60 * 1000)
  )

  function getPosition(body: Body, time: Date) {
    const equator = Equator(body, time, observer, true, true)

    return Horizon(
      time,
      observer,
      equator.ra,
      equator.dec,
      'normal'
    )
  }

  // Require astronomical darkness throughout the session
  const isDark = times.every(time => {
    const sun = getPosition(Body.Sun, time)
    return sun.altitude < -18
  })

  if (!isDark) {
    return []
  }

  const suitable: SkyTarget[] = []

  // Calculate Moon and bright planets
  const planets = [
    Body.Moon,
    Body.Venus,
    Body.Mars,
    Body.Jupiter,
    Body.Saturn
  ]

  for (const body of planets) {

    const positions = times.map(time =>
      getPosition(body, time)
    )

    // Object must remain sufficiently above the horizon
    const highEnough = positions.every(
      position => position.altitude >= MIN_ALTITUDE
    )

    if (!highEnough) continue

    // Estimate apparent visual magnitude
    const magnitude = Illumination(body, date).mag

    if (
      !Number.isFinite(magnitude) ||
      magnitude > MAX_MAGNITUDE
    ) {
      continue
    }

    suitable.push({
      name: body,
      altitude: positions[0].altitude,
      azimuth: positions[0].azimuth,
      magnitude,
      description: descriptions[body]
    })
  }

  // Astronomy Engine supports up to eight custom stars
  const starBodies = [
    Body.Star1,
    Body.Star2,
    Body.Star3
  ]

  brightStars.forEach((star, index) => {

    const starBody = starBodies[index]

    // Register approximate J2000 coordinates
    DefineStar(starBody, star.ra, star.dec, 1000)

    const positions = times.map(time =>
      getPosition(starBody, time)
    )

    const highEnough = positions.every(
      position => position.altitude >= MIN_ALTITUDE
    )

    if (
      !highEnough ||
      star.magnitude > MAX_MAGNITUDE
    ) {
      return
    }

    suitable.push({
      name: star.name,
      altitude: positions[0].altitude,
      azimuth: positions[0].azimuth,
      magnitude: star.magnitude,
      description: star.description
    })
  })

  // Smaller magnitudes indicate brighter objects
  suitable.sort((a, b) =>
    (a.magnitude ?? Infinity) -
    (b.magnitude ?? Infinity)
  )

  // Keep the mission short and beginner-friendly
  return suitable.slice(0, MAX_TARGETS)
}
