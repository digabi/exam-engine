import { createContext } from 'react'

type TOCContextType = {
  visibleTOCElements: string[]
  addRef: (object: HTMLDivElement) => void
}

export const TOCContext = createContext({} as TOCContextType)
