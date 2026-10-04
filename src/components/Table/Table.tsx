// Libraries

// Components
import {FluxTablesTransform} from 'components/FluxTablesTransform'
import {FunctionComponent, useState} from 'react'
// Types
import type {FluxTable, TableViewProperties, Theme, TimeZone} from 'types'
import {TableGraph} from './TableGraph'
import {TableSidebar} from './TableSidebar'

// Styles
import './TableGraphs.scss'

export interface TableProps {
  /*
    Flux CSV, one string per table. This is a list rather than a single response
    because a response can carry several tables (see `parseResponse`), and the
    sidebar switches between them.

    This component deliberately does not take a giraffe `Table`. It draws the raw
    parsed flux rows -- the grid shows the columns as they arrived, which is the
    whole point of it -- so there is nothing to convert from.

    Keep the identity of this array stable (memoize it). It is the dependency
    <FluxTablesTransform> parses on, so a fresh literal every render re-parses
    the CSV and hands the grid a new table object each time.
  */
  files: string[]
  config: TableConfig
}

const getNameOfSelectedTable = (
  tables: FluxTable[],
  selectedTableName: string,
) => {
  const isNameInTables = tables.find(t => t.name === selectedTableName)

  if (!isNameInTables) {
    return tables[0]?.name ?? null
  }

  return selectedTableName
}

const showSidebar = (tables: FluxTable[]): boolean => {
  return tables.length > 1
}

const hasData = (selectedTable: FluxTable): boolean => {
  return Array.isArray(selectedTable?.data) && selectedTable?.data?.length > 0
}

const isTableVisible = (
  tables: FluxTable[],
  selectedTableName: string,
): boolean => {
  return !!getSelectedTable(tables, selectedTableName)
}

const getSelectedTable = (
  tables: FluxTable[],
  selectedTableName: string,
): FluxTable => {
  return tables.find(
    t => t.name === getNameOfSelectedTable(tables, selectedTableName),
  )
}

export const Table: FunctionComponent<TableProps> = ({files, config}) => {
  const {properties, timeZone, tableTheme = 'dark'} = config

  const [selectedTableName, setSelectedTableName] = useState<string>('')

  return (
    <FluxTablesTransform files={files}>
      {tables => (
        <div className={'time-machine-tables'}>
          {showSidebar(tables) && (
            <TableSidebar
              data={tables}
              selectedTableName={getNameOfSelectedTable(
                tables,
                selectedTableName,
              )}
              onSelectTable={setSelectedTableName}
              theme={tableTheme}
            />
          )}
          {isTableVisible(tables, selectedTableName) && (
            <TableGraph
              key={getNameOfSelectedTable(tables, selectedTableName)}
              table={getSelectedTable(tables, selectedTableName)}
              properties={properties}
              timeZone={timeZone}
              theme={tableTheme}
            />
          )}
          {!hasData(getSelectedTable(tables, selectedTableName)) && (
            <div>
              <h4>This table has no data </h4>
            </div>
          )}
        </div>
      )}
    </FluxTablesTransform>
  )
}

export interface TableConfig {
  properties: TableViewProperties
  timeZone: TimeZone
  tableTheme?: Theme
}
