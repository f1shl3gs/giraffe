import type {ArgTypes, Meta, StoryObj} from '@storybook/react'
import {Plot} from 'components/Plot'
import {
  COLOR_SCHEME_OPTIONS,
  findStringColumns,
  StoryFrame,
  TIME_FORMAT_OPTIONS,
} from 'stories/helpers'
import type {LineInterpolation} from 'types'
import {timeFormatter} from 'utils/formatters'
import {fromFlux} from 'utils/fromFlux'
import type {PlotConfig} from 'components/Plot/PlotConfig'
import type {BandProps} from 'components/Band'
import {Band} from 'components/Band'
import {
  colors6,
  cpu1,
  cpu2,
  graphEdge1,
  hoverAlignment1,
  hoverAlignment2,
  mem1,
  mem2,
  noLowerAndUpper,
  same3,
} from 'stories/data/bandFixtures'

/* --- storybook fixture (moved from bandLayer.ts) --- */

const now = Date.now()
const numberOfRecords = 40
const recordsPerLine = 20
const maxValue = 100

const TIME_COL = []
const VALUE_COL = []
const CPU_COL = []
const FIELD_COL = []
const MEASUREMENT_COL = []

const fieldName = 'usage_system'
const measurementName = 'cpu'

function getRandomNumber(max: number) {
  return Math.random() * Math.floor(max)
}
for (let i = 0; i < numberOfRecords; i += 1) {
  FIELD_COL.push(fieldName)
  MEASUREMENT_COL.push(measurementName)
  VALUE_COL.push(getRandomNumber(maxValue))
  CPU_COL.push(`cpu${Math.floor(i / recordsPerLine)}`)
  TIME_COL.push(now + (i % recordsPerLine) * 1000 * 60)
}

/* --- storybook fixtures (moved from bandCSV.ts) --- */

