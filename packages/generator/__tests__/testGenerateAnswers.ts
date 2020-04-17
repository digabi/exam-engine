import { GradingStructure } from '@digabi/exam-engine-core'
import { generateAnswers } from '@digabi/exam-engine-generator'

describe('generateAnswers()', () => {
  it('creates an answer for each text question in grading structure', () => {
    const gradingStructure: GradingStructure = {
      questions: [
        { type: 'text', id: 1, displayNumber: '1', maxScore: 10 },
        { type: 'text', id: 2, displayNumber: '2', maxScore: 10 },
      ],
    }
    expect(generateAnswers(gradingStructure)).toMatchSnapshot()
  })

  it('creates an answer for each choice question in grading structure', () => {
    const gradingStructure: GradingStructure = {
      questions: [
        {
          type: 'choicegroup',
          id: 1,
          displayNumber: '1',
          choices: [
            {
              type: 'choice',
              id: 2,
              displayNumber: '1.1',
              options: [
                { id: 3, correct: true, score: 2 },
                { id: 4, correct: false, score: 0 },
                { id: 5, correct: false, score: 0 },
              ],
            },
            {
              type: 'choice',
              id: 6,
              displayNumber: '1.2',
              options: [
                { id: 7, correct: false, score: 2 },
                { id: 8, correct: true, score: 0 },
                { id: 9, correct: false, score: 0 },
              ],
            },
            {
              type: 'choice',
              id: 10,
              displayNumber: '1.3',
              options: [
                { id: 11, correct: false, score: 0 },
                { id: 12, correct: false, score: 0 },
                { id: 13, correct: true, score: 2 },
              ],
            },
          ],
        },
      ],
    }

    expect(generateAnswers(gradingStructure)).toMatchSnapshot()
  })
})
