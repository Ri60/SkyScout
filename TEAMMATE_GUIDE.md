# SkyScout — Complete Teammate Guide (Beginner Edition)

**Start here if you have never worked on this project, GitHub, React, or astronomy code.** This guide explains the purpose, what we've already built, where everything lives, how to run it, how it works, how to test it, and how to safely help.

**GitHub:** https://github.com/Ri60/SkyScout

## 1. What is SkyScout? (30-second explanation)

Imagine someone wants to look at the night sky but does not know which objects are visible or where to look. SkyScout asks **where** they are and **when** they want to observe, then generates a **guided 30-minute stargazing mission**. It displays a few recommended objects, explains the direction and height to look, plots their positions on a simplified sky chart, and lets the observer check off what they saw.

It is designed for **beginners and naked-eye observations**. It is **not** a telescope-control system, a full astronomy simulator, or a weather app.

### A simple real example

A user enters **Toronto**, **November 3, 2026**, **9:00 PM**. In our manually tested version, SkyScout recommended **Vega** and **Saturn**. The results page showed their altitudes and azimuths, the sky chart plotted them, and the mission checklist remembered completed observations. Different cities and times give different results.

These historical output values are examples from testing, not a promise that every later version will recommend the same targets.

## 2. What the team has done so far

This was built in stages. You do **not** have to redo these stages; this is the project history so you understand why each piece exists.

| Stage | What we did | Why |
| --- | --- | --- |
| 1. Repository | Created `Ri60/SkyScout` and connected Git to the local folder | Keeps code versioned and shareable |
| 2. Website setup | Created a Vite + React + TypeScript app | Provides the web interface |
| 3. First page | Built location/date/time form and dark space-themed CSS | Lets a user plan a session |
| 4. Astronomy proof of concept | Used `astronomy-test.mjs` and Astronomy Engine to calculate Moon/planet positions | Verified the calculations could work |
| 5. Recommendation engine | Moved calculations into `src/astronomy.ts` | Website can reuse the logic |
| 6. Star catalogue | Added Sirius, Vega, Arcturus | Provides more naked-eye targets |
| 7. Mission | Added a 30-minute schedule, checkboxes, and descriptions | Turns raw data into a guided activity |
| 8. Chart | Added SVG sky chart | Helps explain where to look |
| 9. Saved progress | Added `localStorage` keyed to mission location/date/time | Keeps checklists separate |
| 10. City lookup | Added `src/location.ts` with Open-Meteo geocoding | Supports cities beyond Oshawa |
| 11. Time zones | Added Luxon-based `src/timezone.ts`, including DST checks | Makes local times meaningful for the chosen city |
| 12. Better suggestions | Added brightness ranking, intermediate-time checks, 16-point compass descriptions | Improves beginner usability |
| 13. Testing | Installed Vitest and wrote eight automated tests | Helps catch regressions |
| 14. GitHub | Pushed tested source to `main` (latest reported test commit `7474ac2`) | Teammates can retrieve the code |

**Verified in the latest reported local run:** 8/8 Vitest tests passed, Oxlint found 0 errors/warnings, the TypeScript/Vite build passed, and Git reported a clean `main` branch after the test commit. Always rerun these checks on your own machine.

## 3. What tools are we using? (plain English)

- **VS Code:** the editor where we change the files.
- **PowerShell:** where we type commands on Windows.
- **Git:** keeps a history of code changes; **GitHub** stores/shares the repository online.
- **Node.js + npm:** let us install JavaScript packages and run the app.
- **React:** builds the user interface with reusable components.
- **TypeScript:** JavaScript with extra checks to catch some errors sooner.
- **Vite:** runs the local development website and creates a production build.
- **Astronomy Engine:** calculates celestial positions. We did **not** write an orbital mechanics engine ourselves.
- **Open-Meteo geocoding:** converts a city name into latitude, longitude, and time zone; it is **not used for weather in the MVP**.
- **Luxon:** converts a city's entered local time into the moment used for calculations, and checks daylight-saving transitions.
- **SVG:** draws the simple sky chart.
- **localStorage:** stores each mission's checklist in the browser.
- **Oxlint / Vitest:** check for coding mistakes and run automated tests.

