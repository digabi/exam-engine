import { Attachments, Exam, parseExam, Results } from '@digabi/exam-engine-core'
import { listExams } from '@digabi/exam-engine-exams'
import { getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/exam-engine-mastering'
import { promises as fs } from 'fs'
import path from 'path'
import React from 'react'
import { create } from 'react-test-renderer'
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
          scores: []
        }
        expect(create(<Exam {...examProps} />).toJSON()).toMatchSnapshot('<Exam />')
        expect(create(<Attachments {...examProps} />).toJSON()).toMatchSnapshot('<Attachments />')
        expect(create(<Results {...resultsProps} />).toJSON()).toMatchSnapshot('<Results />')
      }
    })
  })
}
