export function updateLargeImageWarnings(answer: Element) {
  const images = answer.querySelectorAll('img')
  images.forEach((img) => {
    if (img.complete) {
      setTimeout(() => updateImageStatus(img), 0)
    } else {
      img.addEventListener('load', () => updateImageStatus(img))
    }
  })
}
function updateImageStatus(img: HTMLImageElement) {
  const wrapper = img.parentElement!
  const nextSibling = wrapper.nextSibling
  const hasFullSizeLink = nextSibling instanceof HTMLElement && nextSibling.classList.contains('full-size-image')
  if (img.naturalWidth > img.width) {
    if (!hasFullSizeLink) {
      wrapper.insertAdjacentHTML('afterend', `<div class="full-size-image"><a target="_blank" href="${img.src}"></a>`)
    }
  } else {
    if (hasFullSizeLink) {
      nextSibling.remove()
    }
  }
}
