// Libraries
import {FunctionComponent, JSX, useMemo} from 'react'
// Types
import {FluxTable} from 'types'
// Utils
import {parseResponse} from 'utils/fluxParsing'

interface Props {
  files: string[]
  children: (tables: FluxTable[]) => JSX.Element
}

export const FluxTablesTransform: FunctionComponent<Props> = ({
  files,
  children,
}) => {
  const tables = useMemo(() => files.flatMap(parseResponse), [files])
  return children(tables)
}
