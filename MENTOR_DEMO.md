# SkyScout - Mentor Demo

## Project Overview

SkyScout is a beginner-friendly stargazing application that helps users explore the night sky through a guided 30-minute mission.

The user searches for a city and selects the correct location, observation date, and local time. SkyScout recommends up to three potentially visible celestial objects, shows their approximate locations on a directional sky chart, and provides an observation checklist that saves progress in the same browser.

## Technology Stack

- React and TypeScript - user interface
- Vite - development and build tooling
- Astronomy Engine - celestial position calculations
- Open-Meteo - location lookup and matching city choices
- Luxon - time-zone conversion
- Browser localStorage - saved observation progress
- Vitest and React Testing Library - automated testing

## How SkyScout Works

1. The user enters a city and clicks **Find Locations**.
2. The user selects the correct city from the matching locations and chooses a date and local time.
3. Open-Meteo provides latitude, longitude, and the selected location's time zone.
4. Luxon converts the local observation time into a precise instant.
5. Astronomy Engine calculates celestial positions.
6. SkyScout filters objects using astronomical darkness, altitude, and brightness, then recommends up to three targets.
7. The application displays a directional sky chart and guided 30-minute mission with an observation checklist.

## Live Demonstration

1. Open SkyScout.
2. Enter **Oshawa**, click **Find Locations**, and select **Oshawa, Ontario, Canada** from the results.
3. Select **November 3, 2026**, at **9:00 PM** local time.
4. Click **Plan My Mission**.
5. Review the generated targets. In an earlier comparison for this scenario, the results included **Vega and Saturn**; use the actual app output during the demo.
6. Explain altitude (height above the horizon) and azimuth (compass direction).
7. Show the directional sky chart and guided mission steps.
8. Check the observed targets and refresh the page or reopen the same mission to demonstrate locally saved progress.
9. Change the city or observation time and show that old results are cleared.
10. If there are no suitable targets, explain that the app can return an empty result when its visibility filters are not met.

## Testing

- The last recorded local test run passed **15 automated tests** across time-zone, astronomy, edge-case, and React interface tests.
- The last recorded lint check completed with zero warnings and errors.
- The production build completed successfully in the last recorded local verification.
- The interface was visually checked in a simulated mobile-sized viewport.
- The React interface tests mock the location service and astronomy calculations; they do not verify live network availability or comprehensive astronomical accuracy.

## Astronomy Validation

SkyScout was compared against Stellarium Web for **Oshawa, November 3, 2026, at 9:00 PM EST**.

- Vega altitude difference: **0.11 degrees**
- Vega azimuth difference: **0.05 degrees**
- Saturn altitude difference: **0.02 degrees**
- Saturn azimuth difference: **0.10 degrees**

Both objects agreed with Stellarium within **0.2 degrees** in this initial comparison. This covers two objects at one place and time, not full scientific validation.

## Current Limitations

- Weather, light pollution, terrain, buildings, and trees are not evaluated.
- The celestial catalogue contains a limited set of objects.
- Location choice is available for matching city names, but geocoding still depends on an external service and an internet connection.
- Observation progress is saved in the same browser, not synchronized across devices.
- Additional dates, locations, and celestial objects need independent validation.
- A no-target result currently suggests trying another time but does not automatically find a better observing time.

## Future Improvements

- Broader astronomy validation across multiple dates, locations, and objects
- Expanded celestial catalogue
- Additional tests for network failures, request races, and saved progress
- Beginner usability testing, real-device testing, and accessibility improvements
- More helpful guidance when no objects meet the selection rules
- Weather and observing-condition integration
