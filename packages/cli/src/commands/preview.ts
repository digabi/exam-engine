import { previewExam } from '@digabi/exam-engine-rendering'
import { Ora } from 'ora'

export default async function preview({
  exam,
  port,
  spinner
}: {
  exam: string
  port?: number
  spinner: Ora
}): Promise<string> {
  spinner.start(`Previewing ${exam}...`)
  const ctx = await previewExam(exam, {
    openBrowser: !process.env.DISABLE_BROWSER,
    port: port,
    editableGradingInstructions: !!process.env.EDITABLE_GRADING_INSTRUCTIONS
  })
  spinner.info(`Server is running at ${ctx.url}`)
  return `Press Ctrl-C to stop`
}
