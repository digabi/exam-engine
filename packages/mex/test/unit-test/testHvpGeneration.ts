import { assert } from 'chai'
import { readFixture, writeFixture } from '../../../../test/fixtures'
import { generateHvpForLanguage } from '../../src/mastering'

describe('HVP generation', () => {
  ;['fi-FI', 'sv-FI'].forEach(language =>
    it(`Generates HVP for ${language}`, async () => {
      await assertGeneratedHvp('../../exams/EA/EA.xml', `EA/EA_${language}-HVP.txt`, language)
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