## 4. Start here: get the project on your computer

### Requirements

Install **Git**, **Node.js** (with npm), and **VS Code**. Node.js 24 was used in our original setup.

### If you have never downloaded SkyScout

Open **PowerShell** and run **one line at a time**:

```powershell
cd $HOME
git clone https://github.com/Ri60/SkyScout.git
cd SkyScout
npm ci
code .
npm run dev
```

After `npm run dev`, find a line like:

```text
Local: http://localhost:5173/
```

Open that address in a browser. The number might be `5174` if `5173` is already being used. **Use the exact address shown in your terminal.** Do not close the terminal running Vite.

### If you already have the project

```powershell
cd C:\Users\<your-Windows-username>\SkyScout
# Only pull when your own edits are safely committed or backed up:
git pull
npm ci
npm run dev
```

**Important:** `C:\Users\ridas\SkyScout` was the original developer's local path, **not** a path everyone should copy. Each teammate uses their own Windows username and folder.

## 5. How to operate the website

1. Enter a city such as `Toronto`.
2. Select a future or test date.
3. Choose the **local time in that city** (not necessarily the time on your own computer).
4. Press **Plan My Mission**.
5. Confirm the resolved city and time zone are correct.
6. Read the results, chart, 30-minute schedule, and target descriptions.
7. Tick the checklist as you observe each target.
8. Refresh and regenerate the **same** mission; your checkmarks should remain. A different city/date/time gets a different saved checklist.

**Try these manual tests:** Toronto on Nov 3, 2026 at 9 PM; Vancouver at the same *local* date and time; Toronto at noon (no nighttime mission); fake city `XyzFakeCity12345` (error); Toronto March 14, 2027 at 2:30 AM (nonexistent DST time, error); Toronto November 7, 2027 at 1:30 AM (ambiguous DST time, error).

## 6. How the code works — follow one click

When a user clicks **Plan My Mission**:

```text
App.tsx (reads form)
  → location.ts (city → latitude, longitude, time zone)
  → timezone.ts (local date/time → exact Date)
  → astronomy.ts (calculate objects and filter/rank them)
  → App.tsx (shows targets)
       ├→ SkyChart.tsx (plots positions)
       └→ Mission.tsx (directions, schedule, checklist, localStorage)
```

### `src/App.tsx` — the coordinator

Contains the form and React state (city, date, time, results, errors, loading). It calls the other functions when the user submits. It also builds the **mission ID** so checkboxes from one date/city do not appear in another mission.

### `src/location.ts` — turn a name into a place

Sends a request to Open-Meteo's **geocoding API**. It returns the chosen result's `latitude`, `longitude`, and `timezone`, which are necessary for sky calculations. **Limitation:** the current prototype chooses the *first* result rather than showing a list of matching cities.

### `src/timezone.ts` — what does 9 PM mean?

A user in Toronto who enters 9 PM means **9 PM Toronto local time**. A user in Vancouver means **9 PM Vancouver local time**, which is a different instant. Luxon translates the local time to a JavaScript `Date` that Astronomy Engine can use. The current helper also rejects local times skipped/repeated by daylight saving changes.

### `src/astronomy.ts` — the selection engine

Astronomy Engine calculates **altitude** and **azimuth** for the Sun, Moon, planets, and defined stars.

- **Altitude:** the object's angle above the horizon; 0° = horizon, 90° = straight overhead.
- **Azimuth:** its compass direction; 0° = north, 90° = east, 180° = south, 270° = west.
- **Apparent magnitude:** brightness rating; *lower number means brighter*, so −1 is brighter than +1.

