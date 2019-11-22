import { action, createAction } from 'typesafe-actions'

export const allowCas = createAction('ALLOW_CAS')

export const allowCasCountdown = (durationSeconds: number) => action('ALLOW_CAS_COUNTDOWN', durationSeconds)

export const allowCasSucceeded = createAction('ALLOW_CAS_SUCCEEDED')

export const allowCasCancelled = createAction('ALLOW_CAS_CANCELLED')

export const updateCasRemaining = (remaining: number) => action('UPDATE_CAS_REMAINING', remaining)
