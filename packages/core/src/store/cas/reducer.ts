import { ActionType } from 'typesafe-actions'
import * as actions from './actions'

type CasAction = ActionType<typeof actions>

export type CasState =
  | { casStatus: 'forbidden' }
  | { casStatus: 'allowing'; durationRemaining: number }
  | { casStatus: 'allowed' }

const initialState: CasState = {
  casStatus: 'forbidden'
}

export default function casReducer(state: CasState = initialState, action: CasAction): CasState {
  switch (action.type) {
    case 'ALLOW_CAS':
      return state
    case 'ALLOW_CAS_COUNTDOWN': {
      return { casStatus: 'allowing', durationRemaining: action.payload }
    }
    case 'ALLOW_CAS_SUCCEEDED': {
      return { casStatus: 'allowed' }
    }
    case 'ALLOW_CAS_CANCELLED': {
      return { casStatus: 'forbidden' }
    }
    case 'UPDATE_CAS_REMAINING': {
      return { casStatus: 'allowing', durationRemaining: action.payload }
    }
    default:
      return state
  }
}
