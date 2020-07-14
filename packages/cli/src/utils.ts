import path from 'path'

export function resolveExam(filename: string): string {
  const exam = filename.endsWith('.xml') ? filename : path.join(filename, 'exam.xml')
  return resolveFile(exam)
}

export function resolveFile(filename: string): string {
  return path.resolve(process.cwd(), filename)
}

export function examName(exam: string): string {
  return path.basename(path.dirname(exam))
}
