import dialogPolyfill from 'dialog-polyfill'
import React, { forwardRef, memo, PropsWithChildren, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  onClose: () => void
}

// eslint-disable-next-line prefer-arrow-callback
export default memo(function ModalDialog({ onClose, children }: PropsWithChildren<Props>) {
  const [Dialog] = useState<'dialog' | typeof PolyfillDialog>(
    // @ts-expect-error window.HTMLDialogElement might not exist in older browsers
    window.HTMLDialogElement?.prototype.showModal ? 'dialog' : PolyfillDialog
  )
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const closeFullScreenOnEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onClose()
      }
    }

    if (ref.current) {
      dialogPolyfill.registerDialog(ref.current)
      window.addEventListener('keydown', closeFullScreenOnEsc)
      ref.current.showModal()
    }

    return () => {
      window.removeEventListener('keydown', closeFullScreenOnEsc)
      ref.current?.close()
    }
  }, [])

  return (
    <Dialog ref={ref} className="full-screen">
      {children}
    </Dialog>
  )
})

const PolyfillDialog = memo(
  // eslint-disable-next-line prefer-arrow-callback
  forwardRef<HTMLDialogElement>(function PolyfillDialog(
    { children, className }: PropsWithChildren<{ className?: string }>,
    ref
  ) {
    const [container] = useState(document.createElement('div'))

    useLayoutEffect(() => {
      container.className = 'e-exam'
      document.body.insertBefore(container, document.body.firstChild)
      return () => container.remove()
    })

    // These wrapper elements are added so that styles are applied correctly
    return createPortal(
      <div className="e-exam-question">
        <dialog ref={ref} className={className}>
          {children}
        </dialog>
      </div>,
      container
    )
  })
)
