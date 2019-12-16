#!/usr/bin/env node

import { createOfflineExam } from '@digabi/exam-engine-rendering'
import { promises as fs } from 'fs'
import path from 'path'
import yargs from 'yargs'
import { resolveExam } from './utils'

// tslint:disable-next-line: no-unused-expression
yargs
  .command(
    '$0 <examFilename> [outputDirectory]',
    'Generates a static offline version of the exam ',
    yargsc =>
      yargsc
        .positional('examFilename', {
          description: 'The source exam XML file',
          coerce: resolveExam
        })
        .positional('outputDirectory', { description: 'The output directory', type: 'string' })
        .demandOption(['examFilename']),
    async ({ examFilename, outputDirectory }) => {
      const finalOutputDirectory = outputDirectory ?? path.dirname(examFilename)
      try {
        await fs.access(examFilename)
        await createOfflineExam(examFilename, finalOutputDirectory)
      } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(err)
        process.exit(1)
      }
    }
  )
  .help().argv
