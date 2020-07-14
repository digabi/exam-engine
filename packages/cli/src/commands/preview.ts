import { previewExam } from '@digabi/exam-engine-rendering'
import { Ora } from 'ora'

export default async function ({ exam, spinner }: { exam: string; spinner: Ora }): Promise<string> {
  spinner.start(`Previewing ${exam}...`)
  const ctx = await previewExam(exam, { openFirefox: true })
  spinner.info(`Server is running at ${ctx.url}`)
  return `Press Ctrl-C to stop`
}
