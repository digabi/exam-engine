import React from 'react'

export const ScreenReaderOnly: React.FunctionComponent = ({ children }) => {
  return <span className="e-screen-reader-only">{children}</span>
}
