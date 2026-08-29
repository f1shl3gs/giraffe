/*
  This module contains utilites for formatting values in visualizations.

  A `Formatter` takes a value in a table and formats it as a user-facing
  string. A formatter factory creates a `Formatter`. Here we define several
  formatter factories for common use cases such as formatting time values, or
  formatting quantities of bytes.

      // Create a formatter by calling the factory
      const myTimeFormatter = timeFormatter({timezone: 'America/New_York'})

      // Use the formatter to get a user-friendly string representation of a value
      myTimeFormatter(1562018849599)

      // => returns "1 July 2019"

*/

import {format as d3Format} from 'd3-format'

import {Formatter, FormatterType} from '../types'

const DEFAULT_TIME_FORMATS = {
  local12: 'YYYY-MM-DD hh:mm:ss A',
  local24: 'YYYY-MM-DD HH:mm:ss ZZ',
  zoned12: 'YYYY-MM-DD hh:mm:ss A ZZ',
  zoned24: 'YYYY-MM-DD HH:mm:ss ZZ',
}

const MINUTE = 1000 * 60
const HOUR = 1000 * 60 * 60
const DAY = 1000 * 60 * 60 * 24
const WEEK = 1000 * 60 * 60 * 24 * 7

const TIME_FORMATS_BY_GRANULARITY = [
  {
    minWidth: 0,
    maxWidth: 1 * MINUTE,
    local12: 'hh:mm:ss.sss A',
    local24: 'HH:mm:ss.sss ZZ',
    zoned12: 'hh:mm:ss.sss A ZZ',
    zoned24: 'HH:mm:ss.sss ZZ',
  },
  {
    minWidth: 1 * MINUTE,
    maxWidth: 1 * HOUR,
    local12: 'hh:mm:ss A',
    local24: 'HH:mm:ss ZZ',
    zoned12: 'hh:mm:ss A ZZ',
    zoned24: 'HH:mm:ss ZZ',
  },
  {
    minWidth: 1 * HOUR,
    maxWidth: 1 * DAY,
    local12: 'hh:mm A',
    local24: 'HH:mm ZZ',
    zoned12: 'hh:mm A ZZ',
    zoned24: 'HH:mm ZZ',
  },
  {
    minWidth: 1 * DAY,
    maxWidth: 2 * WEEK,
    local12: 'MMM DD, hh:mm A',
    local24: 'MMM DD, HH:mm ZZ',
    zoned12: 'MMM DD, hh:mm A ZZ',
    zoned24: 'MMM DD, HH:mm ZZ',
  },
  {
    minWidth: 2 * WEEK,
    maxWidth: 4 * WEEK,
    local12: 'MMM DD',
    local24: 'MMM DD',
    zoned12: 'MMM DD',
    zoned24: 'MMM DD',
  },
  {
    minWidth: 4 * WEEK,
    maxWidth: Infinity,
    local12: 'YYYY-MM-DD',
    local24: 'YYYY-MM-DD',
    zoned12: 'YYYY-MM-DD',
    zoned24: 'YYYY-MM-DD',
  },
]

// Get the "short" name for a time zone, e.g. "America/Los_Angeles" => PST
const getShortTimeZoneName = (timeZone: string, date: Date) => {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    timeZoneName: 'short',
  }).format(date)

  return formatted.substring(formatted.indexOf(',') + 2)
}

interface TimeParts {
  [key: string]: string
}

type TimeTokenFormatter = (parts: TimeParts, date: Date) => string

// A time format token is a maximal run of these characters (e.g. "YYYY",
// "mm") or the two-character token "ZZ". Runs of token characters that do
// not name a token (e.g. a lone "s") are emitted verbatim.
const TIME_TOKEN_CHAR = /[YMDdAaHhms]/

const timePartParsers = new Map<string, (date: Date) => TimeParts>()

// Returns the "year", "month", "day", "hour", "minute", "second", "weekday"
// and "dayPeriod" of a date as rendered in the given time zone, plus the
// "l"-prefixed fields ("lmonth", "lhour") taken with an hour12-less
// formatter so they do not depend on the locale's default hour cycle.
const getTimePartsParser = (
  locale?: string,
  timezone?: string
): ((date: Date) => TimeParts) => {
  const key = `${locale}${timezone}`

  let parser = timePartParsers.get(key)

  if (!parser) {
    const intlFormatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
    })
    const intlLongFormatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
      hour: '2-digit',
      hour12: false,
      timeZone: timezone,
    })

    parser = (date: Date): TimeParts => {
      const parts: TimeParts = {}

      for (const token of intlFormatter.formatToParts(date)) {
        if (token.type !== 'literal') {
          parts[token.type] = token.value
        }
      }

      for (const token of intlLongFormatter.formatToParts(date)) {
        if (token.type !== 'literal') {
          parts[`l${token.type}`] = token.value
        }
      }

      parts.dayPeriod = parts.dayPeriod || parts.dayperiod || ''
      delete parts.dayperiod

      // some environments resolve midnight as hour "24"
      parts.lhour = ('0' + (Number(parts.lhour) % 24)).slice(-2)

      return parts
    }

    timePartParsers.set(key, parser)
  }

  return parser
}

