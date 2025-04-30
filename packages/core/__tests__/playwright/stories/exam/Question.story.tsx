import React from 'react'
import { renderChildNodesBase } from '../../../../src/components/exam/Exam'
import Question from '../../../../src/components/exam/Question'
import { queryAll } from '../../../../src/dom-utils'
import parseExam from '../../../../src/parser/parseExam'
import { ExamComponentWrapper } from '../../utils/ExamComponentWrapper'

export function QuestionStory({ examXml }: { examXml: string }) {
  const doc = parseExam(examXml, true)
  const element = queryAll(doc.documentElement, 'question')[0]
  return (
    <ExamComponentWrapper doc={doc}>
      <Question element={element} renderChildNodes={renderChildNodesBase()} renderComponentOverrides={{}} />
    </ExamComponentWrapper>
  )
}
