import { createOfflineExam } from '@digabi/exam-engine-rendering'
import { Ora } from 'ora'
import path from 'path'

export default async function createOffline({
  exam,
  outdir = path.dirname(exam),
  media,
  spinner
}: {
  exam: string
  outdir?: string
  media: boolean
  spinner: Ora
}): Promise<void> {
  spinner.start(`Creating offline versions for ${exam}...`)
  for (const directory of await createOfflineExam(exam, outdir, { mediaVersion: media })) {
    spinner.succeed(directory)
  }
}
