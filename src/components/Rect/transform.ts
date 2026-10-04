import type {ColumnGroupMap, ColumnType, Scale, Table} from 'types'

/*
  Rect is not a component and not a <Plot> layer: it is the internal building
  block that <Heatmap> and <Histogram> are both made of. This is the shape their
  two transforms produce -- binned rectangles, either one- or two-dimensional --
  and the shape src/utils/drawRects knows how to paint.

  There is deliberately no `type` discriminator here (or on any other spec in
  this repo): <Heatmap> and <Histogram> are the two types, and they are
  distinguished at the call site, not by a tag inside the data.

  `binDimension` is the one structural difference between them, and it is a
  property of the binning, not of the caller's config: heatmap bins on both
  axes ('xy'), histogram bins on x and stacks counts on y ('x').
*/
export interface RectSpec {
  inputTable: Table
  table: Table // has `X_MIN`, `X_MAX`, `Y_MIN`, `Y_MAX`, and `COUNT` columns, and maybe a `FILL` column
  binDimension: 'xy' | 'x'
  xDomain: number[]
  yDomain: number[]
  xColumnKey: string
  yColumnKey: string
  xColumnType: ColumnType
  yColumnType: ColumnType
  scales: {fill: Scale<number, string>}
  columnGroupMaps: {fill?: ColumnGroupMap}
}
