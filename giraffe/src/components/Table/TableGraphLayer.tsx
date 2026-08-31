// Libraries
import React, {FunctionComponent, useState} from 'react'

// Components
import {TableGraph} from './TableGraph'
import {TableSidebar} from './TableSidebar'

// Types
import {FluxTable, TableGraphLayerConfig} from '../../types'

// Styles
import styles from './TableGraphs.scss'

interface Props {
  config: TableGraphLayerConfig
}

const getNameOfSelectedTable = (
  tables: FluxTable[],
  selectedTableName: string
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
  selectedTableName: string
): boolean => {
  return !!getSelectedTable(tables, selectedTableName)
}

const getSelectedTable = (
  tables: FluxTable[],
  selectedTableName: string
): FluxTable => {
  return tables.find(
    t => t.name === getNameOfSelectedTable(tables, selectedTableName)
  )
}

export const TableGraphLayer: FunctionComponent<Props> = (props: Props) => {
  const {
    config: {tables, properties, timeZone, tableTheme = 'dark'},
  } = props

  const [selectedTableName, setSelectedTableName] = useState<string>(
    tables[0]?.name
  )

  return (
    <div className={styles['time-machine-tables']}>
      {showSidebar(tables) && (
        <TableSidebar
          data={tables}
          selectedTableName={getNameOfSelectedTable(tables, selectedTableName)}
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
  )
}
