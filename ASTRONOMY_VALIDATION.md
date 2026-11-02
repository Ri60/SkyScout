
# SkyScout Astronomy Validation

## Purpose

Compare SkyScout's calculated celestial positions with
Stellarium Web, an independent astronomy reference.

## Test configuration

- Location: Oshawa, Canada
- Date: November 3, 2026
- Local time: 9:00 PM EST
- Reference: https://stellarium-web.org/

## Results

| Object | Measurement | SkyScout | Stellarium | Difference |
|---|---|---:|---:|---:|
| Vega | Altitude | 35.4° | 35.51° | 0.11° |
| Vega | Azimuth | 292.5° | 292.45° | 0.05° |
| Saturn | Altitude | 45.2° | 45.18° | 0.02° |
| Saturn | Azimuth | 158.6° | 158.50° | 0.10° |

## Conclusion

Both objects showed position differences below 0.2°
for this observation scenario.

These results support the accuracy of SkyScout's position
calculations for the tested objects, location, and time.

## Limitations

This is an initial independent comparison, not a
comprehensive scientific validation.

Further testing should cover additional dates,
locations, planets, stars, and the Moon.

Actual observing conditions also depend on weather,
light pollution, terrain, and atmospheric conditions.