const hoverAlignment3 = `#group,false,false,true,true,false,false,false,false,false,true,false,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string,string,string,string,string
#default,min,,,,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,agg,env,interval,role,source
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T02:00:00Z,5,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T03:00:00Z,16,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T05:00:00Z,41,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T06:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T07:00:00Z,18,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T08:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T09:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T10:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T11:00:00Z,7,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T12:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T13:00:00Z,7,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T14:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T15:00:00Z,5,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T16:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T17:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T18:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T19:00:00Z,38,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T21:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T22:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Edg
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T23:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T00:00:00Z,28,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T01:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T03:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T04:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T05:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T06:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T07:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T08:00:00Z,9,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T09:00:00Z,5,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T10:00:00Z,78,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T11:00:00Z,98,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T12:00:00Z,29,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T13:00:00Z,19,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T14:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T15:00:00Z,164,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T16:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T17:00:00Z,34,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T18:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T19:00:00Z,14,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T20:00:00Z,42,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T21:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T22:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T23:00:00Z,16,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T00:00:00Z,6,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T01:00:00Z,101,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T02:00:00Z,42,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T04:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T05:00:00Z,131,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T06:00:00Z,28,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T07:00:00Z,7,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T08:00:00Z,7,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T09:00:00Z,14,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T10:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Raspbian Chromium
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T11:00:00Z,12,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T12:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T13:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T14:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T15:00:00Z,13,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T16:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Raspbian Chromium
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T17:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Raspbian Chromium
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T19:00:00Z,8,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T20:00:00Z,176,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T21:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T22:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T23:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T00:00:00Z,11,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T06:00:00Z,20,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T07:00:00Z,45,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T08:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T09:00:00Z,5,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T10:00:00Z,15,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T11:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T12:00:00Z,184,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T13:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T14:00:00Z,12,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T15:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T16:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T17:00:00Z,27,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T18:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T19:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T20:00:00Z,7,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T21:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T23:00:00Z,28,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Edg
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T01:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T02:00:00Z,11,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T05:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T07:00:00Z,253,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T08:00:00Z,79,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T09:00:00Z,90,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T10:00:00Z,80,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T11:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T12:00:00Z,170,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T13:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T14:00:00Z,17,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T15:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T16:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T17:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T18:00:00Z,30,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T19:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T20:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T21:00:00Z,21,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T22:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T23:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T00:00:00Z,11,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T03:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T10:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Raspbian Chromium
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T11:00:00Z,5,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T14:00:00Z,12,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T15:00:00Z,31,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T16:00:00Z,17,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T17:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T18:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T19:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T20:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T21:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T22:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T23:00:00Z,16,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Samsung Browser
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T00:00:00Z,7,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T02:00:00Z,105,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T03:00:00Z,73,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T04:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T05:00:00Z,63,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T06:00:00Z,10,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T07:00:00Z,19,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T08:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T09:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T10:00:00Z,19,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T11:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T12:00:00Z,15,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T13:00:00Z,53,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Grafana
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T14:00:00Z,23,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T15:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T16:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Edg
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T17:00:00Z,5,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T18:00:00Z,6,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Firefox
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T19:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T20:00:00Z,18,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T21:00:00Z,11,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T22:00:00Z,6,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Safari
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T23:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Chrome
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-10T00:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T02:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Edg
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T03:00:00Z,24,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T05:00:00Z,10,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T06:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Edg
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T07:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T08:00:00Z,24,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Raspbian Chromium
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T09:00:00Z,23,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T10:00:00Z,24,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Raspbian Chromium
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T11:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Edg
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T12:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T13:00:00Z,24,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T14:00:00Z,14,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T15:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T16:00:00Z,10,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T17:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T18:00:00Z,28,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Raspbian Chromium
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T19:00:00Z,10,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Edg
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T20:00:00Z,28,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Raspbian Chromium
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T21:00:00Z,13,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T22:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T23:00:00Z,18,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T00:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T01:00:00Z,23,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T02:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T03:00:00Z,17,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T04:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T05:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T06:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T08:00:00Z,11,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T09:00:00Z,34,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T11:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T14:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T15:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T17:00:00Z,112,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T18:00:00Z,43,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T19:00:00Z,44,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T20:00:00Z,15,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T21:00:00Z,96,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T22:00:00Z,9,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T00:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T02:00:00Z,7,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T03:00:00Z,1,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T04:00:00Z,153,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T05:00:00Z,618,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T06:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T07:00:00Z,24,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T08:00:00Z,29,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T13:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T14:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T15:00:00Z,85,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T16:00:00Z,14,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T17:00:00Z,455,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T19:00:00Z,22,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T20:00:00Z,15,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T21:00:00Z,8,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T22:00:00Z,12,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T23:00:00Z,7,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T01:00:00Z,1,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T02:00:00Z,1,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T03:00:00Z,8,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T05:00:00Z,12,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T06:00:00Z,21,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T07:00:00Z,48,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T08:00:00Z,12,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T09:00:00Z,73,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T10:00:00Z,30,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T12:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T14:00:00Z,114,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T15:00:00Z,41,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T16:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T18:00:00Z,46,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T20:00:00Z,20,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T01:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T02:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T11:00:00Z,76,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T12:00:00Z,136,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T13:00:00Z,49,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T03:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T06:00:00Z,13,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Edg
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T07:00:00Z,8,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T14:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T15:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T19:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T21:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T22:00:00Z,16,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T01:00:00Z,86,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T04:00:00Z,14,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T05:00:00Z,5,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T06:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T09:00:00Z,30,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T10:00:00Z,22,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T11:00:00Z,8,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T12:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T16:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T17:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T18:00:00Z,7,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T20:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T21:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T22:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T23:00:00Z,12,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Chrome
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-10T00:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,Firefox

#group,false,false,true,true,false,false,false,false,false,true,false,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string,string,string,string,string
#default,max,,,,,,,,,,,,
,result,table,_start,_stop,_time,_value,_field,_measurement,agg,env,interval,role,source
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T02:00:00Z,5,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T03:00:00Z,16,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T05:00:00Z,41,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T06:00:00Z,127,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T07:00:00Z,40,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T08:00:00Z,58,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T09:00:00Z,106,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T10:00:00Z,159,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T11:00:00Z,131,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T12:00:00Z,222,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T13:00:00Z,208,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T14:00:00Z,41,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T15:00:00Z,197,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T16:00:00Z,106,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T17:00:00Z,29,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T18:00:00Z,189,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T19:00:00Z,38,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T21:00:00Z,86,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T22:00:00Z,10,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T23:00:00Z,6,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T00:00:00Z,28,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T01:00:00Z,193,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T03:00:00Z,45,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T04:00:00Z,104,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T05:00:00Z,63,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T06:00:00Z,28,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T07:00:00Z,7,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T08:00:00Z,105,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T09:00:00Z,65,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T10:00:00Z,247,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T11:00:00Z,336,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T12:00:00Z,60,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T13:00:00Z,392,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T14:00:00Z,182,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T15:00:00Z,611,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T16:00:00Z,54,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T17:00:00Z,144,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T18:00:00Z,42,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T19:00:00Z,107,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T20:00:00Z,246,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T21:00:00Z,71,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T22:00:00Z,54,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T23:00:00Z,41,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T00:00:00Z,6,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T01:00:00Z,101,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T02:00:00Z,42,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T04:00:00Z,3,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T05:00:00Z,131,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T06:00:00Z,28,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T07:00:00Z,73,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T08:00:00Z,24,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T09:00:00Z,149,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T10:00:00Z,86,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T11:00:00Z,126,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T12:00:00Z,603,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Grafana
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T13:00:00Z,343,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Grafana
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T14:00:00Z,95,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T15:00:00Z,105,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T16:00:00Z,70,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T17:00:00Z,35,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T19:00:00Z,30,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T20:00:00Z,176,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T21:00:00Z,61,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T22:00:00Z,18,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T23:00:00Z,46,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T00:00:00Z,11,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T06:00:00Z,20,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T07:00:00Z,45,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T08:00:00Z,77,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T09:00:00Z,78,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T10:00:00Z,361,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T11:00:00Z,213,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T12:00:00Z,184,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T13:00:00Z,254,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T14:00:00Z,244,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T15:00:00Z,221,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T16:00:00Z,255,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T17:00:00Z,149,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T18:00:00Z,61,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T19:00:00Z,56,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T20:00:00Z,55,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T21:00:00Z,5,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T23:00:00Z,74,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T01:00:00Z,10,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T02:00:00Z,11,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T05:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T07:00:00Z,253,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T08:00:00Z,79,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T09:00:00Z,90,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T10:00:00Z,80,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T11:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T12:00:00Z,170,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T13:00:00Z,67,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T14:00:00Z,246,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T15:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T16:00:00Z,38,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T17:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T18:00:00Z,30,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T19:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T20:00:00Z,8,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T21:00:00Z,21,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T22:00:00Z,47,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T23:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T00:00:00Z,38,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T03:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T10:00:00Z,7,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T11:00:00Z,5,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T14:00:00Z,30,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T15:00:00Z,31,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T16:00:00Z,17,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T17:00:00Z,10,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T18:00:00Z,17,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T19:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T20:00:00Z,2,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T21:00:00Z,41,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T22:00:00Z,43,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T23:00:00Z,100,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T00:00:00Z,86,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T02:00:00Z,105,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T03:00:00Z,73,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T04:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T05:00:00Z,63,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T06:00:00Z,10,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T07:00:00Z,19,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T08:00:00Z,321,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T09:00:00Z,153,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T10:00:00Z,241,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T11:00:00Z,484,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T12:00:00Z,783,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Grafana
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T13:00:00Z,197,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T14:00:00Z,177,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Grafana
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T15:00:00Z,383,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T16:00:00Z,71,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T17:00:00Z,58,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T18:00:00Z,106,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Grafana
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T19:00:00Z,53,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,Grafana
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T20:00:00Z,89,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T21:00:00Z,11,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T22:00:00Z,15,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T23:00:00Z,4,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-10T00:00:00Z,1,totalDuration,query_log,count,prod01-eu-west-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T02:00:00Z,26,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T03:00:00Z,24,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T05:00:00Z,34,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T06:00:00Z,39,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T07:00:00Z,26,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T08:00:00Z,100,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T09:00:00Z,47,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T10:00:00Z,75,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T11:00:00Z,38,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T12:00:00Z,26,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T13:00:00Z,24,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T14:00:00Z,38,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T15:00:00Z,26,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T16:00:00Z,38,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T17:00:00Z,38,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T18:00:00Z,132,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T19:00:00Z,59,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T20:00:00Z,141,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T21:00:00Z,31,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T22:00:00Z,60,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-03T23:00:00Z,55,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T00:00:00Z,20,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T01:00:00Z,23,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T02:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T03:00:00Z,35,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T04:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T05:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T06:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T08:00:00Z,11,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T09:00:00Z,34,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T11:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T14:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T15:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T17:00:00Z,112,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T18:00:00Z,43,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T19:00:00Z,44,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T20:00:00Z,66,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T21:00:00Z,96,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-04T22:00:00Z,9,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T00:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T02:00:00Z,7,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T03:00:00Z,1,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T04:00:00Z,153,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T05:00:00Z,618,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T06:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T07:00:00Z,24,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T08:00:00Z,80,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T13:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T14:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T15:00:00Z,85,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T16:00:00Z,28,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T17:00:00Z,455,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T19:00:00Z,22,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T20:00:00Z,36,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T21:00:00Z,36,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T22:00:00Z,12,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-05T23:00:00Z,7,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T01:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T02:00:00Z,1,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T03:00:00Z,8,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T05:00:00Z,12,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T06:00:00Z,21,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T07:00:00Z,48,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T08:00:00Z,12,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T09:00:00Z,73,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T10:00:00Z,30,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T12:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T14:00:00Z,114,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T15:00:00Z,41,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T16:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T18:00:00Z,46,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-06T20:00:00Z,20,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T01:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T02:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T11:00:00Z,76,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T12:00:00Z,136,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-07T13:00:00Z,49,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T03:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T06:00:00Z,84,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T07:00:00Z,8,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T14:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T15:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T19:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T21:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-08T22:00:00Z,16,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T01:00:00Z,86,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T04:00:00Z,14,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T05:00:00Z,13,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T06:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T09:00:00Z,30,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T10:00:00Z,22,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T11:00:00Z,26,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T12:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T16:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T17:00:00Z,6,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T18:00:00Z,49,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T20:00:00Z,2,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T21:00:00Z,4,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T22:00:00Z,43,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-09T23:00:00Z,24,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-10T00:00:00Z,130,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,53,totalDuration,query_log,count,prod01-us-east-1,1h,queryd-v1,All Browsers

#group,false,false,true,true,true,false,false
#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,string,double,dateTime:RFC3339
#default,mean,,,,,,
,result,table,_start,_stop,env,_value,_time
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,5,2020-11-03T02:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,16,2020-11-03T03:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,41,2020-11-03T05:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,84.66666666666667,2020-11-03T06:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,26.666666666666668,2020-11-03T07:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,29,2020-11-03T08:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,42.4,2020-11-03T09:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,63.6,2020-11-03T10:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,57.8,2020-11-03T11:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,74,2020-11-03T12:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,104,2020-11-03T13:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,27.333333333333332,2020-11-03T14:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,98.5,2020-11-03T15:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,42.4,2020-11-03T16:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,14.5,2020-11-03T17:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,94.5,2020-11-03T18:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,38,2020-11-03T19:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,43,2020-11-03T21:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,5,2020-11-03T22:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,4,2020-11-03T23:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,28,2020-11-04T00:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,96.5,2020-11-04T01:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,30,2020-11-04T03:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,69.33333333333333,2020-11-04T04:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,42,2020-11-04T05:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,18.666666666666668,2020-11-04T06:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,4.666666666666667,2020-11-04T07:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,70,2020-11-04T08:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,32.5,2020-11-04T09:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,164.66666666666666,2020-11-04T10:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,224,2020-11-04T11:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,40,2020-11-04T12:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,196,2020-11-04T13:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,91,2020-11-04T14:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,407.3333333333333,2020-11-04T15:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,36,2020-11-04T16:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,72,2020-11-04T17:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,28,2020-11-04T18:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,71.33333333333333,2020-11-04T19:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,164,2020-11-04T20:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,47.333333333333336,2020-11-04T21:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,27,2020-11-04T22:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,27.333333333333332,2020-11-04T23:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,6,2020-11-05T00:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,101,2020-11-05T01:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,42,2020-11-05T02:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,3,2020-11-05T04:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,131,2020-11-05T05:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,28,2020-11-05T06:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,48.666666666666664,2020-11-05T07:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,16,2020-11-05T08:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,59.6,2020-11-05T09:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,43,2020-11-05T10:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,63,2020-11-05T11:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,319,2020-11-05T12:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,123.25,2020-11-05T13:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,38,2020-11-05T14:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,52.5,2020-11-05T15:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,35,2020-11-05T16:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,17.5,2020-11-05T17:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,20,2020-11-05T19:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,176,2020-11-05T20:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,40.666666666666664,2020-11-05T21:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,9,2020-11-05T22:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,23,2020-11-05T23:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,11,2020-11-06T00:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,20,2020-11-06T06:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,45,2020-11-06T07:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,38.5,2020-11-06T08:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,31.2,2020-11-06T09:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,180.5,2020-11-06T10:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,106.5,2020-11-06T11:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,184,2020-11-06T12:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,127,2020-11-06T13:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,122,2020-11-06T14:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,110.5,2020-11-06T15:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,102,2020-11-06T16:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,74.5,2020-11-06T17:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,40.666666666666664,2020-11-06T18:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,37.333333333333336,2020-11-06T19:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,36.666666666666664,2020-11-06T20:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,3.3333333333333335,2020-11-06T21:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,49.333333333333336,2020-11-06T23:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,6.666666666666667,2020-11-07T01:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,11,2020-11-07T02:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,1,2020-11-07T05:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,253,2020-11-07T07:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,79,2020-11-07T08:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,90,2020-11-07T09:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,80,2020-11-07T10:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,4,2020-11-07T11:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,170,2020-11-07T12:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,44.666666666666664,2020-11-07T13:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,164,2020-11-07T14:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,2,2020-11-07T15:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,25.333333333333332,2020-11-07T16:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,2,2020-11-07T17:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,30,2020-11-07T18:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,4,2020-11-07T19:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,5.333333333333333,2020-11-07T20:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,21,2020-11-07T21:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,31.333333333333332,2020-11-07T22:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,4,2020-11-07T23:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,25.333333333333332,2020-11-08T00:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,2,2020-11-08T03:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,4.666666666666667,2020-11-08T10:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,5,2020-11-08T11:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,20,2020-11-08T14:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,31,2020-11-08T15:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,17,2020-11-08T16:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,6.666666666666667,2020-11-08T17:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,11.333333333333334,2020-11-08T18:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,2,2020-11-08T19:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,2,2020-11-08T20:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,27.333333333333332,2020-11-08T21:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,28.666666666666668,2020-11-08T22:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,50,2020-11-08T23:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,57.333333333333336,2020-11-09T00:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,105,2020-11-09T02:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,73,2020-11-09T03:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,1,2020-11-09T04:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,63,2020-11-09T05:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,10,2020-11-09T06:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,19,2020-11-09T07:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,214,2020-11-09T08:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,61.2,2020-11-09T09:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,96.4,2020-11-09T10:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,193.6,2020-11-09T11:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,196.16666666666666,2020-11-09T12:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,111.75,2020-11-09T13:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,71.75,2020-11-09T14:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,153.2,2020-11-09T15:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,35.5,2020-11-09T16:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,29,2020-11-09T17:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,60.8,2020-11-09T18:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,19.666666666666668,2020-11-09T19:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,59.333333333333336,2020-11-09T20:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,11,2020-11-09T21:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,10,2020-11-09T22:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,2.6666666666666665,2020-11-09T23:00:00Z
,,0,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-eu-west-1,1,2020-11-10T00:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,17.333333333333332,2020-11-03T02:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,24,2020-11-03T03:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,22.666666666666668,2020-11-03T05:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,19.5,2020-11-03T06:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,17.333333333333332,2020-11-03T07:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,66.66666666666667,2020-11-03T08:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,31.333333333333332,2020-11-03T09:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,50,2020-11-03T10:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,19,2020-11-03T11:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,17.333333333333332,2020-11-03T12:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,24,2020-11-03T13:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,25.333333333333332,2020-11-03T14:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,17.333333333333332,2020-11-03T15:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,25.333333333333332,2020-11-03T16:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,19,2020-11-03T17:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,88,2020-11-03T18:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,29.5,2020-11-03T19:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,70.5,2020-11-03T20:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,20.666666666666668,2020-11-03T21:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,40,2020-11-03T22:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,36.666666666666664,2020-11-03T23:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,13.333333333333334,2020-11-04T00:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,23,2020-11-04T01:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-04T02:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,23.333333333333332,2020-11-04T03:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-04T04:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2.6666666666666665,2020-11-04T05:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-04T06:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,11,2020-11-04T08:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,34,2020-11-04T09:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-04T11:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,4,2020-11-04T14:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,6,2020-11-04T15:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,112,2020-11-04T17:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,43,2020-11-04T18:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,44,2020-11-04T19:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,44,2020-11-04T20:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,96,2020-11-04T21:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,9,2020-11-04T22:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-05T00:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,7,2020-11-05T02:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,1,2020-11-05T03:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,153,2020-11-05T04:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,618,2020-11-05T05:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2.6666666666666665,2020-11-05T06:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,24,2020-11-05T07:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,53.333333333333336,2020-11-05T08:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-05T13:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-05T14:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,85,2020-11-05T15:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,18.666666666666668,2020-11-05T16:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,455,2020-11-05T17:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,22,2020-11-05T19:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,24,2020-11-05T20:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,24,2020-11-05T21:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,12,2020-11-05T22:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,7,2020-11-05T23:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2.6666666666666665,2020-11-06T01:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,1,2020-11-06T02:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,8,2020-11-06T03:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,12,2020-11-06T05:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,21,2020-11-06T06:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,48,2020-11-06T07:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,12,2020-11-06T08:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,73,2020-11-06T09:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,30,2020-11-06T10:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-06T12:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,114,2020-11-06T14:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,41,2020-11-06T15:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-06T16:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,46,2020-11-06T18:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,20,2020-11-06T20:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-07T01:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,4,2020-11-07T02:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,76,2020-11-07T11:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,136,2020-11-07T12:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,49,2020-11-07T13:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,6,2020-11-08T03:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,56,2020-11-08T06:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,8,2020-11-08T07:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-08T14:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,4,2020-11-08T15:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,6,2020-11-08T19:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-08T21:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,16,2020-11-08T22:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,86,2020-11-09T01:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,14,2020-11-09T04:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,8.666666666666666,2020-11-09T05:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-09T06:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,30,2020-11-09T09:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,22,2020-11-09T10:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,17.333333333333332,2020-11-09T11:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,6,2020-11-09T12:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,6,2020-11-09T16:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,6,2020-11-09T17:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,32.666666666666664,2020-11-09T18:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,2,2020-11-09T20:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,4,2020-11-09T21:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,28.666666666666668,2020-11-09T22:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,16,2020-11-09T23:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,86.66666666666667,2020-11-10T00:00:00Z
,,1,2020-11-03T00:23:45.428067991Z,2020-11-10T00:23:45.428067991Z,prod01-us-east-1,35.333333333333336,2020-11-10T00:23:45.428067991Z
`

