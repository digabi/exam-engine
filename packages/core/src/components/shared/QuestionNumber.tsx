import React, { useContext } from 'react'
import { ExamComponentProps, RenderOptions } from '../../createRenderChildNodes'
import { QuestionContext } from '../context/QuestionContext'
import * as _ from 'lodash-es'

export function QuestionNumber({ element, options }: ExamComponentProps) {
  const suffix = element.getAttribute('suffix')!
  const { displayNumber } = useContext(QuestionContext)

  if (options === RenderOptions.SkipHTML) {
    return null
  }

  return (
    <>
      {_.first(displayNumber.split('.'))!}.{suffix}
    </>
  )
}
