import * as _ from 'lodash-es'
import React, { useContext } from 'react'
import { Annotation, Score } from '../../../index'
import { getNumericAttribute } from '../../../dom-utils'
import { shortDisplayNumber } from '../../../shortDisplayNumber'
import { mapMaybe } from '../../../utils'
import { QuestionContext } from '../../context/QuestionContext'
import { findScore, ResultsContext } from '../../context/ResultsContext'
import { AnnotationLists } from '../../shared/AnnotationLists'

const hasAnnotations = (score: Score) =>
  Boolean(score?.pregrading?.annotations?.length || score?.censoring?.annotations?.length)

const getPrefix = (answers: Element[], answer: Element) =>
  answers.length > 1 ? shortDisplayNumber(answer.getAttribute('display-number')!) : ''

function ResultsAnnotationList() {
  const { answers } = useContext(QuestionContext)
  const { scores, singleGrading } = useContext(ResultsContext)

  const answersAndScores = mapMaybe(answers || [], answer => {
    const questionId = getNumericAttribute(answer, 'question-id')
    const score = findScore(scores, questionId!)

    return score && answer && hasAnnotations(score) ? ([answer, score] as const) : undefined
  })

  const getListOfAnnotations = (
    answerElementAndScores: Array<readonly [Element, Score]>,
    annotationsFrom: 'pregrading' | 'censoring',
    listNumberOffset = 0
  ) =>
    _.flatMap(
      answerElementAndScores,
      ([answer, score]) =>
        score[annotationsFrom]?.annotations
          ?.filter(a => ('length' in a ? !!a.length : true))
          .map((annotation: Annotation, i: number) => {
            const numbering = `${getPrefix(answers, answer) + String(listNumberOffset + i + 1)})`
            const message = annotation.message
            return { numbering, message }
          }) ?? []
    )

  const pregradingAnnotations = getListOfAnnotations(answersAndScores, 'pregrading')
  const censoringAnnotations = getListOfAnnotations(answersAndScores, 'censoring', pregradingAnnotations.length)

  return (
    <AnnotationLists
      pregradingAnnotations={pregradingAnnotations}
      censoringAnnotations={censoringAnnotations}
      singleGrading={!!singleGrading}
    />
  )
}

export default React.memo(ResultsAnnotationList)
