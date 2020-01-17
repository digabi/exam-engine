import { Document } from 'libxmljs2'
import { ns } from './schema'
import { asElements } from './utils'

export const createTranslationFile = (doc: Document): string => {
  return asElements(doc.root()!.find(`//e:*[@lang='fi-FI']`, ns))
    .map(element =>
      element
        .text()
        .trim()
        .replace(/\s+/g, ' ')
    )
    .filter(s => s.length > 0)
    .join('\n\n')
}
