export function scrollToHash(): void {
  const maybeId = decodeURIComponent(window.location.hash).slice(1)
  if (maybeId) {
    const maybeElement = document.getElementById(maybeId)
    if (maybeElement) {
      maybeElement.scrollIntoView()
    }
  }
}
