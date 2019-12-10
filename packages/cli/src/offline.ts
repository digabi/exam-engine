import { createOfflineExam } from '@digabi/exam-engine-rendering'
import path from 'path'
import yargs from 'yargs'

// tslint:disable-next-line: no-unused-expression
yargs
  .command(
    '$0 <examFilename> <outputDirectory>',
    'Starts the exam preview.',
    yargsc =>
      yargsc
        .positional('examFilename', {
          description: 'The source exam XML file',
          type: 'string'
        })
        .positional('outputDirectory', { description: 'The output directory', type: 'string' })
        .option('prerender', { type: 'boolean', description: 'Prerender the HTML with Puppeteer', default: false })
        .demandOption(['examFilename', 'outputDirectory', 'prerender']),
    async ({ examFilename, outputDirectory, prerender }) => {
      try {
        await createOfflineExam(path.resolve(process.cwd(), examFilename), outputDirectory, prerender)
      } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(err)
        process.exit(1)
      }
    }
  )
  .help().argv