const renderTimeFormat = (
  format: string,
  tokenFormatters: Record<string, TimeTokenFormatter>,
  parts: TimeParts,
  date: Date
): string => {
  let output = ''
  let i = 0

  while (i < format.length) {
    if (TIME_TOKEN_CHAR.test(format[i])) {
      // consume the whole run of token characters, e.g. "YYYY", "sss"
      let j = i + 1
      while (j < format.length && TIME_TOKEN_CHAR.test(format[j])) {
        j += 1
      }
      const mask = format.slice(i, j)
      const tokenFormatter = tokenFormatters[mask]
      output += tokenFormatter ? tokenFormatter(parts, date) : mask
      i = j
    } else if (format[i] === 'Z' && format[i + 1] === 'Z') {
      output += tokenFormatters.ZZ(parts, date)
      i += 2
    } else {
      output += format[i]
      i += 1
    }
  }

  return output
}

interface TimeFormatter extends Formatter {
  (timestamp: number, options?: {domainWidth?: number}): string

  _GIRAFFE_FORMATTER_TYPE: FormatterType.Time
}

export interface TimeFormatterFactoryOptions {
  // BCP 47 language tag or "default"
  locale?: string

  // IANA Time Zone Database name (e.g. "America/New_York") or "UTC"
  timeZone?: string

  // Whether to use a 12- or 24-hour clock (default true)
  hour12?: boolean

  // Format string, e.g. "YYYY-MM-DD HH:mm".
  //
  // Supported tokens:
  //
  // - `YYYY` / `YY`: year / last two digits of year
  // - `MMMM` / `MMM` / `MM`: month name / short month name / 2-digit month
  // - `DD` / `D`: day of month, with / without zero padding
  // - `dddd` / `ddd`: weekday name / short weekday name
  // - `HH` / `hh`: hours (24-hour / 12-hour)
  // - `mm` / `ss` / `sss`: minutes / seconds / milliseconds
  // - `a` / `A`: ante meridiem and post meridiem
  // - `ZZ`: short time zone name (e.g. "PST")
  //
  // Any other letters are output verbatim.
  format?: string
}

export const timeFormatter = ({
  locale,
  timeZone,
  format,
  hour12,
}: TimeFormatterFactoryOptions = {}): TimeFormatter => {
  // RegEx to check for "UTC" case insensitive
  const UTC_TIME_ZONE = /utc/i

  // this check is used to determine whether a user's locale is 24h or 12h
  const is24hourLocale = new Date(2014, 1, 1, 15, 0, 0, 0)
    .toLocaleTimeString()
    .includes('15')

  const tokenFormatters: Record<string, TimeTokenFormatter> = {
    YYYY: ({year}) => year,
    YY: ({year}) => year.slice(-2),
    MMMM: ({lmonth}) => lmonth,
    MMM: ({lmonth}) => lmonth.slice(0, 3),
    MM: ({month}) => month,
    DD: ({day}) => day,
    dddd: ({weekday}) => weekday,
    ddd: ({weekday}) => weekday.slice(0, 3),
    A: ({dayPeriod}) => dayPeriod,
    mm: ({minute}) => minute,
    ss: ({second}) => second,
    // a deliberate space in front of single digit hours keeps the tick label length
    // and the total number of ticks consistent regardless of time frame
    hh: ({hour}) => {
      const numericalHour = Number(hour)
      return numericalHour < 10 ? ` ${numericalHour}` : `${numericalHour}`
    },
    HH: ({hour, lhour}) => {
      const hasMeridiem = / a/i
      const is24hourFormat =
        is24hourLocale || UTC_TIME_ZONE.test(timeZone) || hour12 === false

      if (hasMeridiem.test(format)) {
        if (Number(lhour) === 0) {
          return '12'
        }
        if (Number(lhour) > 12) {
          return String(Number(lhour) - 12)
        }
        return String(Number(lhour))
      }
      if (is24hourFormat) {
        const numericalHour = Number(lhour) % 24
        return numericalHour < 10 ? `0${numericalHour}` : `${numericalHour}`
      }
      return hour
    },
    sss: (_, date) => String(date.getMilliseconds()).padStart(3, '0'),
    D: ({day}) => String(Number(day)),
    a: ({dayPeriod, lhour}) => {
      if (format && format.includes('a') && is24hourLocale) {
        if (Number(lhour) >= 12) {
          return 'PM'
        } else {
          return 'AM'
        }
      }
      return dayPeriod || ''
    },
    ZZ: (_, date) => getShortTimeZoneName(timeZone, date),
  }

  const formatStringFormatter = (date: Date, formatString: string): string =>
    renderTimeFormat(
      formatString,
      tokenFormatters,
      getTimePartsParser(locale, timeZone)(date),
      date
    )

  let formatter

  const getValidDate = (timestamp: number): Date => {
    const date = new Date(timestamp)
    return date.getTime() === date.getTime() ? date : new Date()
  }

  if (format) {
    // If a `format` string is passed, we simply use it
    formatter = (timestamp: number) =>
      formatStringFormatter(getValidDate(timestamp), format)
  } else {
    // Otherwise we will return a formatter that will vary the output format
    // based on an optional `domainWidth` argument (e.g. we will show more
    // detail in a formatted timestamp if a user is viewing data in a short
    // time range)
    formatter = (timestamp: number, {domainWidth = null} = {}) => {
      let timeFormats = DEFAULT_TIME_FORMATS

      if (domainWidth) {
        timeFormats = TIME_FORMATS_BY_GRANULARITY.find(
          d => d.minWidth <= domainWidth && d.maxWidth > domainWidth
        )
      }

      let timeFormat

      if (
        (timeZone === 'UTC' && hour12 === undefined) ||
        (timeZone && hour12 === false)
      ) {
        timeFormat = timeFormats.zoned24
      } else if (timeZone) {
        timeFormat = timeFormats.zoned12
      } else if (hour12 === false) {
        timeFormat = timeFormats.local24
      } else if (is24hourLocale) {
        // this implementation checks the user's OS/browser settings to
        // check whether their locale is 12h or 24h
        // Evaluating true means that the local is based on a 24h locale
        timeFormat = timeFormats.local24
      } else {
        timeFormat = timeFormats.local12
      }

      return formatStringFormatter(getValidDate(timestamp), timeFormat)
    }
  }

  formatter._GIRAFFE_FORMATTER_TYPE = FormatterType.Time
  return formatter
}

