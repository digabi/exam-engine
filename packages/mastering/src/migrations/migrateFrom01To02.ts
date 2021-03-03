import { Document, Element } from 'libxmljs2'
import { ns } from '../mastering/schema'

/**
 * Migrates an exam from schema version 0.1 to 0.2
 *
 * Overview of changes
 *
 * ```xml
 * <e:languages>
 *   <e:language>fi-FI</e:language>
 *   <e:language>sv-FI</e:language>
 * </e:languages>
 * ```
 *
 * ==>
 *
 * ```xml
 * <e:exam-versions>
 *   <e:exam-version lang="fi-FI" />
 *   <e:exam-version lang="sv-FI" />
 * </e:exam-versions>
 * ```
 * */
export function migrateFrom01To02(doc: Document) {
  doc.find<Element>('./e:languages', ns).forEach((languages) => {
    languages
      .name('exam-versions')
      .find<Element>('./e:language', ns)
      .forEach((language) => {
        language.name('exam-version').attr('lang', language.text()).text('')
      })
  })

  doc.root()?.attr('exam-schema-version', '0.2')
}