interface BandArgs {
  colorScheme: keyof typeof COLOR_SCHEME_OPTIONS
  legendFont: string
  tickFont: string
  valueAxisLabel: string
  xScale: string
  yScale: string
  timeZone: string
  timeFormat: string
  interpolation: LineInterpolation
  showAxes: boolean
  lineWidth: number
  lineOpacity: number
  shadeOpacity: number
  hoverDimension: 'auto' | 'x' | 'y' | 'xy'
  upperColumnName: string
  mainColumnName: string
  lowerColumnName: string
  legendOpacity: number
  legendOrientationThreshold: number
  legendColorizeRows: boolean
  yTickStart: number
  yTickStep: number
  xTotalTicks: number
  staticData: string
  csv: string
}

export default {
  title: 'Band Chart',
} as Meta

type Story = StoryObj<BandArgs>

const INTERPOLATION_OPTIONS = [
  'linear',
  'monotoneX',
  'monotoneY',
  'cubic',
  'step',
  'stepBefore',
  'stepAfter',
  'natural',
]

const commonArgTypes: Partial<ArgTypes<BandArgs>> = {
  colorScheme: {
    control: {
      type: 'select'
    },
    options: Object.keys(COLOR_SCHEME_OPTIONS),
  },
  xScale: {control: {type: 'select'}, options: ['linear', 'log']},
  yScale: {control: {type: 'select'}, options: ['linear', 'log']},
  timeZone: {
    control: {type: 'select'},
    options: ['UTC', 'America/Los_Angeles', 'America/New_York'],
  },
  timeFormat: {
    control: {type: 'select'},
    options: [...TIME_FORMAT_OPTIONS],
  },
  interpolation: {control: {type: 'select'}, options: INTERPOLATION_OPTIONS},
  showAxes: {control: {type: 'boolean'}},
  hoverDimension: {
    control: {type: 'select'},
    options: ['auto', 'x', 'y', 'xy'],
  },
  lineWidth: {control: {type: 'number'}},
  lineOpacity: {control: {type: 'number'}},
  shadeOpacity: {control: {type: 'number'}},
  legendOpacity: {
    control: {type: 'range', min: 0, max: 1.0, step: 0.05},
  },
  legendOrientationThreshold: {control: {type: 'number'}},
  legendColorizeRows: {control: {type: 'boolean'}},
}

