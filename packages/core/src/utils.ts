/**
 * Maps an array, skipping the value if `fn` returns `undefined`.
 *
 * `mapMaybe(array, fn) ≡ array.map(fn).filter(v => v !== undefined)`
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
