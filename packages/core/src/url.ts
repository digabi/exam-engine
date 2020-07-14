import * as _ from 'lodash-es'

type URLOptions = Partial<Omit<URL, 'origin' | 'searchParams' | 'toJSON'>>

/**
 * A helper function for constructing relative URLs for links within the exam.
 */
export function url(path: string, options?: URLOptions): string {
  const u = new URL(path, 'http://example.com') // hostname doesn't matter but it is required for URL constructor
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  _.forEach(options, (v, k) => ((u as any)[k] = v))
  const constructedPath = u.pathname + u.search + u.hash
  return path.startsWith('/') ? constructedPath : constructedPath.substr(1)
}
