import {
  choiceAnswer,
  dropdownAnswer,
  GenerateAcceptedAnswer,
  GenerateChoiceAnswerOption,
  GenerateChoiceAnswerOptions,
  GenerateDropdownAnswerOptions,
  generateExam,
  GenerateExamOptions,
  GenerateQuestionOptions,
  GenerateScoredTextAnswerOptions,
  GenerateSectionOptions,
  GenerateTextAnswerOptions,
  question,
  scoredTextAnswer,
  textAnswer
} from '@digabi/exam-engine-generator'
import { ns, parseExam } from '@digabi/exam-engine-mastering'
import { formatISO } from 'date-fns'
import * as fc from 'fast-check'
import { wrap } from 'jest-snapshot-serializer-raw'
import { Element } from 'libxmljs2'
import { GenerateAnswerOptions, GenerateSubQuestionOptions } from '../src'

describe('generateExam()', () => {
  it('creates a basic exam when called with minimal arguments', () => {
    const exam = generateAndParseExam({ sections: [{ questions: [question([textAnswer()])] }] })
    expect(wrap(exam.toString(false))).toMatchSnapshot()
  })

  it('localizes titles if multi-language exam', () => {
    const exam = generateAndParseExam({
      examVersions: [{ language: 'fi-FI' }, { language: 'sv-FI' }],
      sections: [{ questions: [question([textAnswer()])] }]
    })
    expect(wrap(exam.toString(false))).toMatchSnapshot()
  })

  it('does not add a default title if the exam has an exam code', () => {
    const examCode = 'EA'
    const date = '2020-03-01'
    const exam = generateAndParseExam({ examCode, date, sections: [{ questions: [] }] })

    expect(exam.get<Element>('//e:exam-title', ns)).toBeUndefined()
  })

  it('supports exam-specific attributes', () => {
    const examCode = 'A'
    const dayCode = 'X'
    const date = '2020-03-01'
    const maxAnswers = 5

    const exam = generateAndParseExam({ examCode, dayCode, date, maxAnswers, sections: [{ questions: [] }] })
    const root = exam.root()!

    expect(getAttr(root, 'exam-code')).toEqual(examCode)
    expect(getAttr(root, 'day-code')).toEqual(dayCode)
    expect(getAttr(root, 'date')).toEqual(date)
    expect(getAttr(root, 'max-answers')).toEqual(String(maxAnswers))
  })

  it('creates a section for each entry in the sections array', () => {
    const exam = generateAndParseExam({ sections: [{ questions: [] }, { questions: [] }] })
    expect(exam.find('//e:section', ns)).toHaveLength(2)
  })

  it('supports section attributes', () => {
    const maxAnswers = 5
    const casForbidden = true

    const exam = generateAndParseExam({ sections: [{ maxAnswers, casForbidden, questions: [] }] })
    const section = exam.get<Element>('//e:section', ns)!

    expect(getAttr(section, 'max-answers')).toEqual(String(maxAnswers))
    expect(getAttr(section, 'cas-forbidden')).toEqual(String(casForbidden))
  })

  it('creates a question for each entry in the questions array', () => {
    const exam = generateAndParseExam({
      sections: [{ questions: [question([textAnswer()]), question([textAnswer()])] }]
    })

    expect(exam.find('//e:section/e:question', ns)).toHaveLength(2)
    expect(exam.find('//e:section/e:question/e:text-answer', ns)).toHaveLength(2)
  })

  it('supports subquestions', () => {
    const exam = generateAndParseExam({
      sections: [{ questions: [question([question([question([textAnswer()])])])] }]
    })

    expect(exam.find('//e:question/e:question[1]/e:question[1]/e:text-answer', ns)).toHaveLength(1)
  })

  it('supports creating a text-answer with the default attributes', () => {
    const exam = generateAndParseExam({ sections: [{ questions: [question([textAnswer()])] }] })
    const answer = exam.get<Element>('//e:text-answer', ns)!

    expect(getAttr(answer, 'max-score')).toBe('6')
  })

  it('supports text-answer attributes', () => {
    const maxScore = 10
    const hint = 'Foo'

    const exam = generateAndParseExam({ sections: [{ questions: [question([textAnswer({ maxScore, hint })])] }] })
    const answer = exam.get<Element>('//e:section/e:question/e:text-answer', ns)!

    expect(getAttr(answer, 'max-score')).toEqual(String(maxScore))
    expect(answer.get<Element>('.//e:hint', ns)?.text()).toEqual(hint)
  })

  it('supports creating a scored-text-answer with the default attributes', () => {
    const exam = generateAndParseExam({ sections: [{ questions: [question([scoredTextAnswer()])] }] })
    const acceptedAnswer = exam.get<Element>('//e:section/e:question/e:scored-text-answer/e:accepted-answer', ns)!

    expect(acceptedAnswer.text()).toBe('Oikea vaihtoehto')
    expect(getAttr(acceptedAnswer, 'score')).toBe('3')
  })

  it('supports scored-text-answer attributes', () => {
    const maxScore = 10
    const hint = 'Foo'
    const acceptedAnswers = [
      { text: 'Bar', score: 1 },
      { text: 'Baz', score: 2 }
    ]

    const exam = generateAndParseExam({
      sections: [{ questions: [question([scoredTextAnswer({ maxScore, hint, acceptedAnswers })])] }]
    })

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
    const exam = generateAndParseExam({ sections: [{ questions: [question([choiceAnswer()])] }] })
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

    const exam = generateAndParseExam({ sections: [{ questions: [question([choiceAnswer({ options: expected })])] }] })
    const options = exam
      .find<Element>('//e:section/e:question/e:choice-answer/e:choice-answer-option', ns)
      .map(e => ({ text: e.text(), score: Number(getAttr(e, 'score')) }))

    expect(options).toEqual(expected)
  })

  it('supports creating a dropdown-answer with the default attributes', () => {
    const exam = generateAndParseExam({ sections: [{ questions: [question([dropdownAnswer()])] }] })
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

    const exam = generateAndParseExam({
      sections: [{ questions: [question([dropdownAnswer({ options: expected })])] }]
    })
    const options = exam
      .find<Element>('//e:section/e:question/e:dropdown-answer/e:dropdown-answer-option', ns)
      .map(e => ({ text: e.text(), score: Number(getAttr(e, 'score')) }))

    expect(options).toEqual(expected)
  })

  it('creates valid exams', () => {
    const maxScore = fc.integer({ min: 1, max: 10 })
    const score = fc.integer({ min: -10, max: 10 })
    const positiveScore = fc.integer({ min: 1, max: 10 })
    const maxAnswers = fc.integer({ min: 1, max: 10 })
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
      { minLength: 1, maxLength: 3 }
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
      { minLength: 1, maxLength: 10 }
    )
    const choiceAnswer: fc.Arbitrary<GenerateChoiceAnswerOptions> = fc.record({
      name: fc.constant('choice-answer' as const),
      options
    })
    const dropdownAnswer: fc.Arbitrary<GenerateDropdownAnswerOptions> = fc.record({
      name: fc.constant('dropdown-answer' as const),
      options
    })
    const answer: fc.Arbitrary<GenerateAnswerOptions> = fc.oneof(
      textAnswer,
      scoredTextAnswer,
      choiceAnswer,
      dropdownAnswer
    )
    const subQuestion: fc.Arbitrary<GenerateSubQuestionOptions> = fc.record({
      maxAnswers: optional(maxAnswers),
      answers: fc.array(answer, { minLength: 1, maxLength: 10 })
    })
    // Generate Subquestions with 75% probability.
    const question: fc.Memo<GenerateQuestionOptions> = fc.memo<GenerateQuestionOptions>(n =>
      fc.oneof(rootQuestion(n), subQuestion, subQuestion, subQuestion)
    )
    const rootQuestion: fc.Memo<GenerateQuestionOptions> = fc.memo<GenerateQuestionOptions>(n =>
      n === 0
        ? subQuestion
        : fc.record({
            maxAnswers: optional(maxAnswers),
            questions: fc.array(question(n - 1), { minLength: 1, maxLength: 5 })
          })
    )
    const questions = fc.array(question(2), { minLength: 1, maxLength: 5 })
    const section: fc.Arbitrary<GenerateSectionOptions> = fc.record({
      maxAnswers: optional(maxAnswers),
      questions
    })
    const sections = fc.array(section, { minLength: 1, maxLength: 3 })
    const yoExam: fc.Arbitrary<GenerateExamOptions> = fc.record({
      date: optional(
        fc
          .date({
            min: new Date('2000-01-01'),
            max: new Date('2030-12-31'),
            noInvalidDate: true
          })
          .map(d => formatISO(d, { representation: 'date' }))
      ),
      examCode: optional(fc.constantFrom('EA', 'M', 'N')),
      maxAnswers: optional(maxAnswers),
      languages: optional(
        fc.uniqueArray(fc.constantFrom('fi-FI' as const, 'sv-FI' as const), { minLength: 1, maxLength: 2 })
      ),
      sections
    })

    fc.assert(
      fc.property(yoExam, examOptions => {
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
