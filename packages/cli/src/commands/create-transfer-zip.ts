import { ExamType, getMediaMetadataFromLocalFile, masterExam, ns, parseExam } from '@digabi/exam-engine-mastering'
import { createReadStream, createWriteStream, promises as fs } from 'fs'
import { Element } from 'libxmljs2'
import _ from 'lodash'
import { Ora } from 'ora'
import path from 'path'
import * as uuid from 'uuid'
import yazl from 'yazl'
import { examName } from '../utils'

export default async function createTransferZip({
  exam,
  outdir = path.dirname(exam),
  spinner
}: {
  exam: string
  outdir?: string
  spinner: Ora
}): Promise<void> {
  const examDirname = path.dirname(exam)
  const xml = await fs.readFile(exam, 'utf-8')
  const resolveAttachment = (src: string) => path.resolve(examDirname, 'attachments', src)
  spinner.start(`Creating a transfer zips for ${exam}...`)

  // Hack: Do the exam localization before mastering to work around abitti
  // not supporting multi-language exams.
  const doc = parseExam(xml, true)
  for (const examVersion of doc.find<Element>('./e:exam-versions/e:exam-version', ns)) {
    const type = (examVersion.attr('exam-type')?.value() ?? 'normal') as ExamType
    const language = examVersion.attr('lang')!.value()
    const localizedXml = localize(xml, language, type)
    const results = await masterExam(localizedXml, () => uuid.v4(), getMediaMetadataFromLocalFile(resolveAttachment), {
      removeCorrectAnswers: false
    })
    const typeSuffix = type === 'visually-impaired' ? '_vi' : type === 'hearing-impaired' ? '_hi' : ''
    const outputFilename = path.resolve(outdir, `${examName(exam)}_${language}${typeSuffix}_transfer.zip`)

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

function localize(xml: string, language: string, type: ExamType): string {
  const doc = parseExam(xml)

  doc.find<Element>('.//e:exam-version', ns).forEach(element => {
    if (getAttribute(element, 'lang') !== language || !getAttribute(element, 'exam-type', 'normal')?.includes(type)) {
      element.remove()
    }
  })

  doc.find<Element>('//e:localization', ns).forEach(element => {
    if (
      getAttribute(element, 'lang', language) === language &&
      getAttribute(element, 'exam-type', type)?.includes(type)
    ) {
      for (const childNode of element.childNodes()) {
        element.addPrevSibling(childNode)
      }
    }

    element.remove()
  })

  doc.find<Element>(`//e:*[@lang and @lang!='${language}']`, ns).forEach(element => element.remove())
  doc
    .find<Element>(`//e:*[@exam-type and not(contains(@exam-type, '${type}'))]`, ns)
    .forEach(element => element.remove())

  return doc.toString(false)
}

function getAttribute<T extends string>(element: Element, localName: string, defaultValue?: T) {
  return element.attr(localName)?.value() ?? defaultValue
}
