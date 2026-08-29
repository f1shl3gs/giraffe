import {
  THRESHOLD_COLORS,
  BASE_THRESHOLD_ID,
  THRESHOLD_TYPE_TEXT,
} from '../constants/thresholds'

import {Color} from '../types'

// Parses '#rgb' / '#rrggbb' hex colors (the only format used by thresholds).
const parseHexRgb = (input: string): [number, number, number] | null => {
  const nibble = (code: number): number | null => {
    // 0 ~ 9
    if (code >= 48 && code <= 57) {
      return code - 48
    }
    // a ~ f
    if (code >= 97 && code <= 102) {
      return code - 87
    }
    // A ~ F
    if (code >= 65 && code <= 70) {
      return code - 55
    }
    return null
  }

  const readColor = (first: number, second?: number): number | null => {
    const high = nibble(first)
    if (high === null) {
      return null
    }

    // handle input like '#fff'
    if (second === undefined) {
      return (high << 4) | high
    }

    const low = nibble(second)
    if (low === null) {
      return null
    }

    return (high << 4) | low
  }

  const hex = input.startsWith('#') ? input.slice(1) : input
  switch (hex.length) {
    case 3: {
      const red = readColor(hex.charCodeAt(0))
      const green = readColor(hex.charCodeAt(1))
      const blue = readColor(hex.charCodeAt(2))
      if (red === null || green === null || blue === null) {
        return null
      }

      return [red, green, blue]
    }
    case 6: {
      const red = readColor(hex.charCodeAt(0), hex.charCodeAt(1))
      const green = readColor(hex.charCodeAt(2), hex.charCodeAt(3))
      const blue = readColor(hex.charCodeAt(4), hex.charCodeAt(5))
      if (red === null || green === null || blue === null) {
        return null
      }

      return [red, green, blue]
    }
    default: {
      return null
    }
  }
}

const getLegibleTextColor = bgColorHex => {
  const darkText = '#292933'
  const lightText = '#ffffff'

  const [red, green, blue] = parseHexRgb(bgColorHex.trim()) ?? [139, 0, 0]
  const average = (red + green + blue) / 3
  const mediumGrey = 128

  return average > mediumGrey ? darkText : lightText
}

const findNearestCrossedThreshold = (colors: Color[], lastValue) => {
  const sortedColors = Array.isArray(colors)
    ? colors.sort((color1, color2) => color1.value - color2.value)
    : []

  return sortedColors.filter(color => lastValue >= color.value).pop()
}

export const generateThresholdsListHexs = ({
  colors,
  lastValue,
  cellType = 'line',
}: {
  colors: Color[]
  lastValue: string | number | null
  cellType: string
}) => {
  const defaultColoring = {
    bgColor: null,
    textColor: cellType === 'table' ? '#BEC2CC' : THRESHOLD_COLORS[11].hex,
  }

  const lastValueNumber = Number(lastValue) || 0

  if (!colors.length) {
    return defaultColoring
  }

  // baseColor is expected in all cases
  const baseColor = colors.find(color => color.id === BASE_THRESHOLD_ID) || {
    hex: defaultColoring.textColor,
  }

  if (!lastValue && lastValue !== 0) {
    return {...defaultColoring, textColor: baseColor.hex}
  }

  // If the single stat is above a line graph never have a background color
  if (cellType === 'line-plus-single-stat') {
    return baseColor
      ? {bgColor: null, textColor: baseColor.hex}
      : defaultColoring
  }

  // When there is only a base color and it's applied to the text
  const shouldColorizeText = !!colors.find(
    color => color.type === THRESHOLD_TYPE_TEXT
  )

  if (shouldColorizeText && colors.length === 1 && baseColor) {
    return {bgColor: null, textColor: baseColor.hex}
  }

  if (shouldColorizeText && colors.length === 1) {
    return defaultColoring
  }

  // When there's multiple colors and they're applied to the text
  if (shouldColorizeText && colors.length > 1) {
    const nearestCrossedThreshold = findNearestCrossedThreshold(
      colors,
      lastValueNumber
    )

    return {bgColor: null, textColor: nearestCrossedThreshold.hex}
  }

  // When there is only a base color and it's applued to the background
  if (colors.length === 1) {
    return {
      bgColor: baseColor.hex,
      textColor: getLegibleTextColor(baseColor.hex),
    }
  }

  // When there are multiple colors and they're applied to the background
  if (colors.length > 1) {
    const nearestCrossedThreshold = findNearestCrossedThreshold(
      colors,
      lastValueNumber
    )

    const bgColor = nearestCrossedThreshold
      ? nearestCrossedThreshold.hex
      : baseColor.hex

    return {bgColor, textColor: getLegibleTextColor(bgColor)}
  }

  return {bgColor: null, textColor: baseColor.hex}
}
