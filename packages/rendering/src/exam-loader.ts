import { Attachment, getMediaMetadataFromLocalFile, masterExam } from '@digabi/exam-engine-mastering'
import { promises as fs } from 'fs'
import { SyntaxError } from 'libxmljs2'
import _ from 'lodash'
import path from 'path'
import * as uuid from 'uuid'
import webpack from 'webpack'

function stringifyModule(module: any, attachments: Attachment[] = []): string {
  const imports = attachments.map((attachment) => `require('./attachments/${attachment.filename}')`).join('\n')
  return imports + '\nmodule.exports = ' + JSON.stringify(module)
}

export default async function examLoader(this: webpack.loader.LoaderContext, source: string): Promise<void> {
  const callback = this.async()!
  const baseDir = path.dirname(this.resourcePath)
  const resolveAttachment = (attachment: string) => path.resolve(baseDir, 'attachments', attachment)
  const getMediaMetadata = getMediaMetadataFromLocalFile(resolveAttachment)
  const UUID = uuid.v4()
  const generateUuid = () => UUID

  try {
    const results = await masterExam(source, generateUuid, getMediaMetadata, { removeHiddenElements: false })
    const module = { original: source, results }

    const attachments = _.chain(results)
      .flatMap((r) => r.attachments)
      .uniqWith(_.isEqual)
      .value()
    await Promise.all(attachments.map((attachment) => fs.access(resolveAttachment(attachment.filename))))

    callback(null, stringifyModule(module))
  } catch (err) {
    if (isLibXmlError(err)) {
      const isParseError = err.domain === 1

      if (isParseError) {
        callback(null, stringifyModule({ original: source, mastered: [] }))
      } else {
        callback(beautifyError(err, source))
      }
    } else {
      callback(err)
    }
  }
}

function isLibXmlError(err: unknown): err is SyntaxError {
  return Object.prototype.hasOwnProperty.call(err, 'domain')
}

function beautifyError(error: SyntaxError & Error, source: string) {
  const { line, column, message } = error

  const sourceLines = source.split('\n')
  const offendingLine = sourceLines[line! - 1]

  error.message = `${message}
Rivi ${line!}, sarake ${column}:

${offendingLine}
${column > 0 ? '-'.repeat(column) + '^' : '^'.repeat(offendingLine.length)}
`
  return error
}