const commonArgs: Partial<BandArgs> = {
  colorScheme: 'Nineteen Eighty Four',
  legendFont: '12px sans-serif',
  tickFont: '10px sans-serif',
  valueAxisLabel: '',
  xScale: 'linear',
  yScale: 'linear',
  timeZone: 'UTC',
  interpolation: 'monotoneX',
  showAxes: true,
  lineWidth: 3,
  lineOpacity: 0.7,
  shadeOpacity: 0.3,
  hoverDimension: 'auto',
  legendOpacity: 1.0,
  legendOrientationThreshold: 15,
  legendColorizeRows: true,
}

const render = (args: BandArgs) => {
  const {
    colorScheme,
    legendFont,
    tickFont,
    valueAxisLabel,
    xScale,
    yScale,
    timeZone,
    timeFormat,
    interpolation,
    showAxes,
    lineWidth,
    lineOpacity,
    shadeOpacity,
    hoverDimension,
    upperColumnName,
    mainColumnName,
    lowerColumnName,
    legendOpacity,
    legendOrientationThreshold,
    legendColorizeRows,
    yTickStart,
    yTickStep,
    xTotalTicks,
  } = args

  const {table} = fromFlux(hoverAlignment3)

  const bandConfig: BandProps = {
    fill: ['result', 'env'],
    interpolation,
    colors: COLOR_SCHEME_OPTIONS[colorScheme],
    lineWidth,
    lineOpacity,
    hoverDimension,
    shadeOpacity,
    upperColumnName,
    mainColumnName,
    lowerColumnName,
  }

  const config: PlotConfig = {
    xColumn: '_time',
    yColumn: '_value',
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val =>
        typeof val === 'number'
          ? `${val.toFixed(2)}${
              valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
            }`
          : val,
    },
    xScale,
    yScale,
    tickFont,
    showAxes,
    legend: {
      font: legendFont,
      opacity: legendOpacity,
      orientationThreshold: legendOrientationThreshold,
      colorizeRows: legendColorizeRows,
    },
    xTotalTicks,
    yTickStart,
    yTickStep,
  }

  return (
    <StoryFrame>
      <Plot table={table} config={config}>
        <Band {...bandConfig} />
      </Plot>
    </StoryFrame>
  )
}

