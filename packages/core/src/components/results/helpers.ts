import { Score } from '../../types/Score'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAnnotationAttributes = (answer?: Score) =>
  answer
    ? {
        'data-pregrading-annotations': JSON.stringify(answer?.pregrading?.annotations ?? []),
        'data-censoring-annotations': JSON.stringify(answer?.censoring?.annotations ?? []),
      }
    : {}
