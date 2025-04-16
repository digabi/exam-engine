import React from 'react'

/**
 * Maps an array, skipping the value if `fn` returns `undefined`.
 *
 * @example mapMaybe(array, fn) ≡ array.map(fn).filter(v => v !== undefined)
 */
export function mapMaybe<T, U>(array: T[], fn: (value: T, index: number) => U | undefined): U[] {
  const result: U[] = []

  for (let i = 0; i < array.length; i++) {
    const value = fn(array[i], i)
    if (value !== undefined) {
      result.push(value)
    }
  }

  return result
}

/**
 * Insert a separator between each element of the array.
 *
 * @example intersperse(',', ['a', 'b', 'c']) ≡ ['a', ',', 'b', ',' 'c']
 */
export function intersperse<T>(separator: T, array: T[]): T[] {
  if (array.length === 0) return []
  const result = new Array<T>(array.length * 2 - 1)

  for (let i = 0; i < array.length - 1; i++) {
    result[i * 2] = array[i]
    result[i * 2 + 1] = separator
  }

  result[result.length - 1] = array[array.length - 1]
  return result
}

export function isWhitespace(node: React.ReactNode) {
  return typeof node === 'string' && node.trim().length === 0
}
