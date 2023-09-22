import path from 'path'
import * as childPromise from 'child_process'
const exec = childPromise.exec

describe('ee preview', () => {
  const cwd = path.resolve(__dirname, '../../..')
  const controller = new AbortController()
  const { signal } = controller
  let output = ''
  let ee: childPromise.ChildProcess
  beforeAll(
    () =>
      new Promise<void>(resolve => {
        ee = exec('DISABLE_BROWSER=true npm run ee preview packages/exams/SC/SC.xml', {
          encoding: 'utf8',
          cwd,
          signal
        })
        ee.stdout?.on('data', (chunk: string) => {
          output += chunk
          if (output.includes('Press Ctrl-C to stop')) {
            controller.abort()
            resolve()
          }
        })
        ee.stdout?.on('end', () => {
          throw Error('preview stopped')
        })
      })
  )
  afterAll(() => {
    exec(`kill -9 ${ee.pid!}`)
  })
  it('logs preview starup', () => {
    expect(output).toContain(`- Previewing ${cwd}/packages/exams/SC/SC.xml...`)
    expect(output).toContain(`Server is running at http://localhost:`)
    expect(output).toContain(`Press Ctrl-C to stop`)
  })
})
