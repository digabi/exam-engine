import * as glob from 'glob'
import path from 'path'

/** Returns an array of all exam xml files in the exams directory */
export function listExams(): string[] {
  return glob.globSync(resolveExam('*/*.xml')).sort()
}
/** Resolves a filename relative to the exams directory */
export function resolveExam(filename: string): string {
  return path.resolve(__dirname, '..', filename)
}
