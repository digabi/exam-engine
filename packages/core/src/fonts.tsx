import FontFaceObserver from 'fontfaceobserver'
import * as _ from 'lodash-es'

/** A promise that resolves when the main fonts on the exam have been loaded. */
export const ready = Promise.all([
  new FontFaceObserver('Noto Sans', { weight: 300 }).load(), // Light
  new FontFaceObserver('Noto Sans', { weight: 400 }).load(), // Regular
  new FontFaceObserver('Noto Sans', { weight: 600 }).load(), // Semibold
])
  .then(() => {
    loaded = true
  })
  .catch(_.noop)

/** A boolean flag that tells if the main fonts have been loaded.  */
export let loaded = false
