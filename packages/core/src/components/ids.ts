export const examTitleId = 'title'

export const referencesTitleId = 'references-title'

export const sectionTitleId = (displayNumber: string): string => `section-title-${trimWhitespace(displayNumber)}`

export const questionTitleId = (displayNumber: string): string => `question-title-${trimWhitespace(displayNumber)}`

export const attachmentTitleId = (displayNumber: string): string => `attachment-title-${trimWhitespace(displayNumber)}`

export const tocTitleId = 'toc-title'

const trimWhitespace = (str: string) => str.replace(/\s/g, '')
