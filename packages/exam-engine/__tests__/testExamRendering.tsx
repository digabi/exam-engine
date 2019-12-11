import { Attachments, Exam, parseExam } from '@digabi/exam-engine'
import { getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/mex'
import { listExams } from '@digabi/mexamples'
import { promises as fs } from 'fs'
import path from 'path'
import React from 'react'
import { create } from 'react-test-renderer'
import { ExamProps } from '../src/components/Exam'
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
      for (const { xml, language } of results) {
        const doc = parseExam(xml, true)
        const props: ExamProps = {
          doc,
          answers: [],
          attachmentsURL: '/attachments',
          casStatus: 'forbidden',
          examServerApi,
          resolveAttachment: (filename: string) => `/attachments/${encodeURIComponent(filename)}`,
          restrictedAudioPlaybackStats: [],
          language
        }
        expect(create(<Exam {...props} />).toJSON()).toMatchSnapshot('<Exam />')
        expect(create(<Attachments {...props} />).toJSON()).toMatchSnapshot('<Attachments />')
      }
    })
  })
}
