export const ns = { e: 'http://ylioppilastutkinto.fi/exam.xsd' }

export const textAnswerTypes = ['text-answer', 'scored-text-answer'] as const
export const choiceAnswerTypes = ['choice-answer', 'dropdown-answer'] as const
export const answerTypes = [...textAnswerTypes, ...choiceAnswerTypes]

export const attachmentTypes = ['image', 'video', 'file', 'audio', 'audio-test'] as const
