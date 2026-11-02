# SkyScout — Team Development Guide

This document provides a shared technical and onboarding reference for **all project contributors**. It describes the application, architecture, development environment, tests, collaboration process, and known limitations.

**Repository:** https://github.com/Ri60/SkyScout  
**Project stage:** Working MVP prototype

## 1. Project overview

SkyScout helps beginner stargazers plan a short observing session. The application accepts a city, date, and local time, then calculates a small group of potential naked-eye targets. It presents direction and altitude information, a simplified sky chart, and a guided 30-minute observation checklist.

The MVP focuses on **making existing astronomical calculations useful to beginners**. It is not a telescope controller, full-sky simulator, or live weather forecasting system.

### User journey

1. A user enters a city, observation date, and local time.
2. SkyScout resolves the city into coordinates and a time zone.
3. The local time is converted into a precise observation instant.
4. Celestial objects are evaluated for darkness, altitude, and apparent brightness.
5. Eligible targets are ranked and shown in the results and sky chart.
6. The user follows a four-stage observation mission and checks off targets.

The saved checklist is specific to the selected mission and the current browser.

## 2. Implemented components

| Component | Function | Main file |
| --- | --- | --- |
| React interface | Collects inputs, renders results, manages loading and errors | `src/App.tsx` |
| City lookup | Retrieves latitude, longitude, and IANA time zone | `src/location.ts` |
| Time conversion | Interprets local date/time, checks daylight-saving transitions | `src/timezone.ts` |
| Astronomy engine integration | Calculates object position and filters targets | `src/astronomy.ts` |
| Sky chart | Draws recommended targets on a directional SVG diagram | `src/SkyChart.tsx` |
| Guided mission | Presents schedule, directions, checklist, and stored progress | `src/Mission.tsx` |
| Appearance | Defines layout and visual styling | `src/App.css`, `src/index.css` |
| Automated tests | Covers basic astronomy and time-zone behavior | `src/*.test.ts` |

Other project files include `package.json` (dependencies/scripts), `package-lock.json` (locked dependency versions), `vite.config.ts` (build configuration), and `tsconfig*.json` (TypeScript configuration).

## 3. Tools and terminology

| Tool | Purpose |
| --- | --- |
| Git / GitHub | Source history, collaboration, review |
| Node.js / npm | JavaScript runtime and dependency management |
| VS Code | Optional code editor |
| React | Builds interactive interface components |
| TypeScript | Adds compile-time type checks |
| Vite | Runs the development server and produces builds |
| Astronomy Engine | Calculates celestial coordinates |
| Luxon | Handles local date/time and time zones |
| Open-Meteo Geocoding | Looks up cities, coordinates, and time zones |
| SVG | Draws the sky chart |
| `localStorage` | Saves mission progress in a browser |
| Vitest | Runs automated tests |
| Oxlint | Checks code for common issues |

**Altitude** is the angular height above the horizon: 0° is the horizon and 90° is overhead. **Azimuth** is compass direction measured clockwise from north: 0° north, 90° east, 180° south, 270° west. **Apparent magnitude** expresses observed brightness; smaller values are brighter.

## 4. Install and run locally

### Requirements

Install Git and Node.js (with npm). A current compatible Node.js release is recommended; Node.js 24 was used during initial development.

### First-time setup

Open PowerShell or a terminal in the desired parent directory:

```powershell
git clone https://github.com/Ri60/SkyScout.git
cd SkyScout
npm ci
npm run dev
```

Vite prints a `Local:` URL, often `http://localhost:5173/`. Open the exact URL shown. Leave the development-server terminal running.

To edit the project in VS Code, run `code .` from the project root, or open that folder through VS Code's File menu.

### Updating an existing clone

Safely commit or save uncommitted work before pulling updates:

```powershell
git switch main
git pull origin main
npm ci
```

If there are uncommitted changes or merge conflicts, resolve those before pulling. Do not discard local work without review.

### Starting and stopping the website

- Start: `npm run dev` from the SkyScout folder.
- Stop: press `Ctrl + C` in the terminal running Vite.
- The address and port may change if a port is already in use.

## 5. Code flow

```text
UI input (App.tsx)
  |
  +--> location.ts --> coordinates + time zone
  |
  +--> timezone.ts --> JavaScript Date at selected city's local time
  |
  +--> astronomy.ts --> ranked SkyTarget results
  |
  +--> SkyChart.tsx --> directional plot
  |
  +--> Mission.tsx --> observation guidance + saved checklist
```

### `src/App.tsx`

Acts as the coordinator. Holds form and result state, runs asynchronous city lookup, handles errors, and starts calculations. It also produces a mission identifier based on the resolved location and selected observation date/time.

### `src/location.ts`

Uses Open-Meteo's geocoding API to resolve a city name. The prototype selects the first matching result. This can be inaccurate for ambiguous city names, so the displayed resolved location should be checked.

### `src/timezone.ts`

Interprets date and time values in the resolved city's time zone, not the computer's own time zone. Some daylight-saving changes skip local times or repeat them; the current implementation rejects both cases rather than guessing an offset.

### `src/astronomy.ts`

Uses Astronomy Engine for celestial coordinates. The current object set includes the Moon, Venus, Mars, Jupiter, Saturn, Sirius, Vega, and Arcturus. It samples positions at 0, 15, and 30 minutes in the observing window and applies prototype cutoffs:

