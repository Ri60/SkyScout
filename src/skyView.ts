import { Body, DefineStar, Equator, Horizon, Illumination, Observer } from 'astronomy-engine'
import starData from './data/stars.6.json'
import constellationData from './data/constellations.lines.json'

export type SkyPoint = { altitude: number; azimuth: number }
export type ViewObject = SkyPoint & { name: string; magnitude: number; color: string; moon?: number }
const radians = Math.PI / 180

// A perspective camera: north=0°, east=90°, elevation=0° at the horizon.
export function project(point: SkyPoint, heading: number, elevation: number, fov: number) {
  const a = (point.azimuth - heading) * radians
  const h = point.altitude * radians
  const e = elevation * radians
  const right = Math.cos(h) * Math.sin(a)
  const up = Math.sin(h) * Math.cos(e) - Math.cos(h) * Math.cos(a) * Math.sin(e)
  const forward = Math.sin(h) * Math.sin(e) + Math.cos(h) * Math.cos(a) * Math.cos(e)
  if (forward <= 0.01) return null
  const scale = 480 / Math.tan(fov * radians / 2)
  return { x: 480 + right / forward * scale, y: 270 - up / forward * scale }
}

export function buildSky(date: Date, latitude: number, longitude: number) {
  const observer = new Observer(latitude, longitude, 0)
  function position(body: Body): SkyPoint {
    const eq = Equator(body, date, observer, true, true)
    return Horizon(date, observer, eq.ra, eq.dec, 'normal')
  }
  // Star8 is a scratch slot, separate from the recommendation catalogue's Star1–3.
  function starPosition(coordinates: number[]) {
    const ra = ((coordinates[0] % 360) + 360) % 360 / 15
    DefineStar(Body.Star8, ra, coordinates[1], 1000)
    return position(Body.Star8)
  }
  const stars = starData.features.map(star => ({
    ...starPosition(star.geometry.coordinates),
    magnitude: star.properties.mag,
    color: Number(star.properties.bv) > 0.8 ? '#ffd9ae' : Number(star.properties.bv) < 0 ? '#c3ddff' : '#f4f5ff'
  })).filter(star => star.altitude > 0)
  const lines = constellationData.features.flatMap(constellation =>
    constellation.geometry.coordinates.map(line => line.map(starPosition)))
  const colors: Record<string, string> = { Moon: '#fff5d7', Mercury: '#d7cdc1', Venus: '#fff6d1', Mars: '#ff9c77', Jupiter: '#ffe0b1', Saturn: '#ecdaa5', Uranus: '#b0eced', Neptune: '#91aaff' }
  const planets: ViewObject[] = [Body.Moon, Body.Mercury, Body.Venus, Body.Mars, Body.Jupiter, Body.Saturn, Body.Uranus, Body.Neptune].map(body => {
    const light = Illumination(body, date)
    return { ...position(body), name: body, magnitude: light.mag, color: colors[body], moon: body === Body.Moon ? light.phase_fraction : undefined }
  }).filter(body => body.altitude > 0)
  const namedStars: Record<string, SkyPoint> = { Sirius: starPosition([101.2875, -16.7161]), Vega: starPosition([279.234, 38.7837]), Arcturus: starPosition([213.915, 19.1824]) }
  return { stars, lines, planets, namedStars, sunAltitude: position(Body.Sun).altitude }
}
