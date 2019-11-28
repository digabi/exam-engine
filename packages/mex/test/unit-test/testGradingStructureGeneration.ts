import { assert } from 'chai'
import { readFixture, writeFixture } from '../../../../test/fixtures'
import { masterExamForLanguage } from '../../src/mastering'

const language = 'fi-FI'

describe('testGradingStructureGeneration.ts - Grading structure generation', () => {
  ;[
    'minimal',
    'no-exam-title',
    'no-questions',
    'questions-without-answers',
    'single-text-question',
    'question-in-div',
    'scored-text',
    'text-answer-not-in-top-level-question',
    'multiple-text-answers-in-same-question'
  ].forEach(examName =>
    it(`Generates grading structure for ${examName}`, async () => {
      await assertGeneratedGradingStructure(
        `grading-structure/${examName}.xml`,
        `grading-structure/${examName}-grading-structure.json`,
        `grading-structure/${examName}-title.txt`
      )
    })
  )
  ;[
    // TODO: Choices and dropdowns are disabled for now, since they have not been tested to work.
    // Not required in A/O exams.
    'choice',
    'choices',
    'dropdown',
    'dropdowns',
    'invalid-deep-question-hierarchy',
    'invalid-question-hierarchy',
    'invalid-choice-within-first-level-question',
    'invalid-multiple-choice-answers-in-same-question',
    'invalid-dropdown-within-2nd-level-question',
    'invalid-dropdown-with-other-answer-type',
    'invalid-choice-html',
    'invalid-dropdown-html'
  ].forEach(examName =>
    it(`Throws error with ${examName}`, async () => {
      await assertThrowsValidationError(`grading-structure/${examName}.xml`)
    })
  )
})

async function assertThrowsValidationError(sourceFilename: string) {
  const exam = await readFixture(sourceFilename)

  let errorThrown

  try {
    await generateGradingStructureAndTitle(exam, language)
  } catch (err) {
    errorThrown = err
  }

  assert(errorThrown, 'Error was not thrown as expected')
}

async function assertGeneratedGradingStructure(
  sourceFilename: string,
  gradingStructureFixtureFilename: string,
  titleFixtureFilename: string
) {
  const exam = await readFixture(sourceFilename)

  const { gradingStructure, title } = await generateGradingStructureAndTitle(exam, language)

  if (process.env.OVERWRITE_FIXTURES) {
    await writeFixture(gradingStructureFixtureFilename, JSON.stringify(gradingStructure, null, 2))
    await writeFixture(titleFixtureFilename, title)
  }

  const expectedGradingStructure = JSON.parse(await readFixture(gradingStructureFixtureFilename))
  const expectedTitle = await readFixture(titleFixtureFilename)

  assert.deepStrictEqual(gradingStructure, expectedGradingStructure)
  assert.deepStrictEqual(title, expectedTitle)
}

async function generateGradingStructureAndTitle(xml: string, language: string) {
  const dummyGenerateUuid = () => '00000000-0000-4000-8000-000000000000'
  const dummyGetMediaMetadata = async (_: string, type: 'video' | 'audio' | 'image') =>
    type === 'audio' ? { duration: 999 } : { width: 999, height: 999 }
  const lenientLaTexParsing = false
  const enableShuffling = false
  const shuffleSecret = undefined
  const removeHiddenElements = false
  const generateGradingStructure = true

  const { gradingStructure, title } = await masterExamForLanguage(
    xml,
    language,
    dummyGenerateUuid,
    dummyGetMediaMetadata,
    lenientLaTexParsing,
    enableShuffling,
    shuffleSecret,
    removeHiddenElements,
    generateGradingStructure
  )

  return { gradingStructure, title }
}
