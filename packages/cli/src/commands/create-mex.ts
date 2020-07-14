import { createMex, getMediaMetadataFromLocalFile, masterExam } from '@digabi/exam-engine-mastering'
import { createReadStream, createWriteStream, promises as fs } from 'fs'
import path from 'path'
import * as uuid from 'uuid'
import { examName } from '../utils'

export default async function ({
  exam,
  outdir = path.dirname(exam),
  nsaScripts,
  securityCodes,
  passphrase,
  privateKey,
}: {
  exam: string
  outdir?: string
  nsaScripts: string
  securityCodes?: string
  passphrase: string
  privateKey: string
}): Promise<void> {
  const attachmentsDir = path.resolve(path.dirname(exam), 'attachments')
  const resolveAttachment = (attachment: string) => path.resolve(attachmentsDir, attachment)
  const sourceXml = await fs.readFile(exam, 'utf-8')
  const answersPrivateKey = await fs.readFile(privateKey, 'utf-8')

  const results = await masterExam(sourceXml, () => uuid.v4(), getMediaMetadataFromLocalFile(resolveAttachment))
  await fs.mkdir(outdir, { recursive: true })

  for (const { language, xml, attachments } of results) {
    const outputFilename = `${examName(exam)}_${language}.mex`
    await createMex(
      xml,
      attachments.map(({ filename, restricted }) => ({
        filename,
        restricted,
        contents: createReadStream(resolveAttachment(filename)),
      })),
      createReadStream(nsaScripts),
      securityCodes ? createReadStream(securityCodes) : null,
      passphrase,
      answersPrivateKey,
      createWriteStream(path.resolve(outdir, outputFilename))
    )
  }
}
