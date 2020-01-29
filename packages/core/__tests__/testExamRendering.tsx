import { Attachments, Exam, parseExam, Results } from '@digabi/exam-engine-core'
import { listExams } from '@digabi/exam-engine-exams'
import { getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/exam-engine-mastering'
import { promises as fs } from 'fs'
import path from 'path'
import React from 'react'
import { create } from 'react-test-renderer'
import { ExamProps } from '../src/components/Exam'
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
        const examProps: ExamProps = {
          doc,
          answers: [],
          attachmentsURL: '/attachments',
          casStatus: 'forbidden',
          examServerApi,
          resolveAttachment: (filename: string) => `/attachments/${encodeURIComponent(filename)}`,
          restrictedAudioPlaybackStats: [],
          language
        }
        expect(create(<Exam {...examProps} />).toJSON()).toMatchSnapshot('<Exam />')
        expect(create(<Attachments {...examProps} />).toJSON()).toMatchSnapshot('<Attachments />')
        const resultsProps: ResultsProps = {
          doc,
          answers: [],
          attachmentsURL: '/attachments',
          resolveAttachment: (filename: string) => `/attachments/${encodeURIComponent(filename)}`,
          language,
          gradingStructure
        }
        expect(create(<Results {...resultsProps} />).toJSON()).toMatchSnapshot('<Results />')
      }
    })
  })
}
