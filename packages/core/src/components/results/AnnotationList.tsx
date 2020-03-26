import * as _ from 'lodash-es'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { getNumericAttribute } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { mapMaybe } from '../../utils'
import { QuestionContext } from '../QuestionContext'
import { Annotation, Score } from '../types'
import { findScore, ResultsContext } from './ResultsContext'

interface AnnotationItem {
  numbering: string
  message: string
}

interface AnnotationListProps {
  pregradingAnnotations: AnnotationItem[]
  censoringAnnotations: AnnotationItem[]
}

export const ResultsAnnotationListComponent = ({
  pregradingAnnotations,
  censoringAnnotations
}: AnnotationListProps) => {
  const { t } = useTranslation()

  return pregradingAnnotations.length || censoringAnnotations.length ? (
    <div className="e-annotation-list e-columns e-mrg-t-2">
      <div className="e-column e-column--6">
        <h5>{t('grading.pregrading-annotations')}</h5>
        <ol className="e-list-data e-pad-l-0 e-font-size-s">
          {pregradingAnnotations.map(({ numbering, message }) => (
            <li data-list-number={numbering} key={numbering}>
              {message}
            </li>
          ))}
        </ol>
      </div>
      <div className="e-column e-column--6">
        <h5>{t('grading.censor-annotations')}</h5>
        <ol className="e-list-data e-pad-l-0 e-font-size-s">
          {censoringAnnotations.map(({ numbering, message }) => (
            <li data-list-number={numbering} key={numbering}>
              {message}
            </li>
          ))}
        </ol>
      </div>
    </div>
  ) : null
}

function ResultsAnnotationList() {
  const { answers } = useContext(QuestionContext)
  const { scores } = useContext(ResultsContext)

  const answersAndScores = mapMaybe(answers, answer => {
    const questionId = getNumericAttribute(answer, 'question-id')
    const score = findScore(scores, questionId!)

    return score?.pregrading?.annotations?.length || score?.censoring?.annotations?.length
      ? ([answer, score] as const)
      : undefined
  })

  const getPrefix = (answer: Element) =>
    answers.length > 1 ? shortDisplayNumber(answer.getAttribute('display-number')!) : ''

  const getListOfAnnotations = (
    answerElementAndScores: Array<readonly [Element, Score]>,
    annotationsFrom: 'pregrading' | 'censoring',
    listNumberOffset: number = 0
  ) =>
    _.flatMap(
      answerElementAndScores,
      ([answer, score]) =>
        score![annotationsFrom]?.annotations
          ?.filter(a => a.message.length)
          .map((annotation: Annotation, i: number) => {
            const numbering = getPrefix(answer) + String(listNumberOffset + i + 1) + ')'
            const message = annotation.message
            return { numbering, message }
          }) ?? []
    )

  const pregradingAnnotations = getListOfAnnotations(answersAndScores, 'pregrading')
  const censoringAnnotations = getListOfAnnotations(answersAndScores, 'censoring', pregradingAnnotations.length)

  return <ResultsAnnotationListComponent {...{ pregradingAnnotations, censoringAnnotations }} />
}

export default React.memo(ResultsAnnotationList)
