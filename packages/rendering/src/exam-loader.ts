import { Attachment, getMediaMetadataFromLocalFile, masterExam } from '@digabi/exam-engine-mastering'
import { promises as fs } from 'fs'
import { SyntaxError } from 'libxmljs2'
import _ from 'lodash'
import path from 'path'
import * as uuid from 'uuid'
import webpack from 'webpack'

function stringifyModule(module: any, attachments: Attachment[] = []): string {
  const imports = attachments.map(attachment => `require('./attachments/${attachment.filename}')`).join('\n')
  return imports + '\nmodule.exports = ' + JSON.stringify(module)
}

export default async function(this: webpack.loader.LoaderContext, source: string) {
  const callback = this.async()!
  const baseDir = path.dirname(this.resourcePath)
  const resolveAttachment = (attachment: string) => path.resolve(baseDir, 'attachments', attachment)
  const getMediaMetadata = getMediaMetadataFromLocalFile(resolveAttachment)
  const UUID = uuid.v4()
  const generateUuid = () => UUID

  try {
    const results = await masterExam(source, generateUuid, getMediaMetadata)
    const module = { original: source, results }

    const attachments = _.chain(results)
      .flatMap(r => r.attachments)
      .uniqWith(_.isEqual)
      .value()
    for (const attachment of attachments) {
      await fs.access(resolveAttachment(attachment.filename))
    }

    callback(null, stringifyModule(module))
  } catch (err) {
    const isLibXmlError = Object.prototype.hasOwnProperty.call(err, 'domain')
    const isParseError = isLibXmlError && err.domain === 1

    if (isParseError) {
      // Let browser display the syntax error for now. libxmljs seems to return
      // the _last_ parse error, which often is off by hundreds of lines.
      callback(null, stringifyModule({ original: source, mastered: [] }))
    } else if (isLibXmlError) {
      // If it's not a parse error, it should be an XML validation error. In this case,
      // show the offending line in the error message.
      callback(beautifyError(err, source))
    } else {
      callback(err)
    }
  }
}

function beautifyError(error: SyntaxError & Error, source: string) {
  const { line, column, message } = error

  const sourceLines = source.split('\n')
  const offendingLine = sourceLines[line! - 1]

  error.message = `${message}
Rivi ${line}, sarake ${column}:

${offendingLine}
${column > 0 ? '-'.repeat(column) + '^' : '^'.repeat(offendingLine.length)}
`
  return error
}
