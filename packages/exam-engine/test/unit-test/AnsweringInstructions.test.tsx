import assert from 'assert'
import { shallow } from 'enzyme'
import React from 'react'
import AnsweringInstructions, { AnsweringInstructionProps } from '../../src/components/AnsweringInstructions'
import '../../src/i18n'

// TODO fails after translation changes
describe('<AnsweringInstructions />', () => {
  describe('question', () => {
    it('numerals', () => {
      assertRendering('Vastaa yhteen kohdista 1.1.–1.10.', {
        maxAnswers: 1,
        type: 'question',
        childQuestions: mkQuestions('1.1.', '1.2.', '1.3.', '1.4.', '1.5.', '1.6.', '1.7.', '1.8.', '1.9.', '1.10.')
      })

      assertRendering('Vastaa viiteen kohdista 1.1.–1.10.', {
        maxAnswers: 5,
        type: 'question',
        childQuestions: mkQuestions('1.1.', '1.2.', '1.3.', '1.4.', '1.5.', '1.6.', '1.7.', '1.8.', '1.9.', '1.10.')
      })
    })

    it('2 child questions and maxAnswers = 1', () => {
      assertRendering('Vastaa joko kohtaan 1.1. tai 1.2.', {
        maxAnswers: 1,
        type: 'question',
        childQuestions: mkQuestions('1.1.', '1.2.')
      })
    })

    it('fallback', () => {
      assertRendering('Vastaa 11 kohdista 1.1.–1.12.', {
        maxAnswers: 11,
        type: 'question',
        childQuestions: mkQuestions(
          '1.1.',
          '1.2.',
          '1.3.',
          '1.4.',
          '1.5.',
          '1.6.',
          '1.7.',
          '1.8.',
          '1.9.',
          '1.10.',
          '1.11.',
          '1.12.'
        )
      })
    })
  })

  describe('section', () => {
    it('numerals', () => {
      assertRendering('Vastaa yhteen tehtävään.', {
        maxAnswers: 1,
        type: 'section',
        childQuestions: mkQuestions('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.')
      })

      assertRendering('Vastaa viiteen tehtävään.', {
        maxAnswers: 5,
        type: 'section',
        childQuestions: mkQuestions('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.')
      })
    })

    it('2 child questions and maxAnswers = 1', () => {
      assertRendering('Vastaa joko tehtävään 1. tai 2.', {
        maxAnswers: 1,
        type: 'section',
        childQuestions: mkQuestions('1.', '2.')
      })
    })

    it('fallback', () => {
      assertRendering('Vastaa 2–5 tehtävään.', {
        minAnswers: 2,
        maxAnswers: 5,
        type: 'section',
        childQuestions: mkQuestions('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.')
      })

      assertRendering('Vastaa 11 tehtävään.', {
        maxAnswers: 11,
        type: 'section',
        childQuestions: mkQuestions('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.')
      })
    })
  })

  function assertRendering(expected: string, props: AnsweringInstructionProps) {
    const container = shallow(<AnsweringInstructions {...props} />)
    assert.equal(container.html(), expected)
  }

  function mkQuestions(...displayNumbers: string[]): Element[] {
    return displayNumbers.map(displayNumber => {
      const question = document.createElement('question')
      question.setAttribute('display-number', displayNumber)
      return question
    })
  }
})
