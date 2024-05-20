import { createContext } from 'react'

type TOCContextType = {
  visibleTOCElements: string[]
  isInSidebar: boolean
  addRef: (object: HTMLDivElement) => void
}

export const TOCContext = createContext({} as TOCContextType)
