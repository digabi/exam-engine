import glob from 'glob'
import path from 'path'

/** Returns an array of all exam xml files in the exams directory */
export function listExams() {
  // Using glob.sync here for this to be easier to use in mocha `describe(…)` blocks.
  // Could refactor this to glob-promise when top-level await is available
  return glob.sync(resolveExam('*/*.xml'))
}

/** Resolves a filename relative to the exams directory */
export function resolveExam(filename: string) {
  return path.resolve(__dirname, '..', filename)
}
