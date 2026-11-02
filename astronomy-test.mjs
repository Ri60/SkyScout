
import { Body, Equator, Horizon, Observer } from 'astronomy-engine'

const observer = new Observer(43.8971, -78.8658, 0)
const date = new Date('2026-11-03T00:39:00Z')

const objects = [
  Body.Sun,
  Body.Moon,
  Body.Venus,
  Body.Mars,
  Body.Jupiter,
  Body.Saturn
]

// First calculate the Sun's position
const sunEquator = Equator(Body.Sun, date, observer, true, true)

const sunPosition = Horizon(
  date,
  observer,
  sunEquator.ra,
  sunEquator.dec,
  'normal'
)

// Astronomical darkness starts when the Sun is below -18 degrees
const isDark = sunPosition.altitude < -18

console.log('SkyScout - Celestial Object Test')
console.log('Location: Oshawa, Ontario')
console.log('Astronomical darkness:', isDark)
console.log('---------------------------')

// Now check each celestial object
for (const body of objects) {
    
const endDate = new Date(date.getTime() + 30 * 60 * 1000)
const endEquator = Equator(body, endDate, observer, true, true)

const endPosition = Horizon(
  endDate,
  observer,
  endEquator.ra,
  endEquator.dec,
  'normal'
)

  const equator = Equator(body, date, observer, true, true)

  const position = Horizon(
    date,
    observer,
    equator.ra,
    equator.dec,
    'normal'
  )

  console.log(
    `${body}: ${position.altitude.toFixed(2)}° - ${
      position.altitude > 0 ? 'Above horizon' : 'Below horizon'
    }`
  )

  // Only recommend suitable objects during astronomical darkness
  if (
    body !== Body.Sun &&
    isDark &&
    position.altitude >= 20 &&
endPosition.altitude >= 20
  ) {
    console.log(`Recommended: ${body}`)
  }
}
