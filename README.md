# ✨ SkyScout

**A beginner-friendly stargazing mission planner.** SkyScout turns a city, observation date, and local time into a short list of potential naked-eye sky targets, a directional sky chart, and a guided **30-minute observing mission**.



> **Status (November 2026):** The MVP, multiple-city selection, responsive improvements, and 15 automated tests are included in the merged `main` branch. This is a working educational prototype, not a fully validated production astronomy service.

## What SkyScout does

A user selects a location, date, and **local observing time**. SkyScout resolves the location to latitude, longitude, and a time zone; calculates approximate celestial positions; and recommends **up to three** candidates that satisfy its visibility rules. The app shows each target's altitude and azimuth, draws a simplified sky chart, and provides a checklist whose progress is saved in that browser.

### Features

| Feature | Details | Status |
| --- | --- | --- |
| City lookup | Open-Meteo Geocoding API resolves coordinates and an IANA time zone | `main` |
| Multiple matching cities | Choose a specific city (e.g., London, Ontario vs London, England) instead of accepting the first match | `main` |
| Local date/time conversion | Luxon handles the selected city's time zone and rejects ambiguous/nonexistent daylight-saving times | `main` |
| Celestial calculations | Astronomy Engine calculates apparent positions of a limited catalogue | `main` |
| Beginner-oriented recommendations | Up to three targets filtered by astronomical darkness, altitude, and magnitude | `main` |
| Directional sky chart | Responsive SVG showing selected targets relative to north/east/south/west | `main` |
| Guided mission | Four steps spanning 30 minutes, plus target descriptions and compass guidance | `main` |
| Saved checklist | Progress stored per mission in browser `localStorage` | `main` |
| Outdated-result protection | Edits to city/date/time clear old recommendations and stale lookup responses are ignored | `main` |
| Automated testing | 15 tests across four test files | `main` |

## Quick start

**Prerequisites:** Git, Node.js with npm (Node.js 24 used during initial development), and an internet connection for location search and package installation. VS Code is optional.

```powershell
git clone https://github.com/Ri60/SkyScout.git
cd SkyScout
npm ci
npm run dev
```

Open the `Local:` address printed by Vite (for example, `http://localhost:5173/`; it may use a different port). Keep the server terminal open.

## Use the application

1. Enter a city, click **Find Locations**, and choose the correct city from the dropdown (for example, London, Ontario rather than London, England).
2. Select an observation date and **time in that city's time zone**.
3. Click **Plan My Mission**.
4. Review the suggested targets, their altitude/azimuth, and the sky chart.
5. Follow the 30-minute plan and mark targets observed. Reopen the same mission in the same browser to view saved progress.

A daytime search or a time when no catalogued object meets the filters can correctly return **no suitable targets**.

## How recommendations work

```text
City input ──> Open-Meteo geocoding ──> latitude + longitude + time zone
                                           |
Date + local time ──> Luxon ──> observation instant
                                           |
                                Astronomy Engine
                                           |
                      Sun darkness and target positions
                                           |
                  Altitude + magnitude eligibility checks
                                           |
                      Up to 3 brightness-ranked targets
                       /                         \
                 SVG sky chart              Mission checklist
```

The implemented prototype samples the start, middle, and end of a **30-minute** window (minutes **0, 15, 30**). A candidate is eligible when the Sun remains **below −18°**, the target remains at least **20°** above the horizon, and its estimated apparent magnitude is **1.5 or brighter** (numerically ≤ 1.5). Eligible targets are sorted by magnitude; up to three are returned.

The catalogue is deliberately small: **Moon, Venus, Mars, Jupiter, Saturn, Sirius, Vega, and Arcturus**. The chart is a simplified directional projection of the recommended objects, **not** a full-sky atlas. Weather, light pollution, terrain, buildings, and other local observing conditions are not evaluated; visibility is **not guaranteed**.

## Tech stack

| Responsibility | Technology |
| --- | --- |
| Web interface | React, TypeScript, HTML/CSS |
| Development and production bundling | Vite |
| Astronomical calculations | `astronomy-engine` |
| City geocoding | Open-Meteo Geocoding API |
| IANA time zones and daylight saving | Luxon |
| Sky visualization | SVG |
| Browser-local checklist storage | `localStorage` |
| Unit and component tests | Vitest, React Testing Library, jest-dom, and jsdom |
| Code checks | Oxlint and TypeScript (`npm run build`) |
| Collaboration | Git and GitHub pull requests |

## Project structure

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Form, state management, request coordination, results |
| `src/location.ts` | City search and geocoding |
| `src/timezone.ts` | Convert location-local date/time into a JavaScript `Date` |
| `src/astronomy.ts` | Celestial positions, filters, ranking, target descriptions |
| `src/SkyChart.tsx` | Directional sky chart in SVG |
| `src/Mission.tsx` | Guided steps, 16-point compass directions, checklist, persistence |
| `src/App.css`, `src/index.css` | Styling, responsive layout, accessibility focus styles |
| `src/timezone.test.ts` | Four time-zone tests |
| `src/astronomy.test.ts` | Four basic astronomy tests |
| `src/astronomy.edge.test.ts` | Three boundary tests |
| `src/App.test.tsx` | Four React interface tests |
| `ASTRONOMY_VALIDATION.md` | Independent comparison against Stellarium Web |
| `MENTOR_DEMO.md` | Mentor demonstration walkthrough (updated for 15 tests) |
| `TEAMMATE_GUIDE.md` | Detailed onboarding, technical explanations, and workflow |

