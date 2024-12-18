import { resolveExam } from '@digabi/exam-engine-exams'
import { readFile } from 'fs/promises'
import path from 'path'
import { getMediaMetadataFromLocalFile, masterExam, MasteringResult } from '@digabi/exam-engine-mastering'

export async function setupMasteredExam(subject: string = 'SC'): Promise<MasteringResult> {
  const examPath = resolveExam(`${subject}/${subject}.xml`)
  const resolveAttachment = (filename: string) => path.resolve(path.dirname(examPath), 'attachments', filename)
  const examXml = await readFile(examPath, 'utf-8')
  const [masteredExam] = await masterExam(examXml, () => '', getMediaMetadataFromLocalFile(resolveAttachment), {
    removeCorrectAnswers: true
  })
  return masteredExam
}
