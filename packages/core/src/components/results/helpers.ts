import { Score } from '../types'

export const getAnnotationAttributes = (answer?: Score) =>
  answer
    ? {
        'data-pregrading-annotations': JSON.stringify(answer?.pregrading?.annotations ?? []),
        'data-censoring-annotations': JSON.stringify(answer?.censoring?.annotations ?? [])
      }
    : {}
