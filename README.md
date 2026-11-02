# ✨ SkyScout

**A beginner-friendly stargazing mission planner.** SkyScout turns a chosen city, date, and time into a short, guided **30-minute naked-eye observing mission**. It recommends a small number of promising celestial targets, shows their approximate positions on a directional sky chart, explains how to find them, and lets users check off what they observe.

**Repository:** https://github.com/Ri60/SkyScout

## Project status

**Working MVP prototype — still being validated.** The team has demonstrated city lookup, time-zone-aware calculations, nighttime target filtering, a simple sky chart, a 30-minute observation schedule, and locally saved mission checklists. The latest development session reported **8/8 passing Vitest tests**, a successful TypeScript/Vite production build, and zero Oxlint warnings/errors. These results were reported from the local working copy; check the latest clone yourself using the commands below.

## Features implemented

- **City-based observing:** Enter a city to retrieve latitude, longitude, and time zone using Open-Meteo geocoding.
- **Local observation time:** Convert the chosen date/time using Luxon and the chosen city's time zone, including rejecting nonexistent and repeated daylight-saving transition times.
- **Astronomy calculations:** Use Astronomy Engine to calculate Sun, Moon, planet, and selected bright-star positions.
- **Beginner target selection:** Check astronomical darkness and minimum altitude during a 30-minute window, filter by apparent magnitude, then rank eligible targets by brightness. Current prototype considers the Moon, Venus, Mars, Jupiter, Saturn, Sirius, Vega, and Arcturus, and limits recommendations to three objects.
- **Directional sky chart:** A simple top-down plot of recommended targets by azimuth and altitude, **not** a full-sky star atlas.
- **Guided mission:** Four time blocks covering setup, orientation, observation, and review.
- **Observation checklist:** Tick targets as observed, see progress, and retain each mission's progress in browser `localStorage` using a location/date/time-specific identifier.
- **Automated checks:** Vitest tests for basic astronomy behavior and time-zone handling.

## Quick start (Windows PowerShell)

### Prerequisites

- Node.js and npm installed (Node.js 24 was used during the project setup)
- Git and a code editor such as VS Code
- Internet connection for the initial package installation and city lookup

```powershell
# Clone once (skip if the SkyScout folder already exists)
git clone https://github.com/Ri60/SkyScout.git
cd SkyScout

# Install the dependencies listed in the lockfile
npm ci

# Start the local development server
npm run dev
```

Open the **exact `Local:` URL** shown by Vite, often `http://localhost:5173/`. If that port is occupied, Vite may choose `5174` or another port. Leave that PowerShell window open while using the site.

If you already cloned the repository, open its folder, run `git pull` to retrieve updates (only if your local work is safely committed), then `npm ci` and `npm run dev`.

## How to use SkyScout

1. Enter a city, such as `Toronto` or `Vancouver`.
2. Choose an **observation date and local time in that city**.
3. Click **Plan My Mission**.
4. Review the proposed targets and the directional sky chart.
5. Follow the 0–5, 5–10, 10–25, and 25–30 minute mission stages.
6. Check each target as you observe it; the progress counter updates and is saved for that specific mission in the same browser.

An empty result is not necessarily a bug: daytime, insufficient astronomical darkness, or no objects meeting the current filters may produce no recommendations.

## Commands

```powershell
npm run dev                         # start development server
npm run lint                        # Oxlint checks
npm run build                       # TypeScript + production Vite build
npx vitest run                      # run all automated tests once
npx vitest run src/astronomy.test.ts # astronomy tests
npx vitest run src/timezone.test.ts  # time-zone tests
npm run preview                     # preview a completed production build
```

The Vitest commands work when Vitest is installed as a development dependency in your current checkout (`npm ci`). The latest session reported four astronomy tests and four time-zone tests passing.

## Main source files

