import dialogPolyfill from 'dialog-polyfill'
import React, { memo, PropsWithChildren, RefObject, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  onClose: () => void
  className?: string
  parentCssSelectorPath?: string[]
}

// eslint-disable-next-line prefer-arrow-callback
export default memo(function ModalDialog({
  onClose,
  className,
  parentCssSelectorPath,
  children
}: PropsWithChildren<Props>) {
  const [requiresPolyfill] = useState(!window.HTMLDialogElement?.prototype.showModal)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const closeFullScreenOnEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onClose()
      }
    }

    if (ref.current) {
      if (requiresPolyfill) {
        dialogPolyfill.registerDialog(ref.current)
      }

      window.addEventListener('keydown', closeFullScreenOnEsc)
      ref.current.showModal()
    }

    return () => {
      window.removeEventListener('keydown', closeFullScreenOnEsc)
      ref.current?.close()
    }
  }, [])

  return requiresPolyfill ? (
    <PolyfillDialog dialogRef={ref} className={className} parentCssSelectorPath={parentCssSelectorPath}>
      {children}
    </PolyfillDialog>
  ) : (
    <dialog ref={ref} className={className}>
      {children}
    </dialog>
  )
})

// eslint-disable-next-line prefer-arrow-callback
const PolyfillDialog = memo(function PolyfillDialog({
  dialogRef,
  className,
  parentCssSelectorPath,
  children
}: PropsWithChildren<{
  dialogRef: RefObject<HTMLDialogElement>
  className?: string
  parentCssSelectorPath?: string[]
}>) {
  const rootContainerId = 'modal-dialog-root'
  const [{ container, removeContainer }] = useState(() => {
    const rootContainer = document.createElement('div')
    document.body.insertBefore(rootContainer, document.body.firstChild)
    rootContainer.id = rootContainerId

    let container = rootContainer
    if (parentCssSelectorPath?.length) {
      const [firstSelector, ...restSelectors] = parentCssSelectorPath
      rootContainer.className = firstSelector

      for (const selector of restSelectors) {
        const el = document.createElement('div')
        el.className = selector
        container.appendChild(el)
        container = el
      }
    }

    return {
      container,
      removeContainer: () => rootContainer.remove()
    }
  })

  useEffect(() => {
    const hiddenElements: HTMLElement[] = []
    document.body.childNodes.forEach(child => {
      if (child instanceof HTMLElement && !child.hasAttribute('aria-hidden') && child.id !== rootContainerId) {
        child.setAttribute('aria-hidden', 'true')
        hiddenElements.push(child)
      }
    })

    return () => {
      hiddenElements.forEach(el => el.removeAttribute('aria-hidden'))
      removeContainer()
    }
  }, [])

  // These wrapper elements are added so that styles are applied correctly
  return createPortal(
    <dialog ref={dialogRef} className={className}>
      {children}
    </dialog>,
    container
  )
})
