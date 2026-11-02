
import { DateTime } from 'luxon'

export function getObservationDate(
  date: string,
  time: string,
  timezone: string
): Date {
  const requestedDateTime = `${date}T${time}`

  const localDateTime = DateTime.fromISO(
    requestedDateTime,
    { zone: timezone }
  )

  if (!localDateTime.isValid) {
    throw new Error(
      'Invalid observation date, time, or time zone.'
    )
  }

  // Reject times skipped when clocks move forward.
  if (
    localDateTime.toFormat("yyyy-MM-dd'T'HH:mm") !==
    requestedDateTime
  ) {
    throw new Error(
      'This local time does not exist due to daylight saving time. Please choose another time.'
    )
  }

  // Reject times repeated when clocks move backward.
  if (localDateTime.getPossibleOffsets().length > 1) {
    throw new Error(
      'This local time occurs twice due to daylight saving time. Please choose another time.'
    )
  }

  return localDateTime.toJSDate()
}

