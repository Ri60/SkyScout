
import { Body, Equator, Horizon, Observer, DefineStar } from 'astronomy-engine'
// Small catalogue of bright stars for beginner observing.
// Right ascension is in hours, declination is in degrees.

const brightStars = [
  {
    name: 'Sirius',
    ra: 6.7525,
    dec: -16.7161,
    magnitude: -1.46
  },
  {
    name: 'Vega',
    ra: 18.6156,
    dec: 38.7837,
    magnitude: 0.03
  },
  {
    name: 'Arcturus',
    ra: 14.2610,
    dec: 19.1824,
    magnitude: -0.05
  }
]

export type SkyTarget = {
  name: string
  altitude: number
  azimuth: number
}

export function getVisibleObjects(
  date: Date,
  latitude: number,
  longitude: number
): SkyTarget[] {
  const observer = new Observer(latitude, longitude, 0)

  const endDate = new Date(date.getTime() + 30 * 60 * 1000)

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

  const sunStart = getPosition(Body.Sun, date)
  const sunEnd = getPosition(Body.Sun, endDate)

  // Require astronomical darkness throughout the mission
  if (sunStart.altitude >= -18 || sunEnd.altitude >= -18) {
    return []
  }

  const objects = [
    Body.Moon,
    Body.Venus,
    Body.Mars,
    Body.Jupiter,
    Body.Saturn
  ]

  const suitable: SkyTarget[] = []

  for (const body of objects) {
    const start = getPosition(body, date)
    const end = getPosition(body, endDate)

    if (start.altitude >= 20 && end.altitude >= 20) {
      suitable.push({
        name: body,
        altitude: start.altitude,
        azimuth: start.azimuth
      })
    }
  }

  // Register and calculate the positions of bright stars
  const starBodies = [
    Body.Star1,
    Body.Star2,
    Body.Star3
  ]

  brightStars.forEach((star, index) => {
    const starBody = starBodies[index]

    // Register approximate star coordinates
    DefineStar(starBody, star.ra, star.dec, 1000)

    const start = getPosition(starBody, date)
    const end = getPosition(starBody, endDate)

    // Select bright stars above 20 degrees throughout the session
    if (
      star.magnitude <= 1.5 &&
      start.altitude >= 20 &&
      end.altitude >= 20
    ) {
      suitable.push({
        name: star.name,
        altitude: start.altitude,
        azimuth: start.azimuth
      })
    }
  })

  return suitable
}
