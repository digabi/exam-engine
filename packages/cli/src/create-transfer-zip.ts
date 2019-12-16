#!/usr/bin/env node

import { getMediaMetadataFromLocalFile, masterExam, ns, parseExam } from '@digabi/exam-engine-mastering'
import { asElements } from '@digabi/exam-engine-mastering/dist/mastering/utils'
import { createReadStream, createWriteStream, promises as fs } from 'fs'
import path from 'path'
import uuid from 'uuid'
import yargs from 'yargs'
import yazl from 'yazl'
import { resolveExam } from './utils'

// tslint:disable-next-line: no-unused-expression
yargs
  .command(
    '$0 <examFilename> [outputDirectory]',
    'Creates a transfer zip for importing to Abitti',
    yargsc =>
      yargsc
        .positional('examFilename', {
          coerce: resolveExam
        })
        .positional('outputDirectory', { type: 'string', description: 'The output directory' })
        .demandOption(['examFilename']),
    async ({ examFilename, outputDirectory }) => {
      try {
        const examDirname = path.dirname(examFilename)
        const finalOutputDirectory = outputDirectory || examDirname
        const xml = await fs.readFile(examFilename, 'utf-8')
        const resolveAttachment = (src: string) => path.resolve(examDirname, 'attachments', src)

        // Hack: Do the exam localization before mastering to work around abitti
        // not supporting multi-language exams.
        const doc = parseExam(xml)
        const languages = doc
          .root()!
          .find('//e:languages/e:language/text()', ns)
          .map(String)
        for (const language of languages) {
          const localizedXml = localize(xml, language)
          const [{ attachments }] = await masterExam(
            localizedXml,
            () => uuid.v4(),
            getMediaMetadataFromLocalFile(resolveAttachment)
          )
          const outputFilename = path.resolve(
            finalOutputDirectory,
            `${path.basename(examDirname)}_${language}_transfer.zip`
          )
          const zipFile = new yazl.ZipFile()
          zipFile.addBuffer(Buffer.from(localizedXml), 'exam.xml')

          const attachmentsZipFile = new yazl.ZipFile()
          zipFile.addReadStream(attachmentsZipFile.outputStream, 'attachments.zip')

          for (const attachment of attachments) {
            attachmentsZipFile.addReadStream(
              createReadStream(resolveAttachment(attachment.filename)),
              attachment.filename
            )
          }
          attachmentsZipFile.end()

          zipFile.outputStream.pipe(createWriteStream(path.resolve(outputFilename)))
          zipFile.end()
        }
      } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(err)
        process.exit(1)
      }
    }
  )
  .help().argv

function localize(xml: string, language: string): string {
  const doc = parseExam(xml)
  const root = doc.root()!

  asElements(root.find('.//e:language', ns)).forEach(element => {
    if (element.text() !== language) {
      element.remove()
    }
  })

  asElements(root.find('//e:localization', ns)).forEach(element => {
    if (element.attr('lang')?.value() === language) {
      for (const childNode of element.childNodes()) {
        element.addPrevSibling(childNode)
      }
    }
    element.remove()
  })

  asElements(root.find(`//e:*[@lang and @lang!='${language}']`, ns)).forEach(element => element.remove())

  return doc.toString(false)
}
