const path = require('path')
const uuid = require('uuid')
const loaderUtils = require('loader-utils')
const _ = require('lodash')
const { getMediaMetadataFromLocalFile, mastering } = require('@digabi/mex')

function stringifyModule(obj, attachments = []) {
  const imports = attachments.map(attachment => `require('./attachments/${attachment.filename}')`).join('\n')
  return imports + '\nmodule.exports = ' + JSON.stringify(obj)
}

module.exports = async function(original) {
  const callback = this.async()
  const baseDir = path.dirname(this.resourcePath)
  const resolveAttachment = attachment => path.resolve(baseDir, 'attachments', attachment)
  const getMediaMetadata = getMediaMetadataFromLocalFile(resolveAttachment)
  const UUID = uuid.v4()
  const generateUuid = () => UUID
  const { examLanguage, generateGradingStructure } = loaderUtils.getOptions(this)

  try {
    if (examLanguage) {
      const { xml, attachments } = await mastering.masterExamForLanguage(
        original,
        examLanguage,
        generateUuid,
        getMediaMetadata,
        false,
        false,
        undefined,
        false,
        generateGradingStructure
      )
      callback(null, stringifyModule(xml, attachments))
    } else {
      const results = await mastering.masterExam(
        original,
        generateUuid,
        getMediaMetadata,
        false,
        true,
        undefined,
        false,
        generateGradingStructure
      )
      const mastered = _.fromPairs(results.map(({ language, xml }) => [language, xml]))
      const module = { original, mastered }

      callback(null, stringifyModule(module))
    }
  } catch (err) {
    const isLibXmlError = Object.prototype.hasOwnProperty.call(err, 'domain')
    const isParseError = isLibXmlError && err.domain === 1

    if (isParseError) {
      // Let browser display the syntax error for now. libxmljs seems to return
      // the _last_ parse error, which often is off by hundreds of lines.
      callback(null, stringifyModule({ original, mastered: [] }))
    } else if (isLibXmlError) {
      // If it's not a parse error, it should be an XML validation error. In this case,
      // show the offending line in the error message.
      callback(beautifyError(err, original))
    } else {
      callback(err)
    }
  }
}

function beautifyError(error, source) {
  const { line, column, message } = error

  const sourceLines = source.split('\n')
  const offendingLine = sourceLines[line - 1]

  error.message = `${message}
Rivi ${line}, sarake ${column}:

${offendingLine}
${column > 0 ? '-'.repeat(column) + '^' : '^'.repeat(offendingLine.length)}
`
  return error
}
