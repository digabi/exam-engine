import { previewExam } from '@digabi/exam-engine-rendering'
import { Ora } from 'ora'

// tslint:disable-next-line: no-unused-expression
export default async function({ exam, spinner }: { exam: string; spinner: Ora }) {
  spinner.start(`Previewing ${exam}...`)
  const [url] = await previewExam(exam, { openFirefox: true })
  spinner.info(`Server is running at ${url}`)
  return `Press Ctrl-C to stop`
}
