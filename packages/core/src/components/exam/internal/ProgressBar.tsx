import classNames from 'classnames'
import React, { useEffect, useRef, useState } from 'react'

const ProgressBar: React.FunctionComponent<{ duration: number; durationRemaining: number; className?: string }> = ({
  duration,
  durationRemaining,
  className
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [animating, setAnimating] = useState(false)
  useEffect(() => {
    // when this code runs as bundled inside koe for some reason or another
    // there is only a single render and the element in dom immediately has
    // "--animating" class which breaks the css transformation (the progress
    // bar is completely filled from start). By reading clientTop we force a
    // synchronous layout/reflow in a browser
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    progressBarRef.current!.clientTop
    setAnimating(true)
  }, [])

  return (
    <div className={classNames('e-progress-bar', className)} ref={progressBarRef}>
      <div
        className={classNames('e-progress-bar__fill', { 'e-progress-bar__fill--animating': animating })}
        style={{ transitionDuration: `${duration}s` }}
        role="progressbar"
        aria-valuemax={duration}
        aria-valuemin={0}
        aria-valuenow={duration - durationRemaining}
      />
    </div>
  )
}

export default ProgressBar
