/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { action, deprecated } from 'typesafe-actions'
const { createAction } = deprecated

export const allowCas = (durationSeconds: number) => action('ALLOW_CAS', durationSeconds)

export const allowCasCountdown = (durationSeconds: number) => action('ALLOW_CAS_COUNTDOWN', durationSeconds)

export const allowCasSucceeded = createAction('ALLOW_CAS_SUCCEEDED')

export const allowCasCancelled = createAction('ALLOW_CAS_CANCELLED')

export const updateCasRemaining = (remaining: number) => action('UPDATE_CAS_REMAINING', remaining)
