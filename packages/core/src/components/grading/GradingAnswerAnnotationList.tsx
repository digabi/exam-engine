import * as _ from 'lodash-es'
import React from 'react'
import { Annotation } from '../../index'
import { useExamTranslation } from '../../i18n'

interface AnnotationItem {
  numbering: string
  message: string
}

interface AnnotationListProps {
  i18nTitleKey?: 'grading.pregrading-annotations' | 'grading.censor-annotations'
  annotations?: AnnotationItem[]
}

const AnnotationListComponent = ({ i18nTitleKey, annotations }: AnnotationListProps) => {
  const { t } = useExamTranslation()

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

function GradingAnswerAnnotationList({
  pregrading,
  censoring,
  singleGrading,
}: {
  pregrading: Annotation[]
  censoring: Annotation[]
  singleGrading: boolean
}) {
  const getListOfAnnotations = (annotations: Annotation[], listNumberOffset = 0) =>
    annotations
      .filter((a) => a.message.length)
      .map((annotation: Annotation, i: number) => {
        const numbering = String(listNumberOffset + i + 1) + ')'
        const message = annotation.message
        return { numbering, message }
      }) ?? []

  const pregradingAnnotations = getListOfAnnotations(pregrading)
  const censoringAnnotations = getListOfAnnotations(censoring, pregradingAnnotations.length)

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

export default React.memo(GradingAnswerAnnotationList)
