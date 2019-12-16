import React from 'react'

/** Returns the display name of a React component. Useful when creating HOCs. */
export function getDisplayName(WrappedComponent: React.ComponentType<any>) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
