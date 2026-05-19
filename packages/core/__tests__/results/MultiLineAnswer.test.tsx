import { updateLargeImageWarnings } from '../../src/components/grading/largeImageDetector'

describe('<MultiLineAnswer /> image opening', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('adds a full size image link for downscaled images', () => {
    const answer = createAnswer('<span class="e-image-wrapper"><img src="/screenshot/answer.png" /></span>')
    const image = answer.querySelector('img')!
    mockImageSize(image, 100, 50)
    runImageUpdateImmediately()

    updateLargeImageWarnings(answer)

    const link = answer.querySelector<HTMLAnchorElement>('.full-size-image a')
    expect(answer.querySelector('.e-image-wrapper')?.classList.contains('e-large-image')).toBe(true)
    expect(link?.href).toContain('/screenshot/answer.png')
    expect(link?.target).toBe('_blank')
  })

  it('does not add a full size image link for images rendered at natural size', () => {
    const answer = createAnswer('<span class="e-image-wrapper"><img src="/screenshot/answer.png" /></span>')
    const image = answer.querySelector('img')!
    mockImageSize(image, 100, 100)
    runImageUpdateImmediately()

    updateLargeImageWarnings(answer)

    expect(answer.querySelector('.full-size-image')).toBeNull()
  })

  it('opens grading full size image links in a new tab by default', () => {
    const answer = createAnswer('<span class="e-image-wrapper"><img src="/screenshot/answer.png" /></span>')
    const image = answer.querySelector('img')!
    mockImageSize(image, 100, 50)
    runImageUpdateImmediately()

    updateLargeImageWarnings(answer)

    expect(answer.querySelector<HTMLAnchorElement>('.full-size-image a')?.target).toBe('_blank')
  })
})

function createAnswer(html: string) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

function mockImageSize(image: HTMLImageElement, naturalWidth: number, width: number) {
  Object.defineProperty(image, 'complete', { configurable: true, value: true })
  Object.defineProperty(image, 'naturalWidth', { configurable: true, value: naturalWidth })
  Object.defineProperty(image, 'width', { configurable: true, value: width })
}

function runImageUpdateImmediately() {
  jest.spyOn(window, 'setTimeout').mockImplementation(callback => {
    if (typeof callback === 'function') {
      callback()
    }
    return undefined as unknown as ReturnType<typeof setTimeout>
  })
}
