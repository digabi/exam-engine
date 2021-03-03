import { migrateExam, parseExam } from '@digabi/exam-engine-mastering'
import { promises as fs } from 'fs'

export default async function migrate({ exam }: { exam: string; outDir?: string }): Promise<void> {
  const xml = await fs.readFile(exam, 'utf-8')
  const doc = parseExam(xml, false)

  migrateExam(doc)

  // Do not overwrite the backup file if it already exists.
  await fs.writeFile(`${exam}.bak`, xml, { flag: 'wx' })
  await fs.writeFile(exam, doc.toString(false))
}