- Sun below −18° (astronomical darkness).
- Object altitude at least 20°.
- Apparent magnitude at most 1.5.
- Return up to three eligible targets, sorted by brightness.

These checks estimate suitability; they do **not** account for clouds, skyglow, buildings, or independent numerical position verification.

### `src/SkyChart.tsx`

Converts the target altitude and azimuth values into positions on a circular SVG chart. The chart is a simplified reference for recommended objects only, not a full star atlas.

### `src/Mission.tsx`

Builds the fixed 30-minute experience:

| Time | Mission stage |
| --- | --- |
| 0–5 minutes | Prepare the observing location and equipment |
| 5–10 minutes | Orient using compass direction and altitude |
| 10–25 minutes | Observe suggested targets |
| 25–30 minutes | Review and complete the checklist |

Checkmarks are stored in browser `localStorage` under a mission-specific key. They remain on refresh in the same browser, but are not shared across devices or user accounts.

## 6. Quality checks

Run all checks from the repository root before proposing a change:

```powershell
npx vitest run
npm run lint
npm run build
```

The test suite currently contains four basic astronomy tests and four time-zone tests. In the reported local development run, all eight tests passed, linting completed without findings, and the production build succeeded. Results should be rechecked on each contributor's current checkout.

Passing tests and a successful build do not establish independent astronomical accuracy. Changes to calculations should be compared against trusted reference output for multiple locations and times.

### Suggested manual test cases

| Case | Expected behavior |
| --- | --- |
| Valid city and dark nighttime | A mission is generated when eligible targets exist |
| Daytime | No nighttime targets are recommended |
| Invalid city query | A useful lookup error is displayed |
| Same mission after refreshing | Completed checklist items remain checked |
| Different location or observation time | Uses a separate mission checklist |
| Toronto, 2027-03-14, 02:30 | Nonexistent local time is rejected |
| Toronto, 2027-11-07, 01:30 | Ambiguous local time is rejected |

Actual recommendations vary with the date, location, and current implementation.

## 7. GitHub collaboration

Contributors require a GitHub account and appropriate repository access. For repository maintainers, access is generally managed from **Settings → Collaborators**. A person's GitHub username is sufficient for an invitation; a legal name is not needed in the public documentation.

### Feature branch workflow

```powershell
git switch main
git pull origin main
git switch -c feature/descriptive-task-name

# Edit and validate changes
npx vitest run
npm run lint
npm run build

git add .
git commit -m "Describe the change"
git push -u origin feature/descriptive-task-name
```

Open a GitHub pull request from the branch into `main`. Include the purpose, modified components, verification performed, and any remaining issues. Have the change reviewed before merging where practical.

**Good collaboration practices:** Keep changes focused, agree on task ownership, avoid committing `node_modules/` or `dist/`, and never discard another contributor's work with destructive Git commands.

### Git author identity

GitHub contribution attribution depends on commit metadata and linked GitHub account email settings. Repository access and public documentation do not require listing contributors' surnames or personal Windows directory paths.

## 8. Suggested development work

| Area | Example task | Completion criterion |
| --- | --- | --- |
| Location handling | Provide a choice among matching city results | Ambiguous city names can be resolved correctly |
| Astronomy validation | Compare output with independent references | Multiple test cases documented with tolerances |
| Test coverage | Add tests for forms, lookup errors, and saved progress | New behavior covered by repeatable tests |
| Usability | Improve empty-result messages | Clear next steps appear when nothing qualifies |
| Accessibility | Improve keyboard and screen-reader behavior | Key flows usable without a mouse |
| Documentation | Add screenshots and reproducible examples | New contributors can onboard successfully |

Task ownership and delivery milestones should be coordinated using the team's preferred project-management channel or GitHub issues.

## 9. Troubleshooting

| Problem | Likely fix |
| --- | --- |
| `npm` is not recognized | Install Node.js, reopen the terminal, check `node --version` |
| `Cannot find module` | Run `npm ci` in the project root |
| Localhost cannot connect | Start `npm run dev`; use the exact Vite `Local:` URL |
| Port 5173 is already in use | Use the alternative port reported by Vite |
| PowerShell says a folder path is not a command | Use `cd path-to-folder` to navigate |
| `LF will be replaced by CRLF` | Usually an informational Windows line-ending warning |
| `git pull` reports local changes | Review and commit/stash the changes before updating |
| No targets appear | Confirm nighttime, correct city, and applicable selection thresholds |
| Saved checks disappear | Confirm the same browser and mission inputs; avoid clearing site data |
| Unexpected city | Geocoder may have returned a different city with the same name |

## 10. Current scope and limitations

SkyScout is a functional MVP prototype, not a fully validated production astronomy product. The current application lacks a comprehensive sky catalogue, weather and light-pollution modelling, full-sky rendering, synchronized accounts, and extensive browser-level test coverage. City disambiguation and independent numerical position validation are priorities for future releases.

## 11. Contribution readiness checklist

- [ ] The repository can be cloned and dependencies install successfully.
- [ ] The development server starts and the site loads.
- [ ] The primary source files and their responsibilities are understood.
- [ ] Automated tests, lint, and build commands can be run.
- [ ] A feature branch can be created and pushed.
- [ ] A pull request can be prepared with testing details.
- [ ] Current MVP limitations are understood and represented accurately.

---

**Documentation maintenance:** Update this guide alongside code changes that affect installation, application behavior, testing, or the contribution workflow. The repository's current `main` branch is the authoritative source for implemented features.
