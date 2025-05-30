import React from 'react'
import { Exam } from '../../../../src'
import { examServerApi } from '../../../examServerApi'

export const AudioAnswerStory = ({ examXml }: { examXml: string }) => {
  const doc = new DOMParser().parseFromString(examXml, 'application/xml')
  return <Exam doc={doc} examServerApi={examServerApi} />
}
