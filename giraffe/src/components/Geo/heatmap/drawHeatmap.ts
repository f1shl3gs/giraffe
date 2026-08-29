// Types
export interface HeatmapPoint {
  x: number
  y: number
  intensity: number
}

export interface HeatmapOptions {
  radius: number
  blur: number
  max: number
  gradient: Record<number, string>
}

interface CacheEntry {
  brush: HTMLCanvasElement | null
  lut: Uint8ClampedArray | null
}

// Libraries
const cache = new Map<string, CacheEntry>()

// Offscreen radial-gradient circle with the blur baked into its falloff
export const buildBrush = (
  radius: number,
  blur: number
): HTMLCanvasElement | null => {
  const center = radius + blur
  const size = center * 2
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return null
  }
  canvas.width = size
  canvas.height = size
  const gradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center
  )
  gradient.addColorStop(0, 'rgba(0,0,0,1)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return canvas
}

// Color ramp sampled into a 256-entry RGBA lookup table indexed by alpha level
export const buildGradientLUT = (
  gradient: Record<number, string>
): Uint8ClampedArray | null => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return null
  }
  canvas.width = 256
  canvas.height = 1
  const ramp = ctx.createLinearGradient(0, 0, 256, 0)
  Object.keys(gradient)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach(stop => {
      ramp.addColorStop(stop, gradient[stop])
    })
  ctx.fillStyle = ramp
  ctx.fillRect(0, 0, 256, 1)
  return ctx.getImageData(0, 0, 256, 1).data
}

// Recolor every pixel by its alpha level via the LUT, keeping the alpha byte;
// mutates `data` in place
export const applyPalette = (
  data: Uint8ClampedArray,
  lut: Uint8ClampedArray
): void => {
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha > 0) {
      data[i] = lut[alpha * 4]
      data[i + 1] = lut[alpha * 4 + 1]
      data[i + 2] = lut[alpha * 4 + 2]
    }
  }
}

export const drawHeatmap = (
  canvas: HTMLCanvasElement,
  points: HeatmapPoint[],
  options: HeatmapOptions
): void => {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (points.length === 0) {
    return
  }

  const key = `${options.radius}|${options.blur}|${JSON.stringify(
    options.gradient
  )}`
  let entry = cache.get(key)
  if (!entry || !entry.brush || !entry.lut) {
    entry = {
      brush: buildBrush(options.radius, options.blur),
      lut: buildGradientLUT(options.gradient),
    }
    cache.set(key, entry)
  }
  const {brush, lut} = entry
  if (!brush || !lut) {
    return
  }

  const half = options.radius + options.blur

  ctx.globalAlpha = 1
  for (const point of points) {
    ctx.globalAlpha = Math.min(Math.max(point.intensity / options.max, 0), 1)
    ctx.drawImage(brush, point.x - half, point.y - half)
  }
  ctx.globalAlpha = 1

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  applyPalette(image.data, lut)
  ctx.putImageData(image, 0, 0)
}
