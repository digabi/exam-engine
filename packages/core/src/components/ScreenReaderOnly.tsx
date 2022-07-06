import React from 'react'

export const ScreenReaderOnly: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  return <span className="e-screen-reader-only">{children}</span>
}
