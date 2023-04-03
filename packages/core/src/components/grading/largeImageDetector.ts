let remainingImages: number

export async function waitUntilImagesDone() {
  let tries = 1000
  while (tries > 0) {
    tries--
    if (remainingImages === 0) {
      return
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
  throw Error('Images not loaded')
}
export function updateLargeImageWarnings(answer: Element) {
  const images = answer?.querySelectorAll('img') || []
  remainingImages = images.length
  images.forEach((img) => {
    if (img.complete) {
      setTimeout(() => updateImageStatus(img), 0)
    } else {
      img.addEventListener('load', () => updateImageStatus(img))
    }
  })
}
function updateImageStatus(img: HTMLImageElement) {
  remainingImages--
  const wrapper = img.parentElement
  const nextSibling = wrapper?.nextSibling
  const hasFullSizeLink = nextSibling instanceof HTMLElement && nextSibling.classList.contains('full-size-image')
  const isLargeImage = img.naturalWidth > img.width
  wrapper?.classList.toggle('e-large-image', isLargeImage)
  if (isLargeImage) {
    if (!hasFullSizeLink) {
      wrapper?.insertAdjacentHTML('afterend', `<div class="full-size-image"><a target="_blank" href="${img.src}"></a>`)
    }
  } else {
    if (hasFullSizeLink) {
      nextSibling?.remove()
    }
  }
}