The newer algorithm checks **0, 15, and 30 minutes**, asks for the Sun below **−18°**, each recommended target at **20° or higher**, and a brightness cutoff near **magnitude 1.5**, then sorts by magnitude and returns up to **three targets**. These are **first-version selection rules, not proven visibility guarantees**.

The `SkyTarget` type holds the information the page needs: name, altitude, azimuth, and optional magnitude and description. When editing this type, remember that both `Mission.tsx` and `SkyChart.tsx` depend on it.

### `src/SkyChart.tsx` — the map of the sky

Uses **SVG**, not an external map image. It converts azimuth and altitude into `x`/`y` positions in a circular chart. The circle edge represents the horizon; the center represents overhead. **The chart only plots recommended targets.**

### `src/Mission.tsx` — the actual guided experience

Displays the four fixed stages:

- **0–5 min:** Get ready and find a safe, darker observing spot.
- **5–10 min:** Determine direction and altitude.
- **10–25 min:** Observe recommended objects.
- **25–30 min:** Finish the checklist and review.

Shows a description, compass direction (16-point labels), and checkbox for each target. Progress updates immediately. Checked targets are stored under a key like `skyscout-mission-<missionId>` in the current browser. There is **no database or login system**.

### CSS files — styling only

`src/App.css` holds the space theme, input form, mission cards, schedule cards, and chart sizing. `src/index.css` contains global styles. Changing CSS should not require changing astronomical calculations.

## 7. How we test changes

Before saying a feature works, check it in **three different ways**:

**A. Automated tests:**

```powershell
npx vitest run
```

We created **four astronomy tests** (invalid latitude, invalid longitude, daytime filtering, basic nighttime target output) and **four time-zone tests** (Toronto, Vancouver, nonexistent spring time, repeated fall time). The latest reported run was **8 passed, 0 failed**.

**B. Lint + production build:**

```powershell
npm run lint
npm run build
```

Lint looks for coding mistakes; build checks TypeScript and bundles the site. **Passing these does not prove astronomy is numerically accurate or that every button works.**

**C. Browser test:**

```powershell
npm run dev
```

Try the actual user flow. Make sure the site displays correct city/time, results change when date/time changes, error messages are useful, and checklists are saved and separated.

## 8. How to contribute safely (Git/GitHub)

**Don't all edit `main` at the same time.** Make one small change on your own branch and submit it for review.

```powershell
# Update from main before beginning new work (only when your files are safe)
git switch main
git pull origin main

# Make a branch for your task
git switch -c feature/improve-city-selection

# Edit files in VS Code, then run tests
npx vitest run
npm run lint
npm run build

# Save your own changes
git add .
git commit -m "Improve city selection"
git push -u origin feature/improve-city-selection
```

Then open GitHub, select **Compare & pull request**, describe what changed and how you tested it, and ask another teammate to review. Merge only after reviewing. **Do not force-push or run `git reset --hard` unless you know exactly why.**

A good pull request explains: **problem**, **files changed**, **how tested**, and **any limitations**.

## 9. Beginner tasks teammates can take

| Task | Suggested ownership | Difficulty | Done when... |
| --- | --- | --- | --- |
| Fix README and add screenshots | Documentation teammate | Easy | A new contributor can follow setup instructions |
| Add helpful beginner explanations | UI/content teammate | Easy | Cards clearly explain what to look for and limitations |
| Improve matching city selection | Location teammate | Medium | Users can distinguish multiple cities with the same name |
| Expand and cite bright-star catalogue | Astronomy teammate | Medium | Positions are validated against references and tests added |
| Add tests for form/error/checklist behavior | Testing teammate | Medium | Automated coverage includes browser-facing state changes |
| Compare planet/star coordinates to a trusted reference | Validation teammate | Medium/hard | Record several dates/locations with acceptable error tolerance |
| Improve no-target recommendations | Product/UX teammate | Medium | User gets helpful suggestions without fake visibility claims |

