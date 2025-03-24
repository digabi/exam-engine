import React from 'react'

export const renderIf = (predicate: (element: Element) => boolean) =>
  // eslint-disable-next-line prefer-arrow-callback
  React.memo(function RenderIf({ element, children }: React.PropsWithChildren<{ element: Element }>) {
    if (predicate(element)) {
      return children
    }
    return null
  })