## Tests and quality checks

Run these commands **from the project root**:

```powershell
npx vitest run --environment jsdom
npm run lint
npm run build
```

The `--environment jsdom` option provides the browser-like test environment required by the React component tests. These commands were run locally; automated GitHub CI is not yet configured.

**Recorded local results, not a claim of CI verification:**

| Suite | Test count | What it covers |
| --- | ---: | --- |
| `timezone.test.ts` | 4 | Toronto and Vancouver time conversions; DST skipped/repeated times |
| `astronomy.test.ts` | 4 | Invalid latitude/longitude, daytime, reasonable nighttime target structure |
| `astronomy.edge.test.ts` | 3 | Invalid date, non-finite coordinates, maximum target count |
| `App.test.tsx` | 4 | Form rendering, multiple-city options, clearing previous results, missing location selection |
| **Total on merged `main` (last local verification)** | **15 passing** | Four test files |

**Recorded local verification:** After final-polish cleanup, all **15/15 tests** passed, Oxlint reported **0 errors and 0 warnings**, and `npm run build` completed successfully. These results were observed before merging Pull Request #2; rerun the commands after cloning or pulling newer commits. The interface tests mock location lookup and astronomy results, so they do not independently verify a live API or all celestial positions.

## Independent astronomy comparison

An initial manual comparison was performed with [Stellarium Web](https://stellarium-web.org/) for **Oshawa, Ontario, November 3, 2026 at 9:00 PM EST**.

| Object | Coordinate | SkyScout | Stellarium | Difference |
| --- | --- | ---: | ---: | ---: |
| Vega | Altitude | 35.4° | 35.51° | 0.11° |
| Vega | Azimuth | 292.5° | 292.45° | 0.05° |
| Saturn | Altitude | 45.2° | 45.18° | 0.02° |
| Saturn | Azimuth | 158.6° | 158.50° | 0.10° |

These are **two objects at one place and one time**; they support initial agreement, not complete validation. See [ASTRONOMY_VALIDATION.md](ASTRONOMY_VALIDATION.md).

## Known limitations and next steps

- City selection displays up to ten matching locations; some matching places may still be absent from the first page of API results.
- The catalogue has only eight possible objects; there is no all-sky search.
- Geocoding depends on network access and the external Open-Meteo service.
- The 30-minute plan is guidance, not a running timer.
- Checklist data is specific to the browser/device; no accounts or cloud sync.
- Weather, light pollution, horizon obstacles, and actual seeing conditions are not modelled.
- More independent numerical validation is needed across objects, locations, and dates.
- Component tests mock underlying calculations; network and persistent-storage behavior still need deeper automated coverage.
- Real-phone and cross-browser accessibility testing remains desirable.

## Collaboration

Contributors should make changes on feature branches and use pull requests rather than pushing unfinished work straight to `main`.

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/descriptive-name
# Edit files and run the checks
npx vitest run --environment jsdom
npm run lint
npm run build
git add .
git commit -m "Explain the change"
git push -u origin feature/descriptive-name
```

Then open a pull request, describe the changes and test output, and obtain any review required by the team. Never commit `node_modules/`, `dist/`, credentials, or secrets. See the [team development guide](TEAMMATE_GUIDE.md).

## Documentation

- [Team development guide](TEAMMATE_GUIDE.md) — beginner-friendly explanation of files, the development process, tests, and GitHub collaboration.
- [Astronomy validation](ASTRONOMY_VALIDATION.md) — recorded comparison against Stellarium.
- [Mentor demonstration](MENTOR_DEMO.md) — sample live walkthrough and reported validation.

SkyScout is a prototype for educational and recreational use; it does not guarantee the visibility or safety of a particular observing session.
## Location map and horizon sky preview (November 2026)

The mission page now includes an OpenStreetMap embed centered on the selected
city's geocoded coordinates, plus a larger-map link. The marker is the city
reference position, not GPS or a verified observing site. The map requires
internet access and does not identify dark-sky sites or model light pollution.

The new NightSky component renders a perspective horizon simulation for the
selected city's coordinates and local observation time. Use direction buttons,
horizontal dragging, elevation and field-of-view sliders, constellation/label
toggles, and the target buttons to explore. A 0–30 minute slider previews the
mission interval without changing the mission checklist's original time.

Star and constellation data are bundled locally from D3-Celestial:
https://github.com/ofrohn/d3-celestial (stars.6.json, 5,044 stars;
constellations.lines.json). Catalogue coordinates are J2000; Astronomy Engine
converts them to the observer's horizontal coordinates, including precession
and normal atmospheric refraction. Star8 is used as a scratch slot so the
recommendation catalogue's Star1–3 remain independent. The downloaded data's
BSD-3-Clause notice is retained in CELESTIAL-LICENSE.txt.

The preview includes above-horizon solar-system objects, brightness-scaled
stars and approximate colour indices. Object sizes are enlarged for clarity.
The flat horizon is illustrative. Weather, terrain, buildings, light pollution,
phone orientation and camera/AR are not modeled. The Moon's illuminated
fraction is displayed numerically; its disk is an identification symbol.

New files: src/LocationMap.tsx, src/NightSky.tsx, src/skyView.ts,
src/skyView.test.ts, src/data/*.json, CELESTIAL-LICENSE.txt.
Updated: src/App.tsx, src/App.css, tsconfig.app.json, README.md.

Run `npm run build` and `npx vitest run --environment jsdom` to validate.
