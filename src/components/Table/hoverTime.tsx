import {
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

export const HoverTimeProvider: FunctionComponent<Props> = ({children}) => {
  const [hoverTime, setHoverTime] = useState(null)
  const [hoverTimeState] = useState({
    hoverTime,
    setHoverTime: (ht: number | null) => setHoverTime(ht),
  })

  return (
    <InjectedHoverContext value={hoverTimeState}>
      {children}
    </InjectedHoverContext>
  )
}

export const useHoverTime = () => useContext(InjectedHoverContext)
