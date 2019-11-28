import { assert } from 'chai'
import { promises as fs } from 'fs'
import glob from 'glob'
import _ from 'lodash'
import path from 'path'

/** Returns an array of all exam xml files in the exams directory */
export function listExams() {
  // Using glob.sync here for this to be easier to use in mocha `describe(…)` blocks.
  // Could refactor this to glob-promise when top-level await is available
  return glob.sync(resolveExam('*/*.xml'))
}

/** Resolves a filename relative to the exams directory */
export function resolveExam(filename: string) {
  return path.resolve(__dirname, '../packages/mexamples/exams/', filename)
}

/**
 * Asserts that content equals to the specified exam fixture defined by the
 * exam xml file, language and fixture name.
 *
 * If `process.env.OVERWRITE_FIXTURES` is defined, it will write the content to
 * the specified fixture instead.
 *
 * Fixtures are written to ../test/test-results directory relative to the exam XML file.
 */
export async function assertEqualsExamFixture(examFilename: string, language: string, fixture: string, content: any) {
  const examDirectory = path.dirname(examFilename)
  const basename = path.basename(examDirectory) + '_' + path.basename(examFilename, '.xml')
  const fixtureFilename = path.resolve(examDirectory, '../../test/test-results', `${basename}_${language}_${fixture}`)
  const serializeAsJson = typeof content !== 'string'

  if (process.env.OVERWRITE_FIXTURES) {
    const serializedData = serializeAsJson ? JSON.stringify(content, null, 2) : content
    await fs.writeFile(fixtureFilename, serializedData, 'utf-8')
  }

  const expectedContent = await fs.readFile(fixtureFilename, 'utf-8').then(serializeAsJson ? JSON.parse : _.identity)
  assert.deepEqual(content, expectedContent)
}

/** Resolves a filename relative to the fixtures directory */
export function resolveFixture(filename: string): string {
  return path.resolve(__dirname, 'fixtures', filename)
}

/** Reads a fixture from the fixtures directory */
export async function readFixture(filename: string): Promise<string> {
  const buffer = await fs.readFile(resolveFixture(filename))
  return buffer.toString()
}

/** Writes a fixture from the fixtures directory
 * @deprecated Remove this when we implement the unified grading structure generation.
 */
export async function writeFixture(filename: string, content: string): Promise<void> {
  return await fs.writeFile(resolveFixture(filename), content)
}
