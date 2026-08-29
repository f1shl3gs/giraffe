import React, {FC, useEffect, useRef, useState} from 'react'

export interface Size {
  height: number
  width: number
}

interface Props {
  children: (size: Size) => React.ReactNode
  className?: string
}

export const AutoSizer: FC<Props> = ({children, className}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size | null>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) {
      return undefined
    }

    let frame = 0
    const observer = new ResizeObserver(entries => {
      const {width, height} = entries[0].contentRect
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setSize(prev =>
          prev && prev.width === width && prev.height === height
            ? prev
            : {height, width}
        )
      })
    })

    observer.observe(wrapper)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      className={className}
      ref={wrapperRef}
      style={{height: '100%', width: '100%'}}
    >
      {size ? children(size) : null}
    </div>
  )
}
