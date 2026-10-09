import type {Meta, StoryObj} from '@storybook/react'
import type {HistogramProps} from 'components/Histogram'
import {Histogram} from 'components/Histogram'
import {Line} from 'components/Line'
import type {LineProps} from 'components/Line'
import type {PlotConfig} from 'components/Plot'
import {Plot} from 'components/Plot'
import type {ScatterProps} from 'components/Scatter'
import {Scatter} from 'components/Scatter'

import {binaryPrefixFormatter, timeFormatter} from 'utils/formatters'
import {fromFlux} from 'utils/fromFlux'
import {fromRows} from 'utils/fromRows'
import {newTable} from 'utils/newTable'
import {CPU} from 'stories/data/cpu'
import {StoryFrame} from 'stories/helpers'
import {SIN} from 'stories/sin'

interface TestsArgs {}

export default {
  title: 'Tests',
} as Meta

type Story = StoryObj<TestsArgs>

export const SnapshotWithMultipleMinimumValues: Story = {
  render: () => {
    // https://github.com/influxdata/giraffe/issues/51

    const {table} = fromFlux(
      `#group,false,false,true,false,false
#datatype,string,long,string,long,dateTime:RFC3339
#default,_result,,,,
,result,table,_field,_value,_time
,,0,event,0,2019-05-01T12:00:00Z
,,0,event,0,2019-05-02T00:00:00Z
,,0,event,0,2019-05-02T12:00:00Z
,,0,event,0,2019-05-03T00:00:00Z
,,0,event,0,2019-05-03T12:00:00Z
,,0,event,1,2019-05-04T00:00:00Z
,,0,event,6,2019-05-04T12:00:00Z
,,0,event,0,2019-05-05T00:00:00Z
,,0,event,0,2019-05-05T12:00:00Z
,,0,event,2,2019-05-06T00:00:00Z
,,0,event,0,2019-05-06T12:00:00Z
,,0,event,10,2019-05-07T00:00:00Z
,,0,event,0,2019-05-07T06:00:00Z`,
    )

    const config: PlotConfig = {
      width: 600,
      height: 400,
      xColumn: '_time',
      yColumn: '_value',
    }

    const lineConfig: LineProps = {
    }

    return (
      <Plot table={table} config={config}>
        <Line {...lineConfig} />
      </Plot>
    )
  },
}

export const SnapshotLineLayerWithShadedAreaAndStepInterpolation: Story = {
  render: () => {
    const config: PlotConfig = {
      width: 600,
      height: 400,
      xColumn: '_time',
      yColumn: '_value',
    }

    const lineConfig: LineProps = {
      fill: ['cpu'],
      interpolation: 'step',
      shadeBelow: true,
    }

    return (
      <Plot table={CPU} config={config}>
        <Line {...lineConfig} />
      </Plot>
    )
  },
}

export const SnapshotTimeZoneSupport: Story = {
  render: () => {
    const config: PlotConfig = {
      width: 300,
      height: 200,
      xColumn: '_time',
      yColumn: '_value',
    }

    const lineConfig: LineProps = {
      fill: ['cpu'],
    }

    const timeZones = [
      undefined,
      'America/Los_Angeles',
      'America/New_York',
      'UTC',
    ]

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '230px 230px',
          gridTemplateColumns: '300px 300px',
          gridGap: '20px',
        }}
      >
        {timeZones.map((timeZone, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'gray',
              fontFamily: 'sans-serif',
            }}
          >
            <Plot
              table={CPU}
              config={{
                ...config,
                valueFormatters: {
                  _time: timeFormatter({timeZone, hour12: false}),
                },
              }}
            >
              <Line {...lineConfig} />
            </Plot>
            {timeZone || 'Local Time'}
          </div>
        ))}
      </div>
    )
  },
}

export const SnapshotBinaryPrefixFormatting: Story = {
  render: () => {
    const table = newTable(4)
      .addColumn('time', 'system', 'number', [0, 1, 2, 3])
      .addColumn(
        'bytes',
        'system',
        'number',
        [6799245312, 6475784192, 6419197952, 6307565568],
      )

    const config: PlotConfig = {
      width: 600,
      height: 400,
      xColumn: 'time',
      yColumn: 'bytes',
      valueFormatters: {
        bytes: binaryPrefixFormatter({significantDigits: 2, suffix: 'iB'}),
      },
    }

    const lineConfig: LineProps = {
    }

    return (
      <Plot table={table} config={config}>
        <Line {...lineConfig} />
      </Plot>
    )
  },
}

