import type { LocationResult } from './location'

export default function LocationMap({ place }: { place: LocationResult }) {
  const lat = place.latitude
  const lon = place.longitude
  const south = Math.max(-85, Math.min(84.9, lat - 0.04))
  const north = Math.max(south + 0.01, Math.min(85, lat + 0.04))
  const west = Math.max(-180, lon - 0.06)
  const east = Math.min(180, lon + 0.06)
  const params = new URLSearchParams({ bbox: `${west},${south},${east},${north}`, layer: 'mapnik', marker: `${lat},${lon}` })
  const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`
  return <section className="location-map panel" aria-labelledby="map-heading">
    <div className="section-header"><div><p className="eyebrow">Your observing area</p><h2 id="map-heading">Explore the location</h2></div>
      <a href={link} target="_blank" rel="noreferrer">Open larger map ↗</a></div>
    <p>{place.name} · {lat.toFixed(4)}°, {lon.toFixed(4)}°</p>
    <iframe title={`Location map of ${place.name}`} src={`https://www.openstreetmap.org/export/embed.html?${params}`} loading="lazy" referrerPolicy="no-referrer" />
    <p className="fine-print">The marker is the city’s search coordinates, not your exact observing spot. Pan and zoom to explore; map tiles need an internet connection. Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>.</p>
  </section>
}
