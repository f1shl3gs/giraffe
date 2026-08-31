import {FluxTable} from '../types'
import {groupBy} from './groupBy'
import {escapeCSVFieldWithSpecialCharacters} from './escapeCSVFieldWithSpecialCharacters'
import parseCSV from './csv'

export const parseResponseError = (resp: string): FluxTable[] => {
  const [columns, rows] = parseCSV(resp.trim())

  return [
    {
      id: crypto.randomUUID(),
      name: 'Error',
      result: '',
      groupKey: {},
      dataTypes: {},
      data: [columns, ...rows],
    },
  ]
}

/*
  A Flux CSV response can contain multiple CSV files each joined by a newline.
  This function splits up a CSV response into these individual CSV files.

  See https://github.com/influxdata/flux/blob/master/docs/SPEC.md#multiple-tables.
*/
export const parseChunks = (resp: string): string[] => {
  const trimmed = resp.trim()
  if (trimmed === '') {
    return []
  }

  // Split the resp into separate chunks whenever we encounter:
  //
  // 1. A newline
  // 2. Followed by any amount of whitespace
  // 3. Followed by a newline
  // 4. Followed by a `#` character
  //
  // The last condition is [necessary][0] for handling CSV responses with
  // values containing newlines.
  //
  // [0]: https://github.com/influxdata/influxdb/issues/15017

  // use regex lookahead
  // Add back the `#` characters that were removed by splitting
  return trimmed
    .split(/\n\s*\n#(?=datatype|group|default)/)
    .map((chunk, chunkNumber) => (chunkNumber === 0 ? chunk : `#${chunk}`))
}

export const parseResponse = (resp: string): FluxTable[] => {
  const chunks = parseChunks(resp)

  return chunks.reduce((acc, chunk) => {
    return [...acc, ...parseTables(chunk)]
  }, [])
}

export const parseTables = (input: string): FluxTable[] => {
  const [columns, linesData] = parseCSV(input)
  const lines: string[] = [columns, ...linesData].map(line =>
    line.map(escapeCSVFieldWithSpecialCharacters).join(',')
  )
  const annotationLines: string = lines
    .filter(line => line.startsWith('#'))
    .join('\n')
    .trim()

  if (!annotationLines) {
    throw new Error('Unable to extract annotation data')
  }

  const nonAnnotationLines: string = lines
    .filter(line => !line.startsWith('#'))
    .join('\n')
    .trim()

  if (!nonAnnotationLines) {
    // A response may be truncated on an arbitrary line. This guards against
    // the case where a response is truncated on annotation data
    return []
  }

  const [nonAnnotationColumns, nonAnnotationRows] = parseCSV(nonAnnotationLines)
  const nonAnnotationData = [nonAnnotationColumns, ...nonAnnotationRows]
  const [annotationColumns, annotationRows] = parseCSV(annotationLines)
  const annotationData = [annotationColumns, ...annotationRows]
  const headerRow = nonAnnotationData[0]
  const tableColIndex = headerRow.findIndex(h => h === 'table')
  const resultColIndex = headerRow.findIndex(h => h === 'result')

  interface TableGroup {
    [tableId: string]: string[][]
  }

  const tableGroup: TableGroup = groupBy(
    nonAnnotationData.slice(1),
    row => row[tableColIndex]
  )
  // Group rows by their table id
  const tablesData = Object.values(tableGroup)

  const groupRow = annotationData.find(row => row[0] === '#group')
  const defaultsRow = annotationData.find(row => row[0] === '#default')
  const dataTypeRow = annotationData.find(row => row[0] === '#datatype')

  const groupKeyIndices = groupRow.reduce((acc, value, i) => {
    if (value === 'true') {
      return [...acc, i]
    }

    return acc
  }, [])

  return tablesData.map(tableData => {
    const dataRow = tableData[0] ?? defaultsRow
    const result =
      dataRow[resultColIndex] || defaultsRow?.[resultColIndex] || ''

    const groupKey = groupKeyIndices.reduce((acc, i) => {
      return {...acc, [headerRow[i]]: dataRow[i] ?? ''}
    }, {})

    const name = Object.entries(groupKey)
      .filter(([k]) => !['_start', '_stop'].includes(k))
      .map(([k, v]) => `${k}=${v}`)
      .join(' ')

    const dataTypes = dataTypeRow.reduce(
      (acc, dataType, i) => ({
        ...acc,
        [headerRow[i]]: dataType,
      }),
      {}
    )
    return {
      id: crypto.randomUUID(),
      data: [[...headerRow], ...tableData],
      name,
      result,
      groupKey,
      dataTypes,
    } as FluxTable
  })
}
