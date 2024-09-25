import { fireEvent } from '@testing-library/react'

export function mockCreateRange() {
  const originalCreateRange = global.window.document.createRange
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  global.Range = function Range() {}

  const createContextualFragment = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.children[0]
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  Range.prototype.createContextualFragment = (html: string) => createContextualFragment(html)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  global.window.document.createRange = function createRange() {
    return {
      setEnd: () => {},
      setStart: () => {},
      getBoundingClientRect: () => ({ right: 0 }),
      getClientRects: () => [],
      createContextualFragment
    }
  }
  return () => (global.window.document.createRange = originalCreateRange)
}
