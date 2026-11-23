# SkyScout

A beginner-friendly sky explorer. Choose a city, date, and local time; browse
catalogued objects above your horizon; filter for your interests; and save
objects to a personal 30-minute observing checklist.

## Run locally

```bash
npm ci
npm run dev
```

Open the Local URL printed by Vite. Node.js 24 was used during development.
Internet access is required for city lookup and geographic map tiles. The star
catalogue and astronomy calculations run locally in the browser. The heavier
exploration module loads only when the observing page is opened.

### Enable Gemini for More Info

Each teammate needs their own Gemini API key to use **More Info** on a sky
object. The rest of SkyScout works without a key.

1. If you already cloned SkyScout, run `git pull --ff-only` from the project
   folder to get the latest code.
2. Sign in to [Google AI Studio](https://aistudio.google.com/apikey). Copy an
   existing Gemini API key or click **Create API key**, give it a name, and
   select your default Gemini project if prompted.
3. Create `.env.local` in the SkyScout root folder, next to `package.json`.
   Replace the placeholder below with your own key.

   ```dotenv
   GEMINI_API_KEY=your_api_key_here
   ```

4. Save the file and run `npm run dev`. If Vite is already running, stop it
   with Ctrl+C and restart it to load the key.
5. Open the local URL printed in the terminal and click **More Info** on a
   sky object to test the setup.

Git ignores `.env.local`. Keep your key out of commits, group chats, and
screenshots.

If **More Info** fails, check the terminal running Vite. If it shows
`Gemini error: 503` with a high-demand message, the model is temporarily
overloaded. Wait a minute or two and click **Try again**.

## Dependencies

Project dependencies are managed through `package.json` and `package-lock.json`. Run `npm ci` to install them.

Additional mapping packages used by the project:

- `leaflet` and `react-leaflet` for the interactive map.
- `@types/leaflet` for Leaflet TypeScript definitions (development dependency).

The DarkSky Finder uses locally bundled coordinates and certified location data. It does not require an API key or additional package installation.

## The experience

1. **Plan a night:** search for a city using the search button, choose the
   correct match, and set a date and time in that city's time zone.
2. **Explore my sky:** opens a location-specific interactive sky followed by
   the full above-horizon catalogue. Browsing is not limited to three objects.
3. **Filter discoveries:** combine All objects / Planets / Moon / Stars /
   Constellations with naked-eye candidates, a minimum-altitude slider, and
   name or HIP-number search. Sort by brightness, highest altitude, or name.
   Results are displayed in batches of 12.
4. **Locate in sky:** turns the camera toward an object and highlights it.
   The sky category changes with the category filter. Camera controls, zoom,
   constellation lines, labels, and a 30-minute preview are available.
5. **My mission:** bookmark any catalogue objects to build your shortlist.
   Up to three original recommendations are selected initially when eligible.
   Follow the 30-minute guide and check off observations. Shortlists and
   checklist progress are stored per location/date/time in localStorage.
6. **Observing location:** a separate tab contains the city-centred
   OpenStreetMap and practical site-selection tips. The marker is a city
   reference location, not GPS or a verified dark-sky site.
7. **DarkSky Finder:** browse officially certified DarkSky locations, including parks, reserves, sanctuaries, communities, urban places, and approved lodging. The finder uses bundled coordinates for 226 officially certified locations and displays the five nearest to the selected location.

The current observation can be restored on refreshing `#/mission` in the same
tab through sessionStorage. Edit details retains the form values. Invalid or
ambiguous daylight-saving times are rejected; stale city searches are ignored.

## Catalogue and visibility rules

- **Stars:** 5,044 entries from D3-Celestial's `stars.6.json`; only those above
  the horizon at the selected time appear in the browser. Named stars use
  catalogue names; unnamed entries use their Hipparcos (HIP) identifier.
- **Solar system:** the Moon plus Mercury, Venus, Mars, Jupiter, Saturn,
  Uranus, and Neptune, when above the horizon. The Sun is not an observing
  target. Moon illumination is displayed numerically; symbols are enlarged.
- **Constellations:** 89 line figures grouped into 88 constellation IDs
  (Serpens has two figures). A constellation is offered when at least one
  line segment has both endpoints above the horizon. Partial patterns are
  labelled. The guide coordinate is the highest visible line vertex, not
  the position of an entire constellation or an IAU boundary calculation.
- **Naked-eye candidates:** an educational dark-sky heuristic: magnitude ≤6
  and solar altitude below −18°. Constellations are star-pattern candidates,
  not point objects with a single magnitude. Their individual stars may
  still be too faint. This filter deliberately offers no daytime candidates.
- **Original suggestions:** `astronomy.ts` still selects up to three bright
  objects from its smaller catalogue after sampling minutes 0, 15, and 30.
  Each must stay above 20°, magnitude ≤1.5, with the Sun below −18°.
  This is separate from browsing the full catalogue and custom shortlisting.
- **Certified DarkSky locations:** the directory contains officially certified
  locations only. Coordinates are available for 226 entries; locations without
  verified coordinates are excluded from the finder.

Above-horizon positions do not guarantee visibility. Weather, obstructions,
terrain, Moon glare, and light pollution are not measured. Custom mission
objects are checked at the start time, so use the preview to inspect movement.
The drawn horizon is flat, star colours approximate, and symbols enlarged for
identification. No camera/AR or phone-compass tracking is implemented.

## Code structure

| File | Responsibility |
| --- | --- |
| `src/App.tsx` | Planning form, location requests, routing, session restoration |
| `src/Landing.tsx` | Opening-page introduction and how-it-works layout |
| `src/ObservationPage.tsx` | Discover / Mission / Location tabs and saved shortlist |
| `src/ObjectExplorer.tsx` | Catalogue cards, filters, search, sorting, pagination |
| `src/catalogue.ts` | Typed catalogue, visibility candidates, and combined filters |
| `src/skyView.ts` | Local star, planet, and constellation positions and projection |
| `src/NightSky.tsx` | Sky camera, preview time, filters, target selection, controls |
| `src/sky/NightSkyCanvas.tsx` | Composition of the SVG drawing layers |
| `src/sky/*Layer.tsx`, `SkyGradients.tsx`, `TargetLabels.tsx` | Focused rendering components |
| `src/Mission.tsx` | Observing guide and persistent completion checklist |
| `src/LocationMap.tsx`, `src/SkyChart.tsx` | Geographic map and overhead target chart |
| `src/location.ts`, `src/timezone.ts` | Open-Meteo geocoding and Luxon time conversion |
| `src/astronomy.ts` | Original three-target recommendation rules |
| `src/Icons.tsx`, `src/App.css`, `src/index.css` | Visual system and responsive layouts |
| `src/data/` | Bundled stars, star names, constellation names, and line data |
| `src/darkSkyTypes.ts` | DarkSky directory, category, and coordinate types |
| `src/darkSkyDirectory.ts` | Officially certified DarkSky location directory |
| `src/darkSkyCoordinates.ts` | Coordinates for certified DarkSky locations |
| `src/darkSkyLocations.ts` | Combines certified entries with available coordinates |
| `src/DarkSkyFinder.tsx` | Finds and displays the five nearest certified DarkSky locations |

## Checks

```bash
npm run build
npm run lint
npx vitest run --environment jsdom
```

Tests cover astronomical input validation, projection, location/time changes,
full-catalogue categories, combined visibility/search/altitude filters, city
selection, routing/restoration, sky controls, shortlist persistence, and saved
observation completion. The known Vancouver time-zone assertion differs from
this runtime's time-zone data (it expects 05:00Z while the runtime returns
04:00Z); this pre-existing failure is not a regression introduced by the UI.

Browser verification uses a deterministic city-lookup fixture and covers the
complete planning, filtering, location, target-focusing, mission-save, refresh,
and mobile-layout flow. It is not a claim of live geocoding or map-tile uptime.

## Sources

- [Astronomy Engine](https://github.com/cosinekitty/astronomy) for positions.
- [D3-Celestial](https://github.com/ofrohn/d3-celestial) for bundled star,
  star-name, constellation-name and line data. The BSD licence is retained in
  `CELESTIAL-LICENSE.txt`.
- [Open-Meteo](https://open-meteo.com/en/docs/geocoding-api) for city lookup.
- [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) for maps.
- [National Park Service: Rate Your Night Sky](https://www.nps.gov/subjects/nightskies/rateyoursky.htm)
  for context on limiting magnitude and dark-sky visibility.
- [International Dark-Sky Association](https://darksky.org/) for the official certified DarkSky location directory.

The historical teammate guide, mentor demo, and independent initial astronomy
comparison remain in `TEAMMATE_GUIDE.md`, `MENTOR_DEMO.md`, and
`ASTRONOMY_VALIDATION.md`; they describe earlier milestones and may not match
all current screens or test counts.