| File | Responsibility |
| --- | --- |
| `src/App.tsx` | Form input, city lookup, mission generation, error/loading display, renders results, chart, and mission |
| `src/location.ts` | Open-Meteo city-name lookup; returns coordinates and time zone |
| `src/timezone.ts` | Converts an entered local time to a JavaScript `Date`; rejects daylight-saving gaps and repeated times |
| `src/astronomy.ts` | Astronomy Engine calculations, target filtering, ranking, and descriptions |
| `src/SkyChart.tsx` | SVG directional sky chart of recommended targets |
| `src/Mission.tsx` | Observation schedule, 16-point compass labels, checkboxes, saved mission progress |
| `src/App.css`, `src/index.css` | Styling |
| `src/astronomy.test.ts` | Astronomy validation and representative daytime/nighttime tests |
| `src/timezone.test.ts` | Time-zone and daylight-saving tests |
| `astronomy-test.mjs` | Earlier standalone astronomy experiment; not the main website implementation |

## How the app works

```text
City + local date/time
   │
   ├─ location.ts → coordinates + IANA time zone
   ├─ timezone.ts → exact observation instant (Date)
   └─ astronomy.ts → positions + darkness/altitude/brightness rules
                          │
                          ▼
                 ranked recommended targets
                   ├─ App.tsx → results
                   ├─ SkyChart.tsx → directional chart
                   └─ Mission.tsx → 30-minute plan + local checklist
```

**Altitude** describes height above the horizon (0° = horizon, 90° = overhead). **Azimuth** describes compass bearing from north, clockwise (90° = east, 180° = south, 270° = west). **Apparent magnitude** is an astronomical brightness scale in which **smaller values mean brighter objects**.

### Prototype recommendation rules

The current updated implementation uses the following initial thresholds (subject to further validation):

- Sun below **−18°** at 0, 15, and 30 minutes (astronomical darkness).
- Recommended object at least **20° above the horizon** at each sampled time.
- Apparent magnitude no greater than **1.5**.
- Rank by lower/brighter magnitude and return at most **3** targets.

The star catalogue is intentionally small. Astronomical suitability **does not guarantee actual visibility**: clouds, trees, buildings, light pollution, atmospheric conditions, and the observer's experience matter.

## Current limitations

- **City ambiguity:** Geocoding currently takes the first result. A city name may match a location the user did not intend; verify the displayed city before trusting results.
- **Incomplete target catalogue:** Only a few stars and major solar-system objects are considered.
- **Selection model:** Brightness and altitude are proxies, not a complete visibility model. Independent numerical reference validation remains incomplete.
- **Weather/obstructions:** No cloud forecast, local skyline, or light-pollution integration.
- **Chart:** Shows only recommended objects; it is not a photograph, 3D simulation, or comprehensive star map.
- **Mission timing:** Time blocks are fixed instructions, not a live timed scheduler.
- **Storage:** `localStorage` lives in one browser/device; there are no accounts or cross-device synchronization. It may be lost if browser data is cleared.
- **Time-zone transitions:** Ambiguous and nonexistent local times are rejected, rather than offering a choice between repeated-hour offsets.
- **Automated tests:** Existing tests cover a limited set of expected behaviors; they are not full UI or independent astronomical-reference tests.

## Testing and contributing

Before committing a change:

```powershell
npx vitest run
npm run lint
npm run build
git status
```

Use a feature branch for team changes, explain what changed in your commit, and open a pull request for review before merging into `main`. Avoid editing `node_modules/` or committing generated `dist/` files. See **TEAMMATE_GUIDE.md** for a beginner-friendly walkthrough and troubleshooting help.

## Planned next work

1. Validate multiple star and planet positions against an independent reference at several cities, times, and date boundaries.
2. Improve ambiguous city resolution (show the user matching places).
3. Expand the sourced bright-star catalogue and make selection more understandable to beginners.
4. Add automated tests for persistence, UI state changes, and geocoding errors.
5. Improve accessibility, responsive design, and useful guidance when no suitable targets are found.

## Team and mentor notes

SkyScout is a learning/team project. An astronomy library performs the underlying celestial mechanics; the team is responsible for the recommendation logic, mission flow, interface, chart integration, observation tracking, testing, and documentation. The MVP intentionally excludes telescope controls, elaborate 3D graphics, a large deep-sky catalogue, social features, and weather integration.
