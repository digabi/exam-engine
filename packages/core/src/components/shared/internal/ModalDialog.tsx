import React, { memo, PropsWithChildren, useEffect, useRef } from 'react'

type Props = {
  onClose: () => void
  className?: string
}

// eslint-disable-next-line prefer-arrow-callback
export default memo(function ModalDialog({ onClose, className, children }: PropsWithChildren<Props>) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.showModal()
      document.body.style.overflow = 'hidden'
      ref.current.addEventListener('close', onClose)
    }

    return () => {
      ref.current?.close()
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <dialog ref={ref} className={className}>
      {children}
    </dialog>
  )
})