export const BINARY_PREFIX_FORMATTER_TYPE: 'BINARY_PREFIX' = 'BINARY_PREFIX'

const BINARY_PREFIXES = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

interface BinaryPrefixFormatter extends Formatter {
  (x: number): string

  _GIRAFFE_FORMATTER_TYPE: FormatterType.BinaryPrefix
}

interface BinaryPrefixFormatterFactoryOptions {
  prefix?: string
  suffix?: string
  significantDigits?: number
  trimZeros?: boolean
  format?: boolean
}

export const binaryPrefixFormatter = ({
  prefix = '',
  suffix = '',
  significantDigits = 6,
  trimZeros = true,
  format = true,
}: BinaryPrefixFormatterFactoryOptions = {}): BinaryPrefixFormatter => {
  const formatSigFigs = d3Format(
    `.${significantDigits}${trimZeros ? '~' : ''}f`
  )

  const formatter = (x: number) => {
    const isXBig = Math.abs(x) >= 1024
    const i = Math.floor(Math.log(Math.abs(x)) / Math.log(2 ** 10))
    const binaryFormattedNumber = isXBig ? x / 1024 ** i : x
    const binaryPrefix = isXBig ? ' ' + BINARY_PREFIXES[i] : ''

    const decimalFormattedNumber = formatSigFigs(binaryFormattedNumber)

    if (format !== true) {
      return `${prefix}${x}${suffix}`
    }

    return `${prefix}${decimalFormattedNumber}${binaryPrefix}${suffix}`
  }

  formatter._GIRAFFE_FORMATTER_TYPE =
    FormatterType.BinaryPrefix as FormatterType.BinaryPrefix

  return formatter
}

export const SI_PREFIX_FORMATTER_TYPE: 'SI_PREFIX' = 'SI_PREFIX'

interface SIPrefixFormatter extends Formatter {
  (x: number): string

  _GIRAFFE_FORMATTER_TYPE: FormatterType.SIPrefix
}

interface SIPrefixFormatterFactoryOptions {
  prefix?: string
  suffix?: string
  significantDigits?: number
  trimZeros?: boolean
  format?: boolean
}

export const siPrefixFormatter = ({
  prefix = '',
  suffix = '',
  significantDigits = 6,
  trimZeros = true,
  format = true,
}: SIPrefixFormatterFactoryOptions = {}): SIPrefixFormatter => {
  let formatter
  const formatSIPrefix = d3Format(
    `.${significantDigits}${trimZeros ? '~' : ''}s`
  )

  if (format !== true) {
    formatter = (x: number): string => `${prefix}${x}${suffix}`
  } else {
    formatter = (x: number): string => {
      // code below shortens extremely large or small numbers (greater than septillion+) by
      // first converting number to SI format, then removing the SI unit to convert
      // number to scientific notation, and finally
      // adding yotta (Y) back
      if (x >= 1e30 || x <= -1e30) {
        const siFormattedValue = String(formatSIPrefix(Math.abs(x))).slice(
          0,
          -1
        )
        return `${prefix}${x < 0 ? '-' : ''}${d3Format(`.${significantDigits}`)(
          Number(siFormattedValue)
        )}Y${suffix}`
      }
      return `${prefix}${formatSIPrefix(x)}${suffix}`
    }
  }

  formatter._GIRAFFE_FORMATTER_TYPE =
    FormatterType.SIPrefix as FormatterType.SIPrefix

  return formatter
}
