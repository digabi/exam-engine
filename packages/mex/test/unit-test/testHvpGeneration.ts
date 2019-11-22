import { assert } from 'chai'
import { generateHvpForLanguage } from '../../src/mastering'
import { readFixture, writeFixture } from '../fixtures'

describe('HVP generation', () => {
  ;['fi-FI', 'sv-FI'].forEach(language =>
    it(`Generates HVP for ${language}`, async () => {
      await assertGeneratedHvp(
        '../../exams/EA/EA.xml',
        `../../test/fixtures/EA/EA_${language}-HVP.txt`,
        language
      )
    })
  )
})

async function assertGeneratedHvp(sourceFilename: string, fixtureFilename: string, language: string) {
  const exam = await readFixture(sourceFilename)
  const result = await generateHvpForLanguage(exam, language)

  if (process.env.OVERWRITE_FIXTURES) {
    await writeFixture(fixtureFilename, result)
  }

  const expectedHvp = await readFixture(fixtureFilename)
  return assert.deepStrictEqual(result, expectedHvp)

  assert.deepStrictEqual(result, expectedHvp)
}
