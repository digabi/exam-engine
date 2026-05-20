let remainingImages: number

export async function waitUntilImagesDone() {
  let tries = 1000
  while (tries > 0) {
    tries--
    if (remainingImages === 0) {
      return
    } else {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  throw Error('Images not loaded')
}

export function updateLargeImageWarnings(answer: Element) {
  const images = answer?.querySelectorAll('img') || []
  remainingImages = images.length
  images.forEach(img => {
    const measure = () => requestAnimationFrame(() => requestAnimationFrame(() => updateImageStatus(img)))
    if (img.complete && img.naturalWidth > 0) {
      measure()
    } else {
      img.addEventListener('load', measure, { once: true })
    }
  })
}

function updateImageStatus(img: HTMLImageElement) {
  remainingImages--
  const wrapper = img.parentElement
  const nextSibling = wrapper?.nextSibling
  const hasFullSizeLink = nextSibling instanceof HTMLElement && nextSibling.classList.contains('full-size-image')
  const isLargeImage = img.naturalWidth > img.width + 1 // allow for rounding errors
  wrapper?.classList.toggle('e-large-image', isLargeImage)

  if (isLargeImage && !hasFullSizeLink) {
    wrapper?.insertAdjacentHTML(
      'afterend',
      `<div class="full-size-image"><a target="_blank" href="${img.src}"></a></div>`
    )
  } else if (hasFullSizeLink) {
    nextSibling.remove()
  }
}
