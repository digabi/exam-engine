import React from 'react'

export type AnnotationContextType = {
  annotationsEnabled: boolean
}

export const AnnotationContext = React.createContext<boolean>(false)

// eslint-disable-next-line prefer-arrow-callback
export const AnnotationProvider = React.memo(function AnnotationProvider({
  children,
  annotationsEnabled
}: React.PropsWithChildren<Partial<AnnotationContextType>>) {
  return <AnnotationContext.Provider value={annotationsEnabled ?? false}>{children}</AnnotationContext.Provider>
})
