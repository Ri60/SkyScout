
# SkyScout — Mentor Demo

## Project Overview

SkyScout is a beginner-friendly stargazing application that helps
users explore the night sky through a guided 30-minute mission.

The user enters their city, observation date, and local time.
SkyScout recommends up to three potentially visible celestial objects,
shows their approximate locations on a sky chart, and provides
an observation checklist.

## Technology Stack

- React and TypeScript — user interface
- Vite — development and build tooling
- Astronomy Engine — celestial position calculations
- Open-Meteo — location lookup
- Luxon — time-zone conversion
- Local Storage — saved observation progress
- Vitest — automated testing

## How SkyScout Works

1. The user enters a city, date, and time.
2. Open-Meteo provides latitude, longitude, and time zone.
3. Luxon converts the local observation time to a precise instant.
4. Astronomy Engine calculates celestial positions.
5. SkyScout filters objects using darkness, altitude, and brightness.
6. Up to three targets are recommended.
7. The application displays a directional chart and guided mission.

## Live Demonstration

1. Open SkyScout.
2. Enter Oshawa, Canada.
3. Select November 3, 2026, at 9:00 PM.
4. Generate a mission.
5. Show Vega and Saturn in the results.
6. Explain altitude and azimuth.
7. Show the directional sky chart.
8. Mark both objects as observed.
9. Refresh to demonstrate saved progress.
10. Change the location to demonstrate that outdated results disappear.

## Testing

- 11 automated tests passed.
- Lint completed with zero warnings and errors.
- Production build completed successfully.
- The sky chart was visually checked in a mobile-sized viewport.

## Astronomy Validation

SkyScout was compared against Stellarium Web for Oshawa,
November 3, 2026, at 9:00 PM.

- Vega altitude difference: 0.11°
- Vega azimuth difference: 0.05°
- Saturn altitude difference: 0.02°
- Saturn azimuth difference: 0.10°

Both objects agreed with Stellarium within 0.2 degrees
in this initial comparison.

## Current Limitations

- Weather and light pollution are not included.
- The celestial catalogue is limited.
- Ambiguous city names may resolve to the wrong place.
- Observation progress is saved locally, not synchronized.
- Additional dates, locations, and objects need validation.

## Future Improvements

- Improved city selection
- Expanded celestial catalogue
- Additional automated UI tests
- More accessibility and mobile testing
- Weather and observing-condition integration
