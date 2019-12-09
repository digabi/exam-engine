import Attachments from '@digabi/exam-engine/src/components/Attachments'
import Exam from '@digabi/exam-engine/src/components/Exam'
import parseExam from '@digabi/exam-engine/src/parser/parseExam'
import { getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/mex'
import { listExams } from '@digabi/mexamples'
import { promises as fs } from 'fs'
import path from 'path'
import React from 'react'
import { create } from 'react-test-renderer'
import { ExamProps } from '../src/components/Exam'
import { examServerApi } from './examServerApi'

describe.each(listExams())('%s', exam => {
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
        attachmentsURL: '',
        casStatus: 'forbidden',
        examServerApi,
        resolveAttachment,
        restrictedAudioPlaybackStats: [],
        language
      }
      expect(create(<Exam {...props} />).toJSON()).toMatchSnapshot('<Exam />')
      expect(create(<Attachments {...props} />).toJSON()).toMatchSnapshot('<Attachments />')
    }
  })
})
