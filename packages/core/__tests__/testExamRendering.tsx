import {
  Exam,
  Attachments,
  Results,
  GradingInstructions,
  GradingStructure,
  Score,
  TextQuestion
} from '@digabi/exam-engine-core'
import parseExam from '@digabi/exam-engine-core/dist/parser/parseExam'
import { listExams } from '@digabi/exam-engine-exams'
import { getMediaMetadataFromLocalFile, masterExam } from '@digabi/exam-engine-mastering'
import { promises as fs } from 'fs'
import path from 'path'
import React from 'react'
import { create } from 'react-test-renderer'
import { CommonExamProps, ExamProps } from '../src/components/exam/Exam'
import { ResultsProps } from '../src/components/results/Results'
import { examServerApi } from './examServerApi'
import { generateAnswers } from '@digabi/exam-engine-generator'

describe.each(listExams().map(exam => [path.basename(exam), exam]))('%s', (_basename, exam) => {
  const resolveAttachment = (filename: string) => path.resolve(path.dirname(exam), 'attachments', filename)

  it('renders properly', async () => {
    const source = await fs.readFile(exam, 'utf-8')
    const results = await masterExam(source, () => '', getMediaMetadataFromLocalFile(resolveAttachment), {
      removeCorrectAnswers: false
    })
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
        restrictedAudioPlaybackStats: [],
        studentName: '[Kokelaan Nimi]',
        showUndoView: false,
        undoViewProps: {
          questionId: 0,
          title: '',
          close: () => undefined,
          restoreAnswer: () => undefined
        }
      }
      const resultsProps: ResultsProps = {
        ...commonProps,
        gradingStructure,
        answers: generateAnswers(gradingStructure),
        scores: mkScores(gradingStructure),
        returnToExam: () => {},
        endSession: () => Promise.resolve(),
        studentSessionEnded: false
      }
      expect(create(<Exam {...examProps} />).toJSON()).toMatchSnapshot('<Exam />')
      expect(create(<Attachments {...examProps} />).toJSON()).toMatchSnapshot('<Attachments />')
      expect(create(<Results {...resultsProps} />).toJSON()).toMatchSnapshot('<Results />')
      expect(create(<GradingInstructions {...commonProps} />).toJSON()).toMatchSnapshot('<GradingInstructions />')
    }
  })
})

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
