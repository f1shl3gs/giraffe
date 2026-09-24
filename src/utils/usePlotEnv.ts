import {useRef, useState} from 'react'

import {SizedConfig} from 'types'
import {PlotEnv} from './PlotEnv'
import {useMountedEffect} from './useMountedEffect'

/*
  Get a `PlotEnv` for a plot.
  
  The `PlotEnv` will be instantiated if it doesn't already exist. If the passed
  `config` changes, it will be set on the `PlotEnv` and the component will
  rerender.
*/
export const usePlotEnv = (config: SizedConfig): PlotEnv => {
  const envRef = useRef<PlotEnv>(null)

  if (envRef.current === null) {
    envRef.current = new PlotEnv()
    envRef.current.config = config
  }

  const [envRevision, setEnvRevision] = useState(0)

  useMountedEffect(() => {
    if (envRef.current) {
      envRef.current.config = config
    }

    setEnvRevision(envRevision + 1)
  }, [config])

  return envRef.current
}
