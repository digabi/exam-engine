import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'

export default function ProgressBar({ duration, className }: { duration: number; className?: string }) {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [animating, setAnimating] = useState(false)
  useEffect(() => {
    // when this code runs as bundled inside koe for some reason or another
    // there is only a single render and the element in dom immeadiately has
    // "--animating" class which breaks the css transformation (the progress
    // bar is completely filled from start). By reading clientTop we force a
    // synchronous layout/reflow in a browser
    // tslint:disable-next-line
    progressBarRef.current!.clientTop
    setAnimating(true)
  }, [])

  return (
    <div className={classNames('e-progress-bar', className)} ref={progressBarRef}>
      <div
        className={classNames('e-progress-bar__fill', { 'e-progress-bar__fill--animating': animating })}
        style={{ transitionDuration: duration + 's' }}
      />
    </div>
  )
}
