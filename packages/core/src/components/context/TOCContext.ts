import { createContext } from 'react'

export const TOCContext = createContext({
  visibleTOCElements: [] as string[],
  isInSidebar: false
})
