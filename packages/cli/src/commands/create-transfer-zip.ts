import { getMediaMetadataFromLocalFile, masterExam, ns, parseExam } from '@digabi/exam-engine-mastering'
import { asElements } from '@digabi/exam-engine-mastering/dist/mastering/utils'
import { createReadStream, createWriteStream, promises as fs } from 'fs'
import _ from 'lodash'
import { Ora } from 'ora'
import path from 'path'
import uuid from 'uuid'
import yazl from 'yazl'
import { examName } from '../utils'

export default async function({
  exam,
  outdir = path.dirname(exam),
  spinner
}: {
  exam: string
  outdir?: string
  spinner: Ora
}) {
  const examDirname = path.dirname(exam)
  const xml = await fs.readFile(exam, 'utf-8')
  const resolveAttachment = (src: string) => path.resolve(examDirname, 'attachments', src)

  spinner.start(`Creating a transfer zips for ${exam}...`)

  // Hack: Do the exam localization before mastering to work around abitti
  // not supporting multi-language exams.
  const doc = parseExam(xml)
  const languages = doc
    .root()!
    .find('//e:languages/e:language/text()', ns)
    .map(String)
  for (const language of languages) {
    const localizedXml = localize(xml, language)
    const results = await masterExam(localizedXml, () => uuid.v4(), getMediaMetadataFromLocalFile(resolveAttachment))
    const outputFilename = path.resolve(outdir, `${examName(exam)}_${language}_transfer.zip`)

    const zipFile = new yazl.ZipFile()
    zipFile.addBuffer(Buffer.from(localizedXml), 'exam.xml')

    const attachmentsZipFile = new yazl.ZipFile()
    zipFile.addReadStream(attachmentsZipFile.outputStream, 'attachments.zip')

    const attachments = _.chain(results)
      .flatMap(r => r.attachments)
      .map(a => a.filename)
      .uniq()
      .value()
    for (const attachment of attachments) {
      attachmentsZipFile.addReadStream(createReadStream(resolveAttachment(attachment)), attachment)
    }
    attachmentsZipFile.end()

    zipFile.outputStream.pipe(createWriteStream(path.resolve(outputFilename)))
    zipFile.end()

    spinner.succeed(outputFilename)
  }
}

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
