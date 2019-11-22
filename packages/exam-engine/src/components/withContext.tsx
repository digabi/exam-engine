import React from 'react'
import { getDisplayName } from '../getDisplayName'

export const withContext = <T, P>(Context: React.Context<T>, parse: (p: P) => T) => (
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  const Wrapped = (props: P) => {
    const ctx = parse(props)
    return (
      <Context.Provider value={ctx}>
        <Component {...props} />
      </Context.Provider>
    )
  }
  Wrapped.displayName = 'WithContext(' + getDisplayName(Component) + ')'
  return Wrapped
}