Before taking a task, agree who owns which files so two teammates don't overwrite each other.

## 10. Common errors — and exactly what to do

**`localhost refused to connect`** → Vite isn't running, or you're using the wrong port. Run `npm run dev` and open its exact `Local:` URL. Keep the terminal open.

**`Port 5173 is in use`** → Not necessarily an error. Vite may switch to `5174`; use that URL.

**`npm` or `node` not recognized** → Install Node.js, then reopen PowerShell.

**`Cannot find module`** → Run `npm ci` in the project root. Check file paths. We once mistakenly placed a test at `src/src/timezone.test.ts` rather than `src/timezone.test.ts`.

**PowerShell says unexpected token `PS`** → You pasted the terminal prompt itself. Type only the command, e.g. `npm run lint`.

**`git status` shows modified files** → Normal after editing. Run tests, inspect changes, then commit. Don't assume uncommitted files are on GitHub.

**`LF will be replaced by CRLF`** → Usually a normal Windows line-ending warning.

**A city gives strange results** → Check which city the geocoder selected; ambiguous names are a known limitation.

**No targets returned** → Could be daytime, insufficient darkness, or no catalogue objects meeting the current thresholds; it is not always a software bug.

**A checkbox disappears after refresh** → Regenerate the *same* city/date/time. If using a different browser or clearing site data, localStorage won't be the same.

**An invalid DST time throws an error** → Intended behavior: ask for another time. In Toronto, March 14, 2027 at 2:30 AM does not exist; November 7, 2027 at 1:30 AM occurs twice.

## 11. What we have NOT finished

We have a working MVP, but **not a scientifically validated, production-ready visibility guide**. Still open:

1. Independent validation of numerous objects' exact altitude/azimuth readings and magnitude-based ranking.
2. Allowing users to choose the correct city when names are ambiguous.
3. Larger, sourced star catalogue and clearer visibility guidance.
4. Realistic viewing constraints: clouds, light pollution, skyline; currently outside MVP scope.
5. UI tests and better no-target explanations.
6. Cross-device accounts/storage; currently intentionally not included.
7. Optional deployment and more polished project documentation/screenshots.

## 12. What to tell our mentor

> “SkyScout is a beginner stargazing MVP. The user enters a city and local date/time, and the app calculates a small set of suitable sky objects, shows a directional chart, and creates a guided 30-minute checklist. We use Astronomy Engine for celestial positions, Open-Meteo for location coordinates, and Luxon for time zones. Our own work is the target-selection rules, interface, mission flow, sky chart, local tracking, and tests. The core demo works, and eight automated tests pass. We would like feedback on the MVP scope, selection criteria, and how best to independently validate the astronomy calculations.”

**Be accurate about what's implemented:** don't claim weather support, full-sky maps, telescope observations, or complete astronomical validation.

## 13. Five-minute teammate onboarding checklist

- [ ] I can open `https://github.com/Ri60/SkyScout`.
- [ ] I have cloned the repo and installed dependencies with `npm ci`.
- [ ] `npm run dev` opens the website at the port Vite shows.
- [ ] I understand what `App.tsx`, `location.ts`, `timezone.ts`, `astronomy.ts`, `SkyChart.tsx`, and `Mission.tsx` each do.
- [ ] `npx vitest run` runs the automated tests.
- [ ] `npm run lint` and `npm run build` pass.
- [ ] I know how to create a feature branch and ask for a pull-request review.
- [ ] I know the current limitations and won't misrepresent the prototype.

---

**Version note:** This guide combines the earlier uploaded project ZIP with the later development and successful commands reported in the conversation. The uploaded ZIP predates the newest astronomy/mission updates and Vitest files. The current GitHub `main` branch (latest reported commit: `7474ac2`) is the source of truth for teammates; verify by cloning and running the checks.