export const StaticGroupByApplied: Story = {
  render,
  args: {
    ...commonArgs,
    timeFormat: 'hh:mm a',
    upperColumnName: 'max',
    mainColumnName: 'mean',
    lowerColumnName: 'min',
    yTickStart: 0,
    yTickStep: 100,
    xTotalTicks: 20,
  },
  argTypes: {
    ...commonArgTypes,
    yTickStart: {control: {type: 'number'}},
    yTickStep: {control: {type: 'number'}},
    xTotalTicks: {control: {type: 'number'}},
  },
}

const renderAllStringColumns = (args: BandArgs) => {
  const {
    staticData,
    colorScheme,
    legendFont,
    tickFont,
    valueAxisLabel,
    xScale,
    yScale,
    timeZone,
    timeFormat,
    interpolation,
    showAxes,
    lineWidth,
    lineOpacity,
    shadeOpacity,
    hoverDimension,
    upperColumnName,
    mainColumnName,
    lowerColumnName,
    legendOpacity,
    legendOrientationThreshold,
    legendColorizeRows,
    xTotalTicks,
  } = args

  const table = fromFlux(staticData).table

  const bandConfig: BandProps = {
    fill: findStringColumns(table),
    interpolation,
    colors: COLOR_SCHEME_OPTIONS[colorScheme],
    lineWidth,
    lineOpacity,
    hoverDimension,
    shadeOpacity,
    upperColumnName,
    mainColumnName,
    lowerColumnName,
  }

  const config: PlotConfig = {
    xColumn: '_time',
    yColumn: '_value',
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val =>
        typeof val === 'number'
          ? `${val.toFixed(2)}${
              valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
            }`
          : val,
    },
    xScale,
    yScale,
    tickFont,
    showAxes,
    legend: {
      font: legendFont,
      opacity: legendOpacity,
      orientationThreshold: legendOrientationThreshold,
      colorizeRows: legendColorizeRows,
    },
    xTotalTicks,
  }

  return (
    <StoryFrame>
      <Plot table={table} config={config}>
        <Band {...bandConfig} />
      </Plot>
    </StoryFrame>
  )
}

