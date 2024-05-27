import { createContext } from 'react'

type IsInSidebarContextType = {
  isInSidebar: boolean
}

export const IsInSidebarContext = createContext({} as IsInSidebarContextType)
