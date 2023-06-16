import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { QuestionContext } from '../context/QuestionContext'
import * as _ from 'lodash-es'

export function QuestionNumber({ element }: ExamComponentProps) {
  const suffix = element.getAttribute('suffix')!
  const { displayNumber } = useContext(QuestionContext)

  return (
    <>
      {_.first(displayNumber.split('.'))!}.{suffix}
    </>
  )
}
