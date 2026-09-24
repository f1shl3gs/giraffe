const collapseDoubledQuotes = (value: string): string => {
  if (!value.includes('""')) {
    return value
  }
  let result = ''
  let index = 0
  while (index < value.length) {
    const pair = value.indexOf('""', index)
    if (pair === -1) {
      result += value.slice(index)
      break
    }
    result += value.slice(index, pair) + '"'
    index = pair + 2
  }
  return result
}

const parseCSV = (input: string): [string[], string[][]] => {
  const rows: string[][] = []
  let cells: string[] = []
  let cellStart = 0
  let closeIdx = -1
  let inQuotes = false

  const pushCell = (end: number): void => {
    let value: string
    if (input[cellStart] === '"') {
      value =
        closeIdx === -1
          ? input.slice(cellStart + 1, end)
          : input.slice(cellStart + 1, closeIdx) +
            input.slice(closeIdx + 1, end)
      value = collapseDoubledQuotes(value)
    } else {
      value = input.slice(cellStart, end)
    }
    cells.push(value)
    closeIdx = -1
  }

  const pushRow = (end: number, next: number): void => {
    pushCell(end)
    rows.push(cells)
    cells = []
    cellStart = next
  }

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          i++
        } else {
          closeIdx = i
          inQuotes = false
        }
      }
      continue
    }

    if (char === '"' && i === cellStart) {
      inQuotes = true
    } else if (char === ',') {
      pushCell(i)
      cellStart = i + 1
    } else if (char === '\n') {
      pushRow(i, i + 1)
    } else if (char === '\r') {
      const hasNewline = input[i + 1] === '\n'
      pushRow(i, hasNewline ? i + 2 : i + 1)
      if (hasNewline) {
        i++
      }
    }
  }

  if (input.length > 0) {
    pushCell(input.length)
    rows.push(cells)
  }

  return rows[0] === undefined ? [[], []] : [rows[0], rows.slice(1)]
}

export default parseCSV