export const StaticAllStringColumns: Story = {
  render: renderAllStringColumns,
  args: {
    ...commonArgs,
    staticData: cpu2,
    timeFormat: 'hh:mm a',
    upperColumnName: 'max',
    mainColumnName: 'mean',
    lowerColumnName: 'min',
    xTotalTicks: 20,
  },
  argTypes: {
    ...commonArgTypes,
    staticData: {
      control: {type: 'select'},
      options: [
        colors6,
        cpu1,
        cpu2,
        graphEdge1,
        hoverAlignment1,
        hoverAlignment2,
        mem1,
        mem2,
        noLowerAndUpper,
        same3,
      ],
    },
    xTotalTicks: {control: {type: 'number'}},
  },
}

const renderCustomCSV = (args: BandArgs) => {
  const {
    csv,
    colorScheme,
    legendFont,
    tickFont,
    valueAxisLabel,
    xScale,
    yScale,
    timeZone,
    timeFormat,
    interpolation,
    showAxes,
    lineWidth,
    lineOpacity,
    shadeOpacity,
    hoverDimension,
    upperColumnName,
    mainColumnName,
    lowerColumnName,
    legendOpacity,
    legendOrientationThreshold,
    legendColorizeRows,
  } = args

  const table = fromFlux(csv).table

  const bandConfig: BandProps = {
    fill: findStringColumns(table),
    interpolation,
    colors: COLOR_SCHEME_OPTIONS[colorScheme],
    lineWidth,
    lineOpacity,
    hoverDimension,
    shadeOpacity,
    upperColumnName,
    mainColumnName,
    lowerColumnName,
  }

  const config: PlotConfig = {
    xColumn: '_time',
    yColumn: '_value',
    valueFormatters: {
      _time: timeFormatter({timeZone, format: timeFormat}),
      _value: val =>
        typeof val === 'number'
          ? `${val.toFixed(2)}${
              valueAxisLabel ? ` ${valueAxisLabel}` : valueAxisLabel
            }`
          : val,
    },
    xScale,
    yScale,
    tickFont,
    showAxes,
    legend: {
      font: legendFont,
      opacity: legendOpacity,
      orientationThreshold: legendOrientationThreshold,
      colorizeRows: legendColorizeRows,
    },
  }

  return (
    <StoryFrame>
      <Plot table={table} config={config}>
        <Band {...bandConfig} />
      </Plot>
    </StoryFrame>
  )
}

export const CustomCSV: Story = {
  render: renderCustomCSV,
  args: {
    ...commonArgs,
    csv: '',
    timeFormat: 'YYYY-MM-DD HH:mm:ss ZZ',
    upperColumnName: '',
    mainColumnName: '',
    lowerColumnName: '',
  },
  argTypes: commonArgTypes,
}
