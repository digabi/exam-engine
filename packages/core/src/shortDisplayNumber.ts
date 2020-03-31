import * as _ from 'lodash-es'

export function shortDisplayNumber(displayName: string): string {
  return _.last(displayName.split('.'))! + '.'
}
