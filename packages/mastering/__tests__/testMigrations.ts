import { parseExam, migrateExam } from '@digabi/exam-engine-mastering'
import { readFixture } from './fixtures'

describe('Exam migrations', () => {
  it('migrates an old exam to the current schema', async () => {
    const xml = await readFixture('old_schema_version.xml')
    const doc = parseExam(xml, false)
    migrateExam(doc)

    expect(doc.toString(false)).toMatchSnapshot()
  })

  it('does nothing if the exam already is in the latest schema', async () => {
    const xml = await readFixture('minimal_yo_exam.xml')
    const doc = parseExam(xml)
    migrateExam(doc)

    expect(doc.toString(false)).toEqual(parseExam(xml).toString(false))
  })

  it('throws an error if schema version is invalid', async () => {
    const xml = await readFixture('invalid_schema_version.xml')
    const doc = parseExam(xml)

    expect(() => migrateExam(doc)).toThrow('Unsupported exam schema version: 2.0')
  })

  it('throws an error if schema version is missing', async () => {
    const xml = await readFixture('no_schema_version.xml')
    const doc = parseExam(xml)

    expect(() => migrateExam(doc)).toThrow('No exam-schema-version attribute found')
  })
})
