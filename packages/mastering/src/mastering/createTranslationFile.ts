import { Document, Element } from 'libxmljs2'
import { ns } from './schema'

export const createTranslationFile = (doc: Document): string => {
  return doc
    .find<Element>(`//e:*[@lang='fi-FI']`, ns)
    .map(element =>
      element
        .text()
        .trim()
        .replace(/\s+/g, ' ')
    )
    .filter(s => s.length > 0)
    .join('\n\n')
}
