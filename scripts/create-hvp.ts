#!/usr/bin/env ts-node
/* tslint:disable:no-console */
import { accessSync, promises as fs } from 'fs'
import yargs from 'yargs'
import { generateHvpForLanguage } from '../packages/mex/src/mastering'

const argv = yargs
  .usage('-e exam-filename')
  .option('exam', { alias: 'e', describe: 'The exam XML', type: 'string' })
  .demandOption(['exam'])
  .check(a => {
    accessSync(a.exam)
    return true
  }).argv
;(async () => {
  const sourceXml = await fs.readFile(argv.exam, 'utf-8')

  const hvpFi = generateHvpForLanguage(sourceXml, 'fi-FI')
  console.log(hvpFi)
  console.log('\n\n')
  const hvpSv = generateHvpForLanguage(sourceXml, 'sv-FI')
  console.log(hvpSv)
})()
