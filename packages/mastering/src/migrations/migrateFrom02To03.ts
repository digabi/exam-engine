import { Document, Element } from 'libxmljs2'
import { ns } from '../mastering/schema'

/**
 * Migrates an exam from schema version 0.2 to 0.3
 *
 * Overview of changes
 *
 * ```xml
 * <e:audio src="1.ogg" times="1">Hören Sie den Text zuerst als Ganzes</e:audio>
 * ```
 *
 * ==>
 *
 * ```xml
 * <e:audio src="1.ogg" times="1">
 *   <e:audio-title>Hören Sie den Text zuerst als Ganzes</e:audio-title>
 * </e:audio>
 * ```
 * */
export function migrateFrom02To03(doc: Document) {
  for (const element of doc.find<Element>('//e:audio | //e:image', ns)) {
    const childNodes = element.childNodes()
    if (childNodes.length) {
      const name = element.name()
      const title = element.node(`${name}-title`).namespace(ns.e)
      childNodes.forEach((node) => title.addChild(node))
    }
  }

  doc.root()?.attr('exam-schema-version', '0.3')
}
