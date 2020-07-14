import * as i18next from 'i18next'
import _ from 'lodash'
import React from 'react'
import { I18nextProvider } from 'react-i18next'
import TestRenderer from 'react-test-renderer'
import AnsweringInstructions, { AnsweringInstructionProps } from '../src/components/AnsweringInstructions'
import { initI18n } from '../src/i18n'

describe('<AnsweringInstructions />', () => {
  let i18n: i18next.i18n

  beforeAll(() => {
    i18n = initI18n('fi-FI', null, null)
  })

  describe('question', () => {
    it('numerals', () => {
      expectRendering({
        maxAnswers: 1,
        type: 'question',
        childQuestions: mkQuestions(range(1, 10, '1.')),
      })

      expectRendering({
        maxAnswers: 5,
        type: 'question',
        childQuestions: mkQuestions(range(1, 10, '1.')),
      })
    })

    it('2 child questions and maxAnswers = 1', () => {
      expectRendering({
        maxAnswers: 1,
        type: 'question',
        childQuestions: mkQuestions(range(1, 2, '1.')),
      })
    })

    it('fallback', () => {
      expectRendering({
        maxAnswers: 11,
        type: 'question',
        childQuestions: mkQuestions(range(1, 12, '1.')),
      })
    })
  })

  describe('section', () => {
    it('numerals', () => {
      expectRendering({
        maxAnswers: 1,
        type: 'section',
        childQuestions: mkQuestions(range(1, 10)),
      })

      expectRendering({
        maxAnswers: 5,
        type: 'section',
        childQuestions: mkQuestions(range(1, 10)),
      })
    })

    it('2 child questions and maxAnswers = 1', () => {
      expectRendering({
        maxAnswers: 1,
        type: 'section',
        childQuestions: mkQuestions(range(1, 2)),
      })
    })

    it('fallback', () => {
      expectRendering({
        minAnswers: 2,
        maxAnswers: 5,
        type: 'section',
        childQuestions: mkQuestions(range(1, 12)),
      })

      expectRendering({
        maxAnswers: 11,
        type: 'section',
        childQuestions: mkQuestions(range(1, 12)),
      })
    })
  })

  function range(start: number, end: number, prefix = ''): string[] {
    return _.range(start, end + 1).map((n) => `${prefix}${n}`)
  }

  function expectRendering(props: AnsweringInstructionProps) {
    const container = TestRenderer.create(
      <I18nextProvider i18n={i18n}>
        <AnsweringInstructions {...props} />
      </I18nextProvider>
    )
    expect(container.toJSON()).toMatchSnapshot()
  }

  function mkQuestions(displayNumbers: string[]): Element[] {
    return displayNumbers.map((displayNumber) => {
      const question = document.createElement('question')
      question.setAttribute('display-number', displayNumber)
      return question
    })
  }
})
