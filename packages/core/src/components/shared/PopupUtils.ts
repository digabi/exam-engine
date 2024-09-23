import React from 'react'

export function showAndPositionElement(mark: Element | null, popupRef: React.RefObject<HTMLElement>) {
  const popup = popupRef.current
  if (mark && popup) {
    const style = popup.style
    const markRect = mark?.getBoundingClientRect()
    const popupRect = popup.getBoundingClientRect()
    const top = markRect.height + markRect.top + window.scrollY
    const windowWidth = window.innerWidth
    style.top = `${String(top)}px`
    style.opacity = '1'
    const popupHitsWindowRight = markRect.left + popupRect.width > windowWidth

    if (popupHitsWindowRight) {
      style.left = `${markRect.right - popupRect.width}px`
    } else {
      style.left = `${markRect.left}px`
    }
  }
}

export function closeMathEditor(element: HTMLDivElement) {
  // rich-text-editor does not properly support several rich-text-editor instances created at different times.
  // In order to close math editor that is open, we need to dispatch events like this.
  element.dispatchEvent(new Event('focus', { bubbles: true, cancelable: true }))
  element.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }))
}
