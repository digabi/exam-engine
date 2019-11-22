#!/usr/bin/env node

const { promises: fs } = require('fs')
const path = require('path')
const yargs = require('yargs')
const { spawn } = require('child-process-promise')
const fsExtra = require('fs-extra')
const { format, parseISO } = require('date-fns')
const { mastering } = require('@digabi/mex')

const { exam, outdir } = yargs.command('$0 <exam> <outdir>', '', y =>
  y
    .positional('exam', { describe: 'The exam XML', type: 'string' })
    .positional('outdir', { describe: 'The output directory', type: 'string' })
).argv
const ns = { e: 'http://ylioppilastutkinto.fi/exam.xsd' }

;(async () => {
  const xml = await fs.readFile(path.resolve(process.cwd(), exam))
  const doc = mastering.parseExam(xml)

  const examCode = doc
    .root()
    .attr('exam-code')
    .value()
  const languages = doc.find('//e:languages/e:language/text()', ns).map(String)
  const examDate = parseISO(
    doc
      .root()
      .attr('date')
      .value()
  )
  const examinationPeriod =
    (examDate.getMonth() >= 5 ? 'S' : 'K') +
    examDate
      .getFullYear()
      .toString()
      .slice(-2)
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm')

  for (const language of languages) {
    await spawn(
      path.resolve(__dirname, '../node_modules/.bin/webpack'),
      [
        '-p',
        '--env.OFFLINE',
        `--env.EXAM_FILENAME=${path.resolve(process.cwd(), exam)}`,
        `--env.EXAM_LANGUAGE=${language}`
      ],
      { stdio: 'inherit', cwd: path.resolve(__dirname, '..') }
    )

    await fsExtra.ensureDir(outdir)
    await fs.copyFile(path.resolve(__dirname, '../public/offline.html'), path.resolve(__dirname, '../dist/koe.html'))
    await fs.copyFile(
      path.resolve(__dirname, '../public/offline.html'),
      path.resolve(__dirname, '../dist/aineisto.html')
    )
    await fsExtra.copy(
      path.resolve(__dirname, '../dist'),
      path.resolve(outdir, `${examCode}_${examinationPeriod}_${language}_${timestamp}`)
    )
  }
})().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err)
})
