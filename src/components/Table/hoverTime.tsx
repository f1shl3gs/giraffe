import React, {
  createContext,
  FunctionComponent,
  ReactElement,
  useContext,
  useState,
} from 'react'

interface Props {
  children: ReactElement
}

export interface InjectedHoverProps {
  hoverTime: number | null
  setHoverTime: (hoverTime: number | null) => void
}

const InjectedHoverContext = createContext<InjectedHoverProps>(null)

export const HoverTimeProvider: FunctionComponent<Props> = (props: Props) => {
  const [hoverTime, setHoverTime] = useState(null)
  const [hoverTimeState] = useState({
    hoverTime,
    setHoverTime: (ht: number | null) => setHoverTime(ht),
  })
  return (
    <InjectedHoverContext value={hoverTimeState}>
      {props.children}
    </InjectedHoverContext>
  )
}

export const withHoverTime1 =
  <P extends {}>(Component: React.ComponentType<P & InjectedHoverProps>) =>
  (props: P) => {
    return (
      <InjectedHoverContext.Consumer>
        {hoverTimeProps => <Component {...props} {...hoverTimeProps} />}
      </InjectedHoverContext.Consumer>
    )
  }

export const useHoverTime = () => useContext(InjectedHoverContext)
