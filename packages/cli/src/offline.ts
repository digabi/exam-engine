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
        .demandOption(['examFilename', 'outputDirectory']),
    async ({ examFilename, outputDirectory }) => {
      try {
        await createOfflineExam(path.resolve(process.cwd(), examFilename), outputDirectory)
      } catch (err) {
        // tslint:disable-next-line: no-console
        console.error(err)
        process.exit(1)
      }
    }
  )
  .help().argv
