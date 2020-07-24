const elementMap = new WeakMap<Element, number>()
let id = 0

/** Returns an unique numeric id for an element in the exam XML. */
const getId = (element: Element): number => {
  const maybeId = elementMap.get(element)

  if (maybeId != null) {
    return maybeId
  }

  const elementId = ++id
  elementMap.set(element, elementId)

  return elementId
}

const byElementId = (prefix: string) => (element: Element) => `${prefix}-${getId(element)}`

const byDisplayNumber = (prefix: string) => (displayNumber: string) => `${prefix}-${displayNumber}`

export const examTitleId = 'title'

export const referencesTitleId = 'references-title'

export const sectionTitleId = byDisplayNumber('section-title')

export const questionTitleId = byDisplayNumber('question-title')

export const externalMaterialListTitleId = byElementId('external-material-list-title')

export const tocSectionTitleId = byDisplayNumber('toc-section-title')

export const answerScoreId = byElementId('answer-score')

export const imageCaptionId = byElementId('image-caption')

export const audioLabelId = byElementId('audio-label')

export const tocTitleId = 'toc-title'
