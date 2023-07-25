import React from 'react'
import { useExamTranslation } from '../../i18n'

export function AnnotationLists({
  pregradingAnnotations,
  censoringAnnotations,
  singleGrading
}: {
  pregradingAnnotations: { numbering: string; message: string }[]
  censoringAnnotations: { numbering: string; message: string }[]
  singleGrading: boolean
}) {
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

interface AnnotationListProps {
  i18nTitleKey?: 'grading.pregrading-annotations' | 'grading.censor-annotations'
  annotations?: AnnotationItem[]
}

interface AnnotationItem {
  numbering: string
  message: string
}
