/*
  DapperScrollbars
  ------------------------------------------------------------------------------
  Re-implementation on top of native CSS scrolling. The previous version wrapped
  `react-scrollbars-custom`, which relies on `ReactDOM.findDOMNode`
  (via react-draggable) and crashes under React 19. Custom scrollbar visuals now
  come from `::-webkit-scrollbar` rules in DapperScrollbars.scss plus a
  `scrollbar-color` fallback for Firefox.

  NOTE: full visual parity with the old custom-rendered tracks/thumbs lands with
  the Storybook phase.
*/
// Libraries
import React, {
  CSSProperties,
  FunctionComponent,
  UIEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import classnames from 'classnames'

import {StandardFunctionProps} from '../../types'
import {ComponentSize} from '../../types'
import {InfluxColors} from '../../constants/colorSchemes'
import styles from './DapperScrollbars.scss'

import {styleReducer} from '../../utils/styleReducer'

// Types

/** Scroll geometry snapshot passed to `onScroll`. Replaces the ScrollState
 * object emitted by react-scrollbars-custom (same field names, plain object). */
interface DapperScrollValues {
  scrollTop: number
  scrollLeft: number
  scrollHeight: number
  scrollWidth: number
  clientHeight: number
  clientWidth: number
}

interface DapperScrollbarsProps extends StandardFunctionProps {
  /** No-op: kept for API compatibility. Native scrollbars disappear
   * automatically when there is nothing to scroll. */
  removeTracksWhenNotUsed?: boolean
  /** No-op: kept for API compatibility. See `removeTracksWhenNotUsed`. */
  removeTrackYWhenNotUsed?: boolean
  /** No-op: kept for API compatibility. See `removeTracksWhenNotUsed`. */
  removeTrackXWhenNotUsed?: boolean
  /** Disable scrolling horizontally */
  noScrollX?: boolean
  /** Disable scrolling vertically */
  noScrollY?: boolean
  /** Disable scrolling */
  noScroll?: boolean
  /** Gradient start color of the scrollbar thumb */
  thumbStartColor?: string | InfluxColors
  /** Gradient end color of the scrollbar thumb */
  thumbStopColor?: string | InfluxColors
  /** Hide scrollbar when not actively scrolling */
  autoHide?: boolean
  /** Scroll container will grow to fit the content width and height */
  autoSize?: boolean
  /** Scroll container will grow to fit the content width */
  autoSizeWidth?: boolean
  /** Scroll container will grow to fit the content height */
  autoSizeHeight?: boolean
  /** Vertical scroll position in pixels */
  scrollTop?: number
  /** Horizontal scroll position in pixels */
  scrollLeft?: number
  /** Function to be called when the native scroll event fires. Receives a
   * plain `{scrollTop, scrollLeft, ...}` snapshot — the old
   * react-scrollbars-custom ScrollState signature is gone, but the field names
   * are preserved so existing callbacks keep working. */
  onScroll?: Function
  /** Function called once after mount (kept for API compatibility; the old
   * per-update invocations relied on react-scrollbars-custom internals) */
  onUpdate?: Function
  /** Component Size **/
  size?: ComponentSize
}

export const DapperScrollbars: FunctionComponent<DapperScrollbarsProps> = ({
  id,
  style,
  children,
  className,
  onScroll,
  onUpdate,
  scrollTop = 0,
  scrollLeft = 0,
  autoHide = false,
  autoSize = false,
  noScroll = false,
  noScrollX = false,
  noScrollY = false,
  autoSizeWidth = false,
  autoSizeHeight = false,
  thumbStopColor = 'rgba(255, 255, 255, 0.25)',
  thumbStartColor = 'rgba(255, 255, 255, 0.25)',
  testID = 'dapper-scrollbars',
  size = ComponentSize.Small,
}) => {
  const scrollEl = useRef<HTMLDivElement>(null)
  // State is used here to ensure that the scroll position does not jump when
  // a component using DapperScrollbars re-renders
  const [scrollTopPos, setScrollTopPos] = useState<number>(Number(scrollTop))
  const [scrollLeftPos, setScrollLeftPos] = useState<number>(Number(scrollLeft))

  useEffect(() => {
    const el = scrollEl.current
    if (!el) {
      return
    }
    if (scrollTop >= 0 && el.scrollTop !== Number(scrollTop)) {
      el.scrollTop = Number(scrollTop)
    }
    setScrollTopPos(Number(scrollTop))
  }, [scrollTop])

  useEffect(() => {
    const el = scrollEl.current
    if (!el) {
      return
    }
    if (el.scrollLeft !== Number(scrollLeft)) {
      el.scrollLeft = Number(scrollLeft)
    }
    setScrollLeftPos(Number(scrollLeft))
  }, [scrollLeft])

  useEffect(() => {
    if (onUpdate) {
      onUpdate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let dapperScrollbarsClasses = classnames('cf-dapper-scrollbars', {
    'cf-dapper-scrollbars--autohide': autoHide,
    [`cf-dapper-scrollbars--${size}`]: size,
  })
    .split(' ')
    .reduce((accum, current) => styleReducer(styles, accum, current), '')

  dapperScrollbarsClasses =
    typeof className === 'string'
      ? `${dapperScrollbarsClasses} ${className}`
      : dapperScrollbarsClasses

  // Thumb gradient colors are handed to CSS via custom properties so that the
  // ::-webkit-scrollbar-thumb rules in DapperScrollbars.scss can pick them up
  const thumbVars = {
    '--cf-dapper-thumb-start': thumbStartColor,
    '--cf-dapper-thumb-stop': thumbStopColor,
  } as CSSProperties

  const handleOnScroll = (event: UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget
    setScrollTopPos(el.scrollTop)
    setScrollLeftPos(el.scrollLeft)

    if (onScroll) {
      const scrollValues: DapperScrollValues = {
        scrollTop: el.scrollTop,
        scrollLeft: el.scrollLeft,
        scrollHeight: el.scrollHeight,
        scrollWidth: el.scrollWidth,
        clientHeight: el.clientHeight,
        clientWidth: el.clientWidth,
      }
      const prevScrollValues: DapperScrollValues = {
        scrollTop: scrollTopPos,
        scrollLeft: scrollLeftPos,
        scrollHeight: el.scrollHeight,
        scrollWidth: el.scrollWidth,
        clientHeight: el.clientHeight,
        clientWidth: el.clientWidth,
      }
      onScroll(scrollValues, prevScrollValues)
    }
  }

  return (
    <div
      ref={scrollEl}
      data-testid={testID}
      id={id}
      className={dapperScrollbarsClasses}
      onScroll={handleOnScroll}
      style={{
        width: '100%',
        height: '100%',
        overflowX: noScroll || noScrollX ? 'hidden' : 'auto',
        overflowY: noScroll || noScrollY ? 'hidden' : 'auto',
        ...(style as CSSProperties),
        ...(autoSize || autoSizeWidth ? {width: 'auto'} : {}),
        ...(autoSize || autoSizeHeight ? {height: 'auto'} : {}),
        ...thumbVars,
        // Firefox fallback for the webkit thumb gradient
        ...({
          'scrollbar-color': `${thumbStartColor} transparent`,
        } as any as CSSProperties),
      }}
    >
      {children}
    </div>
  )
}

DapperScrollbars.displayName = 'GiraffeDapperScrollbars'
