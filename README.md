# SkyScout

**SkyScout** is a beginner-friendly stargazing mission planner. Given a city, observation date, and local time, it identifies a small set of potentially observable celestial objects, displays their approximate positions on a directional sky chart, and generates a guided 30-minute observation checklist.

**Repository:** https://github.com/Ri60/SkyScout  
**Status:** Working MVP prototype; astronomical accuracy and real-world visibility require further validation.

## Features

- **Location search:** Looks up a city’s coordinates and time zone using Open-Meteo geocoding.
- **Local-time handling:** Uses Luxon to interpret the observation time in the selected location and reject ambiguous or nonexistent daylight-saving times.
- **Celestial positions:** Uses Astronomy Engine to calculate positions for the Moon, selected planets, and a small set of bright stars.
- **Target recommendations:** Applies astronomical-darkness, altitude, and apparent-brightness checks and recommends up to three targets.
- **Sky chart:** Shows recommended objects on a simplified directional SVG sky chart.
- **30-minute mission:** Provides a four-stage observing plan and a checklist.
- **Saved progress:** Stores checklist completion for each mission in the browser's local storage.

## Technology

| Layer | Technology |
| --- | --- |
| User interface | React, TypeScript, Vite, CSS |
| Astronomy | `astronomy-engine` |
| City lookup | Open-Meteo Geocoding API |
| Time zones | Luxon |
| Visualization | SVG |
| Local persistence | Browser `localStorage` |
| Testing and code checks | Vitest, Oxlint, TypeScript build |
| Collaboration | Git and GitHub |

## Getting started

### Prerequisites

- Git
- Node.js and npm (Node.js 24 was used during initial development)
- A code editor, such as VS Code
- Internet access for installation and location lookup

From a terminal in a directory where the repository should be downloaded:

```powershell
git clone https://github.com/Ri60/SkyScout.git
cd SkyScout
npm ci
npm run dev
```

Open the `Local:` address printed by Vite, typically `http://localhost:5173/`. The port may vary. Keep the development server running while using the app.

For an existing clone, safely save any local changes before updating:

```powershell
git pull origin main
npm ci
npm run dev
```

## Using the application

1. Enter an observing city and verify the resolved location.
2. Select an observation date and **local time in that city**.
3. Generate a mission.
4. Review the recommended targets, their directions, and the sky chart.
5. Follow the observation schedule and mark completed targets.

An empty result can be expected during daytime or when no catalogued object meets the current filters.

## Running checks

```powershell
npx vitest run       # Automated tests
npm run lint        # Lint checks
npm run build       # Type checking and production build
npm run preview     # Preview the built application
```

At the time of documentation, the local development run reported **eight passing tests** (four astronomy-related and four time-zone-related), a successful build, and no lint findings. Run the checks on the current revision to verify its status.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Form, application state, location and time handling, mission generation |
| `src/location.ts` | Open-Meteo city lookup |
| `src/timezone.ts` | Local date/time conversion and daylight-saving checks |
| `src/astronomy.ts` | Position calculations, target filtering, and ranking |
| `src/SkyChart.tsx` | Directional SVG chart |
| `src/Mission.tsx` | Observation schedule, target guidance, checklist, persistence |
| `src/App.css`, `src/index.css` | Styling |
| `src/astronomy.test.ts` | Astronomy behavior tests |
| `src/timezone.test.ts` | Time-zone behavior tests |
| `TEAMMATE_GUIDE.md` | Setup, architecture, testing, and contribution guide |

## Recommendation logic

```text
City + local date/time
         |
         v
Location lookup -> latitude, longitude, time zone
         |
         v
Time-zone conversion -> observation instant
         |
         v
Astronomy Engine -> Sun and target positions
         |
         v
Darkness / altitude / brightness filtering
         |
         v
Up to three ranked targets
         |
         +--> Directional sky chart
         +--> Guided mission and saved checklist
```

The current prototype samples the beginning, midpoint, and end of a 30-minute observing window. It uses an approximate astronomical-darkness cutoff of Sun altitude below **−18°**, target altitude of at least **20°**, and apparent magnitude no greater than **1.5**. Lower magnitudes indicate brighter objects. These are prototype selection rules, **not a guarantee of visibility**.

## Limitations

- The geocoder currently selects the first matching city; locations with similar names can be confused.
- The object catalogue is intentionally limited.
- Clouds, light pollution, atmospheric conditions, obstructions, and local horizon visibility are not modelled.
- The chart displays recommended targets rather than a complete sky atlas.
- The observation schedule is a fixed guide, not a live timer.
- Checklist data is browser-local and does not synchronize across devices.
- Astronomical outputs have not yet undergone comprehensive independent reference validation.
- Existing automated tests cover core cases, not all UI interactions or edge conditions.

## Contributing

Contributions should be made on feature branches and reviewed through GitHub pull requests.

```powershell
git switch main
git pull origin main
git switch -c feature/short-description
# Implement and test the change
npx vitest run
npm run lint
npm run build
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

Open a pull request and include the change summary, test results, and any known limitations. Avoid committing generated `dist/` or `node_modules/` directories. See [TEAMMATE_GUIDE.md](TEAMMATE_GUIDE.md) for more detailed instructions.

## Next priorities

- Verify celestial positions against independent astronomy references.
- Improve city selection for ambiguous search results.
- Expand and validate the bright-object catalogue.
- Add UI, storage, and error-handling tests.
- Refine accessibility and the no-target user experience.

## Team

SkyScout is a collaborative software project. Repository access is managed through GitHub collaborators; contribution history is recorded through Git commits and pull requests. Team member details can be maintained separately from public project documentation.

## Scope

SkyScout is intended as a beginner-oriented prototype, not a safety-critical navigation or professional astronomical prediction tool. It does not currently provide telescope control, weather forecasts, an exhaustive star map, or guaranteed observing conditions.
