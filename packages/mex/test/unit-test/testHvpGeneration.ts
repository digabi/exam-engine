import { promises as fs } from 'fs'
import { assertEqualsExamFixture } from '../../../../test/fixtures'
import { resolveExam } from '@digabi/mexamples'
import { generateHvpForLanguage } from '../../src/mastering'

describe('HVP generation', () => {
  for (const language of ['fi-FI', 'sv-FI']) {
    it(`Generates HVP for ${language}`, async () => {
      const exam = resolveExam('EA/EA.xml')
      const source = await fs.readFile(exam, 'utf-8')
      const result = await generateHvpForLanguage(source, language)
      await assertEqualsExamFixture(exam, language, 'hvp.txt', result)
    })
  }
})