export const SnapshotWithFromRowsAdapter: Story = {
  render: () => {
    const table = fromRows([
      {x: 0.6637748924084008, y: 0},
      {x: 0.5484188553850314, y: 0.03450358980217672},
      {x: 0.5020185263552955, y: 0.06341968840289566},
      {x: 0.6472019204947352, y: 0.12346036922982045},
      {x: 0.5422740055349533, y: 0.13923229998318315},
      {x: 0.542361580132391, y: 0.17622395986501554},
      {x: 0.5172319678655009, y: 0.20478662312351467},
      {x: 0.5540400939258396, y: 0.26071147856098104},
      {x: 0.5490470439370002, y: 0.3018411666770542},
      {x: 0.5684781311835868, y: 0.36076719228093795},
      {x: 0.5066444671421548, y: 0.36809875195739017},
      {x: 0.48183612733450015, y: 0.3986095106998535},
      {x: 0.368753317696321, y: 0.3462824145444211},
      {x: 0.473555317706156, y: 0.5042851937677},
      {x: 0.4279284301086809, y: 0.5172766128381666},
      {x: 0.3589884886314056, y: 0.49410526540953786},
      {x: 0.319101275744127, y: 0.5028231523670745},
      {x: 0.25797378733955306, y: 0.4692525771461689},
      {x: 0.2619193247917344, y: 0.5566068978227308},
      {x: 0.2510536220102807, y: 0.6340890677894512},
      {x: 0.19812217061286364, y: 0.6097573428446372},
    ])

    const scatterConfig: ScatterProps = {}

    return (
      <div style={{width: 600, height: 400}}>
        <Plot table={table} config={{xColumn: 'x', yColumn: 'y'}}>
          <Scatter {...scatterConfig} />
        </Plot>
      </div>
    )
  },
}

export const SnapshotCustomYTicks: Story = {
  render: () => {
    const config: PlotConfig = {
      width: 600,
      height: 400,
      xColumn: '_time',
      yColumn: '_value',
      yTicks: [13, 19, 23],
    }

    const lineConfig: LineProps = {
      fill: ['cpu'],
    }

    return (
      <Plot table={CPU} config={config}>
        <Line {...lineConfig} />
      </Plot>
    )
  },
}

export const SnapshotSpecificHistogramBinSettingsShouldNotCrash: Story = {
  render: () => {
    const {table} = fromFlux(
      `#group,false,false,true,true,false,false,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string
#default,_result,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,host
,,0,2019-07-29T21:50:31.093428Z,2019-07-29T22:50:31.093428Z,2019-07-29T21:50:34Z,7246577664,available,mem,oox4k.local
,,0,2019-07-29T21:50:31.093428Z,2019-07-29T22:50:31.093428Z,2019-07-29T22:50:24Z,7176134656,available,mem,oox4k.local

#group,false,false,true,true,false,false,true,true,true
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string
#default,_result,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,host
,,1,2019-07-29T21:50:31.093428Z,2019-07-29T22:50:31.093428Z,2019-07-29T21:50:34Z,6581714944,active,mem,oox4k.local
,,1,2019-07-29T21:50:31.093428Z,2019-07-29T22:50:31.093428Z,2019-07-29T22:50:24Z,6296612864,active,mem,oox4k.local`,
    )

    const histogramProps: Omit<HistogramProps, 'table'> = {
      x: '_value',
      binCount: 30,
      xDomain: [5472854016, 7661821952],
    }

    /*
      Same as the scatter story above: <Histogram> sizes itself, and this story
      exists to be snapshotted, so the fixed 600x400 is a div rather than a
      <Plot> config this component no longer takes.
    */
    return (
      <div style={{width: 600, height: 400}}>
        <Histogram table={table} {...histogramProps} />
      </div>
    )
  },
}

export const StressTestLine: Story = {
  render: () => {
    const config: PlotConfig = {
      xColumn: 'x',
      yColumn: 'y',
    }

    const lineConfig: LineProps = {
      fill: ['tag'],
    }

    return (
      <StoryFrame>
        <Plot table={SIN} config={config}>
          <Line {...lineConfig} />
        </Plot>
      </StoryFrame>
    )
  },
}
