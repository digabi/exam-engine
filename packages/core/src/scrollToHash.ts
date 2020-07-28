export function scrollToHash(): () => void {
  const maybeId = decodeURIComponent(window.location.hash).slice(1)

  if (maybeId) {
    const maybeElement = document.getElementById(maybeId)
    if (maybeElement) {
      focusElement(maybeElement)
    }
  }

  window.addEventListener('hashchange', scrollToHash)
  return () => window.removeEventListener('hashchange', scrollToHash)
}

function focusElement(element: HTMLElement) {
  // Make the element temporarily focusable for screen readers.
  element.setAttribute('tabindex', '-1')
  // We don't want to show an outline for our sighted users.
  element.style.outline = 'none'

  element.addEventListener(
    'blur',
    () => {
      element.removeAttribute('tabindex')
      element.style.outline = ''
    },
    { once: true }
  )

  element.focus()
  element.scrollIntoView()
}
