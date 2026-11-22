
import type { LocationResult } from './location'
import { DARK_SKY_LOCATIONS } from './darkSkyLocations'
import { calculateDistance } from './distance'

export default function DarkSkyFinder({
  place
}: {
  place: LocationResult
}) {
  
const nearbyLocations = DARK_SKY_LOCATIONS
  .map((location) => ({
    ...location,
    distance: calculateDistance(
      place.latitude,
      place.longitude,
      location.latitude,
      location.longitude
    )
  }))
  .sort((a, b) => a.distance - b.distance)
  .slice(0, 5)


  return (
    <section className="dark-sky-finder panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">FIND YOUR DARK SKY</p>
          <h2>Explore Nearby Dark-Sky Locations</h2>
        </div>
      </div>

      <p>
        Discover officially certified Dark-Sky places near {place.name}
        <br />
        Includes parks, reserves, sanctuaries, communities,
        urban night-sky locations, and approved lodging.
        <br />
        All locations shown are recognized by DarkSky International for their commitment to protecting the night sky.
      </p>

      <div className="dark-sky-list">
        {nearbyLocations.map((location) => (
          <article key={location.name} className="dark-sky-card">
            <div>
                <h3>{location.name}</h3>
                <p>{location.region}</p>

                {location.category && (
                <p className="dark-sky-category">
                    Certified: {location.category}
                </p>
                )}

                <p>{location.description}</p>
            </div>

            <strong>
              {Math.round(location.distance).toLocaleString()} km
            </strong>
          </article>
        ))}
      </div>

      <p className="fine-print">
        These are curated destinations, not live light-pollution
        measurements. Actual sky darkness depends on weather,
        nearby lighting, and observing conditions. Check access
        and opening hours before travelling.
      </p>
    </section>
  )
}
