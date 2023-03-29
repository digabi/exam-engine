import React from 'react'

export const ScreenReaderOnly: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => (
  <span className="e-screen-reader-only">{children}</span>
)
