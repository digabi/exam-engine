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
  i18nTitleKey?: string
  annotations?: AnnotationItem[]
}

const hasAnnotations = (score: Score) =>
  Boolean(score?.pregrading?.annotations?.length || score?.censoring?.annotations?.length)

const getPrefix = (answers: Element[], answer: Element) =>
  answers.length > 1 ? shortDisplayNumber(answer.getAttribute('display-number')!) : ''

const AnnotationListComponent = ({ i18nTitleKey, annotations }: AnnotationListProps) => {
  const { t } = useTranslation()

  return annotations ? (
    <>
      {i18nTitleKey && <h5>{t(i18nTitleKey)}</h5>}
      <ol className="e-list-data e-pad-l-0 e-font-size-s">
        {annotations.map(({ numbering, message }) => (
          <li data-list-number={numbering} key={numbering}>
            {message}
          </li>
        ))}
      </ol>
    </>
  ) : null
}

function ResultsAnnotationList() {
  const { answers } = useContext(QuestionContext)
  const { scores, singleGrading } = useContext(ResultsContext)

  const answersAndScores = mapMaybe(answers, answer => {
    const questionId = getNumericAttribute(answer, 'question-id')
    const score = findScore(scores, questionId!)

    return score && answer && hasAnnotations(score) ? ([answer, score] as const) : undefined
  })

  const getListOfAnnotations = (
    answerElementAndScores: Array<readonly [Element, Score]>,
    annotationsFrom: 'pregrading' | 'censoring',
    listNumberOffset: number = 0
  ) =>
    _.flatMap(
      answerElementAndScores,
      ([answer, score]) =>
        score[annotationsFrom]?.annotations
          ?.filter(a => a.message.length)
          .map((annotation: Annotation, i: number) => {
            const numbering = getPrefix(answers, answer) + String(listNumberOffset + i + 1) + ')'
            const message = annotation.message
            return { numbering, message }
          }) ?? []
    )

  const pregradingAnnotations = getListOfAnnotations(answersAndScores, 'pregrading')
  const censoringAnnotations = getListOfAnnotations(answersAndScores, 'censoring', pregradingAnnotations.length)

  return pregradingAnnotations.length || censoringAnnotations.length ? (
    <div className="e-annotation-list e-columns e-mrg-t-2">
      {singleGrading ? (
        <div className="e-column e-column--10">
          <AnnotationListComponent annotations={pregradingAnnotations} />
        </div>
      ) : (
        <>
          <div className="e-column e-column--6">
            <AnnotationListComponent
              i18nTitleKey={'grading.pregrading-annotations'}
              annotations={pregradingAnnotations}
            />
          </div>
          <div className="e-column e-column--6">
            <AnnotationListComponent i18nTitleKey={'grading.censor-annotations'} annotations={censoringAnnotations} />
          </div>
        </>
      )}
    </div>
  ) : null
}

export default React.memo(ResultsAnnotationList)
