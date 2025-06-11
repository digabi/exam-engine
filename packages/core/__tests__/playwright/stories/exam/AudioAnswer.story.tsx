import React from 'react'
import { Exam, indexedDBExamServerAPI } from '../../../../src'

export const AudioAnswerStory = ({ examXml }: { examXml: string }) => {
  const doc = new DOMParser().parseFromString(examXml, 'application/xml')
  return <Exam doc={doc} examServerApi={indexedDBExamServerAPI('examUUID', () => '')} />
}
