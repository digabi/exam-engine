import { Document } from 'libxmljs2'
import { compare } from 'compare-versions'
import { migrateFrom01To02 } from './migrations/migrateFrom01To02'
import { migrateFrom02To03 } from './migrations/migrateFrom02To03'
import { migrateFrom03To04 } from './migrations/migrateFrom03To04'

type Migration = (doc: Document) => void

const noop: Migration = () => {}
const migrations: Record<string, Migration> = {
  '0.1': migrateFrom01To02,
  '0.2': migrateFrom02To03,
  '0.3': migrateFrom03To04,
  '0.4': noop
}
const supportedVersions = Object.keys(migrations)

export const currentExamSchemaVersion = supportedVersions[supportedVersions.length - 1]

/**
 * Tries to migrate an exam to the latest schema version.
 *
 * Note that this function modifies the document.
 */
export function migrateExam(doc: Document): void {
  const examSchemaVersion = doc.root()?.attr('exam-schema-version')?.value()

  if (examSchemaVersion == null) {
    throw new Error(`No exam-schema-version attribute found`)
  } else if (!supportedVersions.includes(examSchemaVersion)) {
    throw new Error(`Unsupported exam schema version: ${examSchemaVersion}.
This version of exam-engine supports exams with the following exam schema versions: ${supportedVersions.join(', ')}`)
  }

  for (const [migrationVersion, migrate] of Object.entries(migrations)) {
    if (compare(migrationVersion, examSchemaVersion, '>=')) {
      migrate(doc)
    }
  }
}
