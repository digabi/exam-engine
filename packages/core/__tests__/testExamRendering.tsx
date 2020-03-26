import { Score } from '@digabi/exam-engine-core'
import Attachments from '@digabi/exam-engine-core/dist/components/Attachments'
import Exam from '@digabi/exam-engine-core/dist/components/Exam'
import Results from '@digabi/exam-engine-core/dist/components/results/Results'
import parseExam from '@digabi/exam-engine-core/dist/parser/parseExam'
import { listExams } from '@digabi/exam-engine-exams'
import {
  getMediaMetadataFromLocalFile,
  GradingStructure,
  masterExam,
  MasteringResult,
  TextQuestion
} from '@digabi/exam-engine-mastering'
import { promises as fs } from 'fs'
import _ from 'lodash'
import path from 'path'
import React from 'react'
import { create } from 'react-test-renderer'
import { ExamAnswer } from '../src'
import { CommonExamProps, ExamProps } from '../src/components/Exam'
import { ResultsProps } from '../src/components/results/Results'
import { examServerApi } from './examServerApi'

for (const exam of listExams()) {
  describe(path.basename(exam), () => {
    let results: MasteringResult[]
    const resolveAttachment = (filename: string) => path.resolve(path.dirname(exam), 'attachments', filename)

    beforeAll(async () => {
      const source = await fs.readFile(exam, 'utf-8')
      results = await masterExam(source, () => '', getMediaMetadataFromLocalFile(resolveAttachment))
    })

    it('renders properly', () => {
      for (const { xml, language, gradingStructure } of results) {
        const doc = parseExam(xml, true)
        const commonProps: CommonExamProps = {
          doc,
          answers: [],
          attachmentsURL: '/attachments',
          resolveAttachment: (filename: string) => `/attachments/${encodeURIComponent(filename)}`,
          language
        }
        const examProps: ExamProps = {
          ...commonProps,
          casStatus: 'forbidden',
          examServerApi,
          restrictedAudioPlaybackStats: []
        }
        const resultsProps: ResultsProps = {
          ...commonProps,
          gradingStructure,
          answers: mkAnswers(gradingStructure),
          scores: mkScores(gradingStructure)
        }
        expect(create(<Exam {...examProps} />).toJSON()).toMatchSnapshot('<Exam />')
        expect(create(<Attachments {...examProps} />).toJSON()).toMatchSnapshot('<Attachments />')
        expect(create(<Results {...resultsProps} />).toJSON()).toMatchSnapshot('<Results />')
      }
    })
  })
}

function mkScores(gradingStructure: GradingStructure) {
  return gradingStructure.questions
    .filter((question): question is TextQuestion => question.type === 'text')
    .map((question, i) => generateScore(question, i))
}

function generateScore(question: { id: number; maxScore: number; displayNumber: string }, i: number): Score {
  return {
    questionId: question.id,
    answerId: question.id,
    pregrading: {
      score: Math.min(question.maxScore, i),
      comment: `Pregading comment to question ${question.displayNumber}`,
      annotations: [{ startIndex: 0, length: 0, message: `Pregading annotation to question ${question.displayNumber}` }]
    },
    censoring: {
      scores: [
        {
          score: Math.min(question.maxScore, i),
          shortCode: 'TestCen1'
        },
        {
          score: Math.min(question.maxScore, i),
          shortCode: 'TestCen2'
        },
        {
          score: Math.min(question.maxScore, i),
          shortCode: 'TestCen3'
        }
      ],
      comment: `Censor comment to question ${question.displayNumber}`,
      annotations: [
        { startIndex: 0, length: 0, message: `Censoring annotation to question ${question.displayNumber}` }
      ],
      nonAnswerDetails: { shortCode: 'CEN' }
    },
    inspection: {
      score: Math.min(question.maxScore, i),
      shortCodes: ['TestIns1', 'TestIns2']
    }
  }
}

function mkAnswers(gradingStructure: GradingStructure): ExamAnswer[] {
  const getCharacterCount = (answerText: string) => answerText.replace(/\s/g, '').length

  return _.flatMap(gradingStructure.questions, question => {
    switch (question.type) {
      case 'text': {
        const value = `Answer to question ${question.displayNumber}`
        return [
          {
            questionId: question.id,
            type: 'text',
            characterCount: getCharacterCount(value),
            value
          }
        ] as ExamAnswer[]
      }
      case 'choicegroup': {
        return question.choices.map((choice, i) => {
          const option = choice.options[i % choice.options.length]
          return {
            questionId: choice.id,
            type: 'choice',
            value: String(option.id)
          }
        }) as ExamAnswer[]
      }
    }
  })
}
