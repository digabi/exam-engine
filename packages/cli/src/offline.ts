#!/usr/bin/env node

import { createOfflineExam } from '@digabi/exam-engine-rendering'
import { promises as fs } from 'fs'
import path from 'path'
import yargs from 'yargs'

// tslint:disable-next-line: no-unused-expression
yargs
  .command(
    '$0 <examFilename> <outputDirectory>',
    'Generates a static offline version of the exam ',
    yargsc =>
      yargsc
        .positional('examFilename', {
          description: 'The source exam XML file',
          type: 'string'
        })
        .positional('outputDirectory', { description: 'The output directory', type: 'string' })
        .demandOption(['examFilename', 'outputDirectory']),
    async ({ examFilename, outputDirectory }) => {
      try {
        const fullExamFilename = path.resolve(process.cwd(), examFilename)
        await fs.access(fullExamFilename)
        await createOfflineExam(path.resolve(process.cwd(), examFilename), outputDirectory)
      } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(err)
        process.exit(1)
      }
    }
  )
  .help().argv
