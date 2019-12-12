#!/usr/bin/env node

import { resolveExam } from '@digabi/exam-engine-exams'
import { previewExam } from '@digabi/exam-engine-rendering'
import path from 'path'
import yargs from 'yargs'

// tslint:disable-next-line: no-unused-expression
yargs
  .command(
    '$0 [examFilename]',
    'Starts the exam preview.',
    yargsc => yargsc.positional('examFilename', { default: resolveExam('MexDocumentation/MexDocumentation.xml') }),
    async ({ examFilename }) => {
      try {
        await previewExam(path.resolve(process.cwd(), examFilename), { openFirefox: true })
      } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(err)
        process.exit(1)
      }
    }
  )
  .help().argv
