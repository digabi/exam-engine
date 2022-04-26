import { exec } from 'child_process'
import { promisify } from 'util'
const execAsync = promisify(exec)

describe('cli', () => {
  it('prints help', async () => {
    let output = ''
    try {
      await execAsync('yarn ee')
    } catch ({ stderr }) {
      output = stderr as string
    }
    expect(output).toBe(`Usage: index.js <command> [options]

Commands:
  index.js new <directory>                       Create a new exam
  index.js preview [exam] [options]              Preview an exam  [aliases: start]
  index.js create-transfer-zip [exam] [options]  Create a transfer zip that can be imported to Oma Abitti
  index.js create-offline [exam] [options]       Create a standalone offline version of the exam.
  index.js create-mex [exam] [options]           Package the exam to a .mex file that can be imported by Abitti
  index.js migrate [exam]                        Convert an exam to the latest schema.

Options:
  --help     Show help  [boolean]
  --version  Show version number  [boolean]

Not enough non-option arguments: got 0, need at least 1
[2K[1G[31merror[39m Command failed with exit code 1.
`)
  })
})
