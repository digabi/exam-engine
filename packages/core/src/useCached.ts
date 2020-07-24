import { useState } from 'react'

/** Like `useMemo`, but guaranteed never to be reinitialized. Doesn't support dependencies. */
export function useCached<T>(fn: () => T): T {
  return useState(fn)[0]
}
