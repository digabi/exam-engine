import * as _ from 'lodash-es'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { getNumericAttribute } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { mapMaybe } from '../../utils'
import { QuestionContext } from '../QuestionContext'
import { ResultsContext } from './ResultsContext'

function ResultsAnnotationList() {
  const { t } = useTranslation()
  const { answers } = useContext(QuestionContext)
  const { scores } = useContext(ResultsContext)

  const answersAndScores = mapMaybe(answers, answer => {
    const questionId = getNumericAttribute(answer, 'question-id')
    const score = scores.find(s => s.questionId === questionId)
    return score?.annotations.length ? ([answer, score] as const) : undefined
  })

  const pregradingAnnotations = _.flatMap(answersAndScores, ([answer, score]) => {
    const prefix = answers.length > 1 ? shortDisplayNumber(answer.getAttribute('display-number')!) : ''
    return score.annotations.map((annotation, i) => {
      const key = prefix + String(i + 1) + ')'
      return (
        <li data-list-number={key} key={key}>
          {annotation.message}
        </li>
      )
    })
  })

  return pregradingAnnotations.length ? (
    <div className="e-annotation-list e-columns e-mrg-t-2">
      <div className="e-column e-column--6">
        <h5>{t('grading.pregrading-annotations')}</h5>
        <ol className="e-list-data e-pad-l-0 e-font-size-s">{pregradingAnnotations}</ol>
      </div>
      <div className="e-column e-column--6">
        <h5>{t('grading.censor-annotations')}</h5>
        <ol className="e-list-data e-pad-l-0 e-font-size-s" />
      </div>
    </div>
  ) : null
}

export default React.memo(ResultsAnnotationList)
