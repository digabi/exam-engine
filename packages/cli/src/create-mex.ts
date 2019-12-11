#!/usr/bin/env node

import { createMex, getMediaMetadataFromLocalFile, masterExam } from '@digabi/mex'
import { accessSync, createReadStream, createWriteStream, promises as fs } from 'fs'
import path from 'path'
import * as uuid from 'uuid'
import yargs from 'yargs'

const argv = yargs
  .usage('-e exam-filename -o output-directory -p passphrase')
  .option('exam', { alias: 'e', describe: 'The exam XML', type: 'string' })
  .option('outdir', { alias: 'o', describe: 'The output directory.', type: 'string' })
  .option('passphrase', { alias: 'p', describe: 'The passphrase used for encrypting the exam', type: 'string' })
  .option('nsa-scripts', { alias: 'n', describe: 'The NSA scripts zip', type: 'string' })
  .option('security-codes', { alias: 's', describe: 'Security codes JSON file', type: 'string' })
  .option('private-key', { alias: 'k', description: 'Private key used for signing the exam files.', type: 'string' })
  .demandOption(['exam', 'passphrase', 'nsa-scripts', 'private-key'])
  .check(a => {
    accessSync(a.exam)
    accessSync(a['nsa-scripts'])
    if (a['security-codes']) {
      accessSync(a['security-codes'])
    }
    accessSync(a['private-key'])
    return true
  }).argv
;(async () => {
  const attachmentsDir = path.resolve(path.dirname(argv.exam), 'attachments')
  const resolveAttachment = (attachment: string) => path.resolve(attachmentsDir, attachment)
  const sourceXml = await fs.readFile(argv.exam, 'utf-8')
  const nsaScripts = createReadStream(argv['nsa-scripts'])
  const securityCodesPath = argv['security-codes']
  const securityCodes = securityCodesPath ? createReadStream(securityCodesPath) : null
  const answersPrivateKey = await fs.readFile(argv['private-key'], 'utf-8')

  const results = await masterExam(sourceXml, () => uuid.v4(), getMediaMetadataFromLocalFile(resolveAttachment))
  const outdir = argv.outdir ? path.resolve(argv.outdir) : path.dirname(argv.exam)
  await fs.mkdir(outdir, { recursive: true })

  for (const { language, xml, attachments } of results) {
    const extname = path.extname(argv.exam)
    const outputFilename = path.basename(argv.exam, extname) + '_' + language + '.mex'
    const outputStream = createWriteStream(path.resolve(outdir, outputFilename))
    await createMex(
      xml,
      attachments.map(({ filename, restricted }: { filename: string; restricted: boolean }) => ({
        filename,
        restricted,
        contents: createReadStream(resolveAttachment(filename))
      })),
      nsaScripts,
      securityCodes,
      argv.passphrase,
      answersPrivateKey,
      outputStream
    )
  }
})()
