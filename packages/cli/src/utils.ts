import path from 'path'

export function resolveExam(filename: string) {
  const exam = filename.endsWith('.xml') ? filename : path.join(filename, 'exam.xml')
  return path.resolve(process.cwd(), exam)
}
