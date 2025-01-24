import React from 'react'

function HiddenAnnotationMark(props: { annotationId: number | null }) {
  return <mark className="e-annotation" data-annotation-id={props.annotationId ?? ''} data-hidden="true" />
}

export default React.memo(HiddenAnnotationMark)
