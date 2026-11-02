
import { DateTime } from 'luxon'

export function getObservationDate(
  date: string,
  time: string,
  timezone: string
): Date {
  const localDateTime = DateTime.fromISO(
    `${date}T${time}`,
    { zone: timezone }
  )

  if (!localDateTime.isValid) {
    throw new Error(
      'Invalid observation date, time, or time zone.'
    )
  }

  return localDateTime.toJSDate()
}

