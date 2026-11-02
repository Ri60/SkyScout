# SkyScout — Complete Team Guide

**A start-to-finish guide for anyone joining SkyScout, including people who have never used React, TypeScript, GitHub, or astronomy software.**

**Repository:** https://github.com/Ri60/SkyScout  

**Project:** Beginner-friendly night-sky mission planner  

**Project stage:** Working MVP; final-polish changes merged into `main` (Pull Request #2)

> **Version note (November 2026):** The `main` branch includes the working MVP, reliability/mobile improvements (Pull Request #1), and the multiple-city picker plus four React UI tests (Pull Request #2). The latest reported local run passed all 15 tests.

## 1. The project in plain English

Imagine someone wants to look at the night sky but doesn't know what to look for or where to start. SkyScout helps that person by:

1. Asking **where** they are and **when** they want to observe.

2. Estimating which bright objects are in a useful part of the sky.

3. Showing **up to three** recommendations instead of overwhelming the user.

4. Showing where to look using compass directions and a simple sky chart.

5. Giving them a **30-minute mission** and checkboxes to track what they observed.

**SkyScout is not** a telescope controller, a full planetarium, a weather forecast, or a guarantee that the sky will be clear. It is an **educational MVP** for beginner naked-eye stargazing.

## 2. What the team has built

\| Feature | What a user sees | Why it exists |

\| --- | --- | --- |

\| Location input | A field for a city name | Different places see different skies |

\| Location search | A resolved city and time zone | Astronomy needs latitude, longitude, and exact time |

\| City picker (`main`) | **Find Locations** button and matching cities dropdown | Avoid choosing the wrong London, Springfield, etc. |

\| Date/time inputs | Date and local time for the observing city | Sky positions change continuously |

\| Target recommendations | Up to three named objects and numerical positions | Keeps first-time stargazing manageable |

\| Sky chart | Circles and labels marked N, E, S, W | Makes celestial coordinates easier to interpret |

\| Mission guide | 0–5, 5–10, 10–25, 25–30 minute steps | Adds structure to an observing session |

\| Checklist | “I observed ...” checkboxes and progress count | Lets a user record completion |

\| Saved progress | Checked items persist in the same browser for the same mission | Supports continuing an interrupted session |

\| Error handling | Error messages or an empty-results explanation | Handles wrong cities, invalid times, or unsuitable viewing conditions |

The **implemented object catalogue** is Moon, Venus, Mars, Jupiter, Saturn, Sirius, Vega, and Arcturus. Not every object appears every night.

## 3. Set up SkyScout on a new computer

### Step A — Install required software

Install **Git** and **Node.js with npm**. Node.js 24 was used during initial project development. **VS Code** is recommended but not required. An internet connection is needed for the initial npm installation and for city lookup.

### Step B — Download the project

Open Windows PowerShell (or another terminal), navigate to the folder where you want the project, and run:

```powershell

git clone https://github.com/Ri60/SkyScout.git

cd SkyScout

npm ci

```

`git clone` downloads the code. `cd SkyScout` enters the project folder. `npm ci` installs the packages defined by the lockfile. **Do not** download or commit `node_modules` manually.

### Step C — Run the website

```powershell

npm run dev

```

Open the **exact** `Local:` address printed in the terminal, often `http://localhost:5173/`. If 5173 is in use, Vite may print 5174 or another port. The app is running locally on **your own computer**, not yet as a public hosted website. Press `Ctrl + C` in that terminal to stop it.

### Step D — Get the latest changes later

Before updating, save or commit any unfinished local edits. Then:

```powershell

git switch main

git pull --ff-only origin main

npm ci

```

If Git reports uncommitted changes, stop and review them; **do not use `git reset --hard` or force-push** just to make the error go away.

## 4. How to use the application

### On the current `main` branch

1. Type a city, such as **London**.

2. Click **Find Locations**.

3. Open **Choose Your City**, then select the correct place, for example **London, Ontario, Canada** instead of **London, England, United Kingdom**.

4. Choose the observation date and local time for that place.

5. Click **Plan My Mission**.

6. Look at the target list, sky chart, and mission steps. Tick objects after observing them.


### A repeatable demo scenario

Use **Oshawa, November 3, 2026, 9:00 PM local time**. An earlier tested version returned **Vega and Saturn**. If the final implementation or catalogue changes, treat the actual app's output as authoritative, not a hardcoded expected list for every version.

## 5. Astronomy terms explained without jargon

\- **Latitude / longitude:** Coordinates telling the application exactly where the observer is on Earth.

\- **Time zone:** Local clock rules for that city, such as `America/Toronto`.

\- **Daylight saving time (DST):** Some clock times are skipped or repeated when clocks change. SkyScout rejects those confusing cases rather than silently guessing.

\- **Altitude:** How high an object is above the horizon. **0°** means at the horizon; **90°** means straight overhead.

\- **Azimuth:** Compass direction measured clockwise from north: **0° N, 90° E, 180° S, 270° W**.

\- **Apparent magnitude:** A brightness measure. **Lower numbers are brighter**; negative magnitudes are especially bright.

\- **Astronomical darkness:** The Sun is more than about **18° below the horizon**; SkyScout uses this as a conservative prototype selection rule.

\- **Naked-eye target:** Something that may be visible without a telescope under suitable conditions.

**Example:** Vega at an azimuth near 292.5° points roughly **west-northwest**. An altitude near 35.4° means it is noticeably above the horizon rather than straight overhead.

## 6. What happens after clicking “Plan My Mission”

```text

User enters city/date/time

         |

         v

App.tsx controls the form and request state

         |

         v

location.ts -> Open-Meteo returns matching places,

               coordinates, and IANA time zone

         |

         v

timezone.ts -> Luxon converts local date/time

               into the correct instant

         |

         v

astronomy.ts -> Astronomy Engine calculates Sun,

                Moon, planets, and bright-star positions

         |

         v

Filters -> darkness, minimum altitude,

           apparent brightness, rank, maximum of 3

         |

         +----> SkyChart.tsx -> SVG positions

         |

         +----> Mission.tsx -> instructions + checklist

                                    |

                                    v

                               localStorage

```

### Why city and time both matter

The Earth rotates and the objects themselves move. The same star can be at a different altitude at 9 PM versus midnight, or from Toronto versus Vancouver. That is why the app must combine **coordinates** with the **correct instant** before calculating the sky.

## 7. How the recommendation algorithm works

The core rules are in **`src/astronomy.ts`**:

1. Validate the observation date, latitude and longitude.

2. Build three sample times: **0, 15 and 30 minutes** after the selected start.

3. Compute the Sun's altitude. Require it to be **below −18° at all three times**.

4. Compute candidate object altitudes and azimuths; require altitude of at least **20° at all three times**.

5. Require apparent magnitude **≤ 1.5**. Brighter objects generally have a smaller number.

6. Sort suitable objects by apparent brightness; return **up to three**.

These rules are a **design choice for the MVP**, not a physical guarantee. Cloud cover, light pollution, buildings, trees, terrain, and the observer's actual conditions are not evaluated. Star coordinates are provided as a small static catalogue; positions for Solar System objects come from Astronomy Engine.

## 8. What every important file does

\| File | Plain-English responsibility |

\| --- | --- |

\| `src/main.tsx` | Starts React and mounts the app into the page |

\| `src/App.tsx` | Main interface: inputs, state, lookup, recommendations, errors |

\| `src/location.ts` | Calls Open-Meteo and turns city results into coordinates/time zones |

\| `src/timezone.ts` | Interprets the selected time in the city's time zone; rejects DST edge cases |

\| `src/astronomy.ts` | Calculates positions and applies the recommendation rules |

\| `src/SkyChart.tsx` | Draws targets inside a compass-oriented SVG circle |

\| `src/Mission.tsx` | Displays 30-minute steps, compass descriptions, and checkboxes |

\| `src/App.css` | SkyScout appearance and mobile responsive rules |

\| `src/index.css` | Basic global styling |

\| `src/timezone.test.ts` | Tests time conversion and DST edge cases |

\| `src/astronomy.test.ts` | Tests basic astronomy filtering and input validation |

\| `src/astronomy.edge.test.ts` | Tests extra invalid inputs and recommendation count |

\| `src/App.test.tsx` | Tests React form and location interactions on `main` |

\| `package.json` | npm scripts and dependency list |

\| `package-lock.json` | Exact resolved package versions for reproducible installs |

\| `vite.config.ts` | Vite tooling configuration |

\| `README.md` | Main public project description and quick setup |

\| `ASTRONOMY_VALIDATION.md` | Initial Stellarium comparison results |

\| `MENTOR_DEMO.md` | Prepared presentation walk-through; verify it matches the current MVP |

## 9. Testing — what was actually tested

### How to run the tests

From the **project root** (the folder containing `package.json`):

```powershell

npx vitest run --environment jsdom

npm run lint

npm run build

```

The jsdom environment simulates browser APIs needed for the UI tests; it is **not** a real browser. Running the commands after each feature helps catch breakages early.

### The four testing groups

\| Test file | Number | Exact checks recorded |

\| --- | ---: | --- |

\| `timezone.test.ts` | **4** | Toronto local-time conversion; Vancouver local-time conversion; reject Toronto spring-forward nonexistent local time; reject Toronto fall-back ambiguous local time |

\| `astronomy.test.ts` | **4** | Reject latitude outside range; reject longitude outside range; return no nighttime recommendations at a daytime instant; return structured nighttime results with valid altitude/azimuth and max count |

\| `astronomy.edge.test.ts` | **3** | Reject invalid Date; reject `Infinity`/`NaN` coordinates; return at most three results |

\| `App.test.tsx` | **4** | Form labels/buttons render; matching city choices appear; editing location removes previous results; a mission can't be planned without selected city |

\| **Total** | **15** | Last shared local Vitest run: **15 passed, 0 failed** |

The React UI tests use **mocks**: they provide fixed city-search results, a fixed date conversion, and a fixed Vega recommendation so the interface can be tested independently of real network and astronomy computations. The tests **do not** prove that a live API will always respond or that all sky positions are correct.

### Additional checks already observed

\- A previous `npm run lint` reported **0 warnings and 0 errors**.

\- A later `npm run build` succeeded after the multi-city feature was implemented.

\- A 390 × 844 mobile-device simulation showed the form and chart fitting the screen in the inspected sections.

\- Manually changing the city cleared old results immediately.

\- A checklist persisted after reloading the same mission during manual testing.

**Latest local verification before Pull Request #2 was merged:** 15/15 tests passed, lint reported no errors or warnings, and the production build succeeded. Teammates should rerun all three commands after pulling the current `main` branch.

### Test cases still worth adding

\- Browser-storage tests for persistence, corrupted storage, and unavailable `localStorage`.

\- Mocked network errors and empty city search responses.

\- A race test where an old lookup finishes after a newer query.

\- Selecting the correct similarly named city and checking its time zone end-to-end.

\- Accessibility checks for keyboard-only interactions and screen readers.

\- Real browser/device and cross-browser checks.

## 10. Independent astronomy validation

SkyScout was manually compared with **[Stellarium Web](**&#x68;ttps://stellarium-web.org/**)** using the **same city and local observation time**: **Oshawa, Canada — November 3, 2026 — 9 PM EST**.

\| Object | Value | SkyScout | Stellarium | Difference |

\| --- | --- | ---: | ---: | ---: |

\| Vega | Altitude | 35.4° | 35.51° | 0.11° |

\| Vega | Azimuth | 292.5° | 292.45° | 0.05° |

\| Saturn | Altitude | 45.2° | 45.18° | 0.02° |

\| Saturn | Azimuth | 158.6° | 158.50° | 0.10° |

Both objects agreed within **0.2°** for that one observing scenario. This is **promising initial evidence**, not proof of accuracy for every object, date, and location. More independent comparisons are needed, including the Moon, other planets, and different seasons. The recorded data is in [ASTRONOMY_VALIDATION.md](ASTRONOMY_VALIDATION.md).

## 11. Working together through GitHub

**Recommended workflow: one branch per feature, one pull request per completed change.**

```powershell

git switch main

git pull --ff-only origin main

git switch -c feature/a-clear-name

# Edit the relevant source and tests

npx vitest run --environment jsdom

npm run lint

npm run build

git add <specific-files>

git commit -m "Summarize the work"

git push -u origin feature/a-clear-name

```

On GitHub, open a **pull request** from the feature branch to `main`. Include a description, screenshots when useful, the actual test results, and any limitations. Request a review according to the team's process. Avoid `git push --force` and avoid changing teammates' files without coordinating.

**Important:** Being invited as a collaborator grants repository access. A teammate appears as a contributor when their commits are attributed to their GitHub account; names or surnames do not have to be published in the README.

### What the team has done so far (project milestones)

1. Set up React, TypeScript, Vite and the GitHub repository.

2. Added geocoding and location-aware time-zone handling.

3. Integrated Astronomy Engine and implemented target filtering.

4. Built the directional sky chart and 30-minute checklist.

5. Added browser-local mission progress and error handling.

6. Fixed stale results when inputs change and protected against outdated lookup responses.

7. Improved mobile presentation and added initial astronomy boundary tests.

8. Ran **11 tests** at the earlier milestone and compared Vega/Saturn against Stellarium.

9. Added validation and mentor-demo documents and merged the reliability/mobile changes into `main` through Pull Request #1.

10. Added **multi-city selection** and **four React UI tests**, reaching **15 passing tests locally**; merged them into `main` through Pull Request #2.

This is a record of **technical project milestones**, not an attribution of each change to a particular team member.

## 12. Mentor demo — quick outline

A five-minute demonstration can follow this sequence:

1. **Problem:** New stargazers don't know which objects to look for.

2. **Solution:** SkyScout makes a small personalized 30-minute mission using a city and local time.

3. **Demonstration:** Search for Oshawa, set November 3, 2026 at 9 PM, and generate a mission. Select Oshawa from the city results before planning.

4. **Explain the data flow:** Open-Meteo → Luxon → Astronomy Engine → filters → chart/checklist.

5. **Show interaction:** Check a target, refresh and explain browser-local saved progress; change the date/city and show that previous results disappear.

6. **Evidence:** Show the **15-test local run** and the manual Stellarium comparison; explain the limits honestly.

7. **Future work:** Network and storage tests, larger catalogue, more independent validation, weather, and improved accessibility.

The [MENTOR_DEMO.md](MENTOR_DEMO.md) walkthrough was originally written earlier in development; verify that its city-selection and test-count details match the current `main` branch before presenting.

## 13. Common problems and fixes

\| Problem | What to do |

\| --- | --- |

\| `npm` not recognized | Install Node.js, reopen terminal, run `node --version` and `npm --version` |

\| `Cannot find module` | Run `npm ci` from the folder containing `package.json` |

\| Can't open localhost | Start `npm run dev`, use the exact address displayed |

\| Port 5173 already used | Vite often selects 5174 automatically; use that address |

\| PowerShell says folder path is not a command | Use `cd path-to-project` rather than typing the folder path alone |

\| `LF will be replaced by CRLF` | Usually a line-ending warning on Windows; not a code failure |

\| Import error for `searchLocations` | Make sure `src/location.ts` is the newer multi-city version and not the old `searchLocation` version |

\| A test says it can't find `./App` from `src/src/App.test.tsx` | Move the test to `src/App.test.tsx` (avoid a nested `src/src`) |

\| 11 tests instead of 15 | Your local checkout may be outdated; run `git pull --ff-only origin main`, `npm ci`, and confirm `src/App.test.tsx` exists |

\| Location doesn't appear | Check spelling, internet access, or try nearby place names |

\| No astronomy targets | Try a dark night-time observation and verify the resolved city |

\| Checks aren't saved | Ensure you use the same browser and same mission inputs; browser data may have been cleared |

\| Git push rejected (fetch first) | Fetch and inspect changes; integrate safely, never force-push over teammates' commits |

## 14. What is finished vs what is not

**Completed for the MVP:** city selection and disambiguation, time conversion, target filters, a basic SVG chart, mission guidance, browser-local checklist, stale-result protection, responsive layout, 15 locally passing tests, and the first two-object reference comparison.

**Merged into `main`:** Pull Request #2 added city disambiguation and four additional mocked React UI tests. The last reported local run passed **15/15 tests**.

**Not yet complete:** comprehensive astronomy validation, beginner usability testing, automated UI/storage/network coverage, alternative-time suggestions when no target is found, production hosting, and cloud sync. Live weather, an expanded catalogue, and local obstruction modelling are outside the current MVP scope.

## 15. Team handoff checklist

\- [ ] Can clone the repository and run `npm ci`.

\- [ ] Can start the application and identify the correct localhost URL.

\- [ ] Understand the purpose of `App.tsx`, `location.ts`, `timezone.ts`, `astronomy.ts`, `SkyChart.tsx`, and `Mission.tsx`.

\- [ ] Can describe altitude, azimuth, brightness, and why local time zones matter.

\- [ ] Can reproduce the relevant test run for the selected branch.

\- [ ] Can create a feature branch and submit a pull request.

\- [ ] Understand what's tested, what's independently validated, and what remains a limitation.

**---**

**Maintenance rule:** Update this guide and the README whenever code, tests, branch status, or setup steps change. Both documents should reflect what is actually merged into `main` and distinguish local test results from CI results.
