import { Score } from '../../types/Score'

export const getAnnotationAttributes = (answer?: Score) =>
  answer
    ? {
        'data-pregrading-annotations': JSON.stringify(answer?.pregrading?.annotations ?? []),
        'data-censoring-annotations': JSON.stringify(answer?.censoring?.annotations ?? []),
      }
    : {}
