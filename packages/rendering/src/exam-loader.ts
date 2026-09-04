import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import esbuild from 'esbuild'
import { SyntaxError } from 'libxmljs2'
import _ from 'lodash'
import { getMediaMetadataFromLocalFile, masterExam } from '@digabi/exam-engine-mastering'

export default function examLoader(editableGradingInstructions?: boolean): esbuild.Plugin {
  const examUuid = crypto.randomUUID()
  return {
    name: 'exam',
    setup(build) {
      build.onLoad({ filter: /\.xml$/ }, async args => {
        const source = await fs.readFile(args.path, 'utf-8')
        const resolveAttachment = (filename: string) => path.resolve(path.dirname(args.path), 'attachments', filename)
        const getMediaMetadata = getMediaMetadataFromLocalFile(resolveAttachment)

        try {
          const results = await masterExam(source, () => examUuid, getMediaMetadata, {
            removeCorrectAnswers: false,
            editableGradingInstructions: Boolean(editableGradingInstructions)
          })
          const attachments = _.chain(results)
            .flatMap(result => result.attachments)
            .uniqWith(_.isEqual)
            .value()
          const attachmentPaths = attachments.map(attachment => resolveAttachment(attachment.filename))
          await Promise.all(attachmentPaths.map(filename => fs.access(filename)))

          return {
            contents: `module.exports = ${JSON.stringify({ original: source, results })}`,
            loader: 'js',
            watchFiles: [args.path, ...attachmentPaths]
          }
        } catch (err) {
          if (isLibXmlError(err) && err.domain === 1) {
            return {
              contents: `module.exports = ${JSON.stringify({ original: source, mastered: [] })}`,
              loader: 'js',
              watchFiles: [args.path]
            }
          } else {
            return { errors: [{ text: getExamErrorMessage(err, source) }] }
          }
        }
      })
    }
  }
}

function isLibXmlError(err: unknown): err is SyntaxError {
  return Object.prototype.hasOwnProperty.call(err, 'domain')
}

function getExamErrorMessage(err: unknown, source: string): string {
  if (!isLibXmlError(err)) {
    return err instanceof Error ? err.message : `Unknown error occurred: ${String(err)}`
  }

  const line = err.line ?? 0
  const column = err.column ?? 0
  const offendingLine = source.split('\n')[line - 1] ?? ''
  return `${err.message}
Rivi ${line}, sarake ${column}:

${offendingLine}
${column > 0 ? `${'-'.repeat(column)}^` : '^'.repeat(offendingLine.length)}
`
}
