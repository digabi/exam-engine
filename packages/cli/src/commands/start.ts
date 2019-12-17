import { previewExam } from '@digabi/exam-engine-rendering'
import { Ora } from 'ora'

// tslint:disable-next-line: no-unused-expression
export default async function({ exam }: { exam: string; spinner: Ora }) {
  const [url] = await previewExam(exam, { openFirefox: true })
  return `Server running at ${url}`
}
