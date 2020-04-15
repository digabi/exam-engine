import {
  GenerateAcceptedAnswer,
  GenerateChoiceAnswerOption,
  GenerateChoiceAnswerOptions,
  GenerateDropdownAnswerOptions,
  generateExam,
  GenerateExamOptions,
  GenerateQuestionOptions,
  GenerateScoredTextAnswerOptions,
  GenerateSectionOptions,
  GenerateTextAnswerOptions
} from '@digabi/exam-engine-generator'
import { ns, parseExam } from '@digabi/exam-engine-mastering'
import { formatISO } from 'date-fns'
import * as fc from 'fast-check'
import { wrap } from 'jest-snapshot-serializer-raw'
import { Element } from 'libxmljs2'

describe('generateExam()', () => {
  it('creates a basic exam when called with minimal arguments', () => {
    const exam = generateAndParseExam([[]])
    expect(wrap(exam.toString(false))).toMatchSnapshot()
  })

  it('supports exam-code, day-code, date & max-answers attributes', () => {
    const examCode = 'A'
    const dayCode = 'X'
    const date = '2020-03-01'
    const maxAnswers = 5

    const exam = generateAndParseExam({ examCode, dayCode, date, maxAnswers, sections: [[]] })
    const root = exam.root()!

    expect(getAttr(root, 'exam-code')).toEqual(examCode)
    expect(getAttr(root, 'day-code')).toEqual(dayCode)
    expect(getAttr(root, 'date')).toEqual(date)
    expect(getAttr(root, 'max-answers')).toEqual(String(maxAnswers))
  })

  it('creates a section for each entry in the sections array', () => {
    const exam = generateAndParseExam([[], []])
    expect(exam.find('//e:section', ns)).toHaveLength(2)
  })

  it('supports section attributes', () => {
    const maxAnswers = 5
    const casForbidden = true

    const exam = generateAndParseExam([{ maxAnswers, casForbidden, questions: [] }])
    const section = exam.get<Element>('//e:section', ns)!

    expect(getAttr(section, 'max-answers')).toEqual(String(maxAnswers))
    expect(getAttr(section, 'cas-forbidden')).toEqual(String(casForbidden))
  })

  it('creates a question for each entry in the questions array', () => {
    const exam = generateAndParseExam([[['text-answer'], ['text-answer']]])

    expect(exam.find('//e:section/e:question', ns)).toHaveLength(2)
    expect(exam.find('//e:section/e:question/e:text-answer', ns)).toHaveLength(2)
  })

  it('supports subquestions', () => {
    const exam = generateAndParseExam([[[['text-answer', 'text-answer']]]])

    expect(exam.find('//e:question/e:question[1]/e:text-answer', ns)).toHaveLength(2)
  })

  it('supports creating a text-answer with the default attributes', () => {
    const exam = generateAndParseExam([[['text-answer']]])
    const answer = exam.get<Element>('//e:text-answer', ns)!

    expect(getAttr(answer, 'max-score')).toEqual('6')
  })

  it('supports text-answer attributes', () => {
    const maxScore = 10
    const hint = 'Foo'

    const exam = generateAndParseExam([[[{ name: 'text-answer', maxScore, hint }]]])
    const answer = exam.get<Element>('//e:section/e:question/e:text-answer', ns)!

    expect(getAttr(answer, 'max-score')).toEqual(String(maxScore))
    expect(answer.get<Element>('.//e:hint', ns)?.text()).toEqual(hint)
  })

  it('supports creating a scored-text-answer with the default attributes', () => {
    const exam = generateAndParseExam([[['scored-text-answer']]])
    const acceptedAnswer = exam.get<Element>('//e:section/e:question/e:scored-text-answer/e:accepted-answer', ns)!

    expect(acceptedAnswer.text()).toEqual('Oikea vaihtoehto')
    expect(getAttr(acceptedAnswer, 'score')).toEqual('3')
  })

  it('supports scored-text-answer attributes', () => {
    const maxScore = 10
    const hint = 'Foo'
    const acceptedAnswers = [
      { text: 'Bar', score: 1 },
      { text: 'Baz', score: 2 }
    ]

    const exam = generateAndParseExam([[[{ name: 'scored-text-answer', maxScore, hint, acceptedAnswers }]]])

    const answer = exam.get<Element>('//e:section/e:question/e:scored-text-answer', ns)!

    expect(getAttr(answer, 'max-score')).toEqual(String(maxScore))
    expect(answer.get<Element>('.//e:hint/text()', ns)?.toString()).toEqual(hint)
    expect(
      answer
        .find<Element>('.//e:accepted-answer', ns)
        .map(e => ({ text: e.text(), score: Number(getAttr(e, 'score')) }))
    ).toEqual(acceptedAnswers)
  })

  it('supports creating a choice-answer with the default attributes', () => {
    const exam = generateAndParseExam([[['choice-answer']]])
    const options = exam
      .find<Element>('//e:section/e:question/e:choice-answer/e:choice-answer-option', ns)
      .map(e => ({ text: e.text(), score: Number(getAttr(e, 'score')) }))

    expect(options).toEqual([
      { text: 'Oikea vaihtoehto', score: 3 },
      { text: 'Väärä vaihtoehto', score: 0 },
      { text: 'Väärä vaihtoehto', score: 0 }
    ])
  })

  it('supports choice-answer attributes', () => {
    const expected = [
      { text: 'Bar', score: 1 },
      { text: 'Baz', score: 2 }
    ]

    const exam = generateAndParseExam([[[{ name: 'choice-answer', options: expected }]]])
    const options = exam
      .find<Element>('//e:section/e:question/e:choice-answer/e:choice-answer-option', ns)
      .map(e => ({ text: e.text(), score: Number(getAttr(e, 'score')) }))

    expect(options).toEqual(expected)
  })

  it('supports creating a dropdown-answer with the default attributes', () => {
    const exam = generateAndParseExam([[['dropdown-answer']]])
    const options = exam
      .find<Element>('//e:section/e:question/e:dropdown-answer/e:dropdown-answer-option', ns)
      .map(e => ({ text: e.text(), score: Number(getAttr(e, 'score')) }))

    expect(options).toEqual([
      { text: 'Oikea vaihtoehto', score: 3 },
      { text: 'Väärä vaihtoehto', score: 0 },
      { text: 'Väärä vaihtoehto', score: 0 }
    ])
  })

  it('supports dropdown-answer attributes', () => {
    const expected = [
      { text: 'Foo', score: 1 },
      { text: 'Bar', score: 2 }
    ]

    const exam = generateAndParseExam([[[{ name: 'dropdown-answer', options: expected }]]])
    const options = exam
      .find<Element>('//e:section/e:question/e:dropdown-answer/e:dropdown-answer-option', ns)
      .map(e => ({ text: e.text(), score: Number(getAttr(e, 'score')) }))

    expect(options).toEqual(expected)
  })

  it('creates valid exams', () => {
    const maxScore = fc.integer(1, 10)
    const score = fc.integer(-10, 10)
    const positiveScore = fc.integer(1, 10)
    const maxAnswers = fc.integer(1, 10)
    const type = fc.constantFrom('rich-text' as const, 'single-line' as const)

    const hint = fc.string()
    const textAnswer: fc.Arbitrary<GenerateTextAnswerOptions> = fc.record({
      name: fc.constant('text-answer' as const),
      maxScore,
      hint: optional(hint),
      type: optional(type)
    })
    const acceptedAnswers: fc.Arbitrary<GenerateAcceptedAnswer[]> = fc.array(
      fc.record({ score: positiveScore, text: fc.string() }),
      1,
      3
    )
    const scoredTextAnswer: fc.Arbitrary<GenerateScoredTextAnswerOptions> = fc.oneof(
      fc.record({
        name: fc.constant('scored-text-answer' as const),
        maxScore,
        hint: optional(hint),
        type: optional(type)
      }),
      fc.record({
        name: fc.constant('scored-text-answer' as const),
        hint: optional(hint),
        type: optional(type),
        acceptedAnswers
      })
    )
    const options: fc.Arbitrary<GenerateChoiceAnswerOption[]> = fc.array(
      fc.record({
        score,
        text: fc.string()
      }),
      1,
      10
    )
    const choiceAnswer: fc.Arbitrary<GenerateChoiceAnswerOptions> = fc.record({
      name: fc.constant('choice-answer' as const),
      options
    })
    const dropdownAnswer: fc.Arbitrary<GenerateDropdownAnswerOptions> = fc.record({
      name: fc.constant('dropdown-answer' as const),
      options
    })
    const answer: fc.Arbitrary<GenerateQuestionOptions> = fc.oneof(
      fc.constant('text-answer' as const),
      textAnswer,
      fc.constant('scored-text-answer' as const),
      scoredTextAnswer,
      fc.constant('choice-answer' as const),
      choiceAnswer,
      fc.constant('dropdown-answer' as const),
      dropdownAnswer
    )
    const question = fc.array(answer, 1, 10)
    const questions = fc.array(question, 1, 10)
    const section: fc.Arbitrary<GenerateSectionOptions> = fc.oneof(
      questions,
      fc.record({ maxAnswers: optional(maxAnswers), casForbidden: optional(fc.boolean()), questions })
    )
    const sections = fc.array(section, 1, 3)
    const exam: fc.Arbitrary<GenerateExamOptions> = fc.oneof(
      sections,
      fc.record({
        date: optional(fc.date().map(d => formatISO(d, { representation: 'date' }))),
        examCode: optional(fc.constantFrom('EA', 'M', 'N')),
        dayCode: optional(fc.constant('X')),
        maxAnswers: optional(maxAnswers),
        languages: optional(fc.set(fc.constantFrom('fi-FI', 'sv-FI'), 1, 2)),
        sections
      })
    )

    fc.assert(
      fc.property(exam, examOptions => {
        expect(() => generateAndParseExam(examOptions)).not.toThrow()
      })
    )
  })
})

function generateAndParseExam(options: GenerateExamOptions) {
  const exam = generateExam(options)
  return parseExam(exam, true)
}

function getAttr(element: Element, name: string) {
  return element.attr(name)?.value()
}

function optional<T>(arb: fc.Arbitrary<T>): fc.Arbitrary<T | undefined> {
  return fc.option(arb, { nil: undefined })
}
