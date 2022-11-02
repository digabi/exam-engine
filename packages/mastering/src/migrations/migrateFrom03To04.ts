import { Document, Element } from 'libxmljs2'
import { ns } from '../mastering/schema'

/**
 * Migrates an exam from schema version 0.3 to 0.4
 *
 * Overview of changes
 *
 * ```xml
 * <e:external-material>
 * ...
 * <e:audio src="1.ogg" times="1">Hören Sie den Text zuerst als Ganzes</e:audio>
 * ...
 * </e:external-material>
 * ```
 *
 * ==>
 *
 * ```xml
 * <e:external-material>
 * ...
 * <e:audio src="1.ogg">Hören Sie den Text zuerst als Ganzes</e:audio>
 * ...
 * </e:external-material>
 * ``` * */
export function migrateFrom03To04(doc: Document) {
  for (const invalidAudioElement of doc.find<Element>('//e:external-material//e:audio[@times]', ns)) {
    const times = invalidAudioElement.attr('times')!
    times.remove()
  }

  doc.root()?.attr('exam-schema-version', '0.4')
}
