
import { describe, it, expect } from 'vitest'
import { getObservationDate } from './timezone'

describe('SkyScout Time Zone Tests', () => {

  it('converts Toronto local time correctly', () => {
    const result = getObservationDate(
      '2026-11-03',
      '21:00',
      'America/Toronto'
    )

    expect(result.toISOString()).toBe(
      '2026-11-04T02:00:00.000Z'
    )
  })

  it('converts Vancouver local time correctly', () => {
    const result = getObservationDate(
      '2026-11-03',
      '21:00',
      'America/Vancouver'
    )

    expect(result.toISOString()).toBe(
      '2026-11-04T05:00:00.000Z'
    )
  })

  it('rejects nonexistent daylight saving time', () => {
    expect(() =>
      getObservationDate(
        '2027-03-14',
        '02:30',
        'America/Toronto'
      )
    ).toThrow('does not exist')
  })

  it('rejects ambiguous daylight saving time', () => {
    expect(() =>
      getObservationDate(
        '2027-11-07',
        '01:30',
        'America/Toronto'
      )
    ).toThrow('occurs twice')
  })

})
