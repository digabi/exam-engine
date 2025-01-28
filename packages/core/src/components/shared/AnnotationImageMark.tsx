import classNames from 'classnames'
import { clamp } from 'lodash-es'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnnotationRect, NewExamAnnotation, NewExamImageAnnotation } from '../../types/ExamAnnotations'

// eslint-disable-next-line prefer-arrow-callback
export const AnnotationImageMark = React.memo(function AnnotationImageMark({
  rect: { x1, y1, x2, y2 },
  onClickAnnotation,
  setNewAnnotationRef,
  annotationId,
  markNumber,
  resolved
}: {
  rect: NewExamImageAnnotation['rect']
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, annotationId: number) => void
  setNewAnnotationRef: (e: HTMLElement | null) => void
  annotationId?: number
  markNumber?: number
  resolved?: boolean
}) {
  const markRef = useRef<HTMLElement>(null)
  const supRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (markRef.current) {
      markRef.current.style['inset'] =
        `${100 * Math.min(y1, y2)}% ${100 * (1 - Math.max(x1, x2))}% ${100 * (1 - Math.max(y1, y2))}% ${100 * Math.min(x1, x2)}%`
    }

    if (supRef.current) {
      supRef.current.style['left'] = `${100 * Math.max(x1, x2)}%`
      supRef.current.style['top'] = `${100 * Math.min(y1, y2)}%`
    }
  }, [x1, y1, x2, y2])

  useEffect(() => {
    if (markRef.current && annotationId === undefined) {
      setNewAnnotationRef(markRef.current)
    }
  }, [])

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (annotationId) {
        e.stopPropagation()
        onClickAnnotation(e, annotationId)
      }
    },
    [annotationId, onClickAnnotation]
  )

  return (
    <>
      <mark
        ref={markRef}
        className={classNames('e-annotation e-annotation--shape', { resolved })}
        data-annotation-id={annotationId}
        data-hidden="false"
        onMouseDown={onMouseDown}
      />
      {markNumber && <sup ref={supRef} className="e-annotation" data-content={markNumber} />}
    </>
  )
})

export function useImageAnnotation(
  anchor: string,
  description: string,
  setNewAnnotation: (a: NewExamAnnotation | null) => void
) {
  const elementRef = useRef<HTMLElement>(null)
  const [annotationRect, setAnnotationRect] = useState<AnnotationRect>()
  const annotationRectRef = useRef<AnnotationRect>()

  useEffect(() => {
    annotationRectRef.current = annotationRect
  }, [annotationRect])

  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = elementRef.current
    if (el === null) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const [x2, y2] = getMousePosition(el, e)
    setAnnotationRect(rect => {
      if (rect) {
        const { x1, y1 } = rect
        return { x1, y1, x2, y2 }
      }
      return rect
    })
  }, [])

  const onMouseUp = useCallback((e: MouseEvent) => {
    const el = elementRef.current
    if (el === null) {
      return
    }

    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('mousemove', onMouseMove)

    const displayNumber = elementRef.current
      ?.closest('div[data-annotation-anchor]')
      ?.getAttribute('data-annotation-anchor')

    if (!displayNumber || !annotationRectRef.current) {
      setAnnotationRect(undefined)
      return
    }

    const { x1, y1 } = annotationRectRef.current
    const [x2, y2] = getMousePosition(el, e)

    setNewAnnotation({
      annotationType: 'image',
      displayNumber,
      annotationAnchor: anchor,
      rect: { x1, y1, x2, y2 },
      description
    })
    setAnnotationRect(undefined)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const el = elementRef.current
    if (el === null || e.button !== 0) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)

    const [x1, y1] = getMousePosition(el, e)
    setAnnotationRect({ x1, y1, x2: x1, y2: y1 })
    setNewAnnotation(null)
  }, [])

  return { elementRef, annotationRect, onMouseDown }
}

function getMousePosition(el: HTMLElement, e: { clientX: number; clientY: number }): [x: number, y: number] {
  const bbox = el.getBoundingClientRect()
  return [clamp((e.clientX - bbox.left) / bbox.width, 0, 1), clamp((e.clientY - bbox.top) / bbox.height, 0, 1)]
}
