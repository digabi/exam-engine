import { renderAnnotations } from '../src/renderAnnotations'
import wrap from 'jest-snapshot-serializer-raw'

describe('renderAnnotations()', () => {
  it.each([
    // Single annotation
    [{ annotations: [{ startIndex: 0, length: 5, message: 'foo' }] }],
    // The second annotation starts where the previous one ends.
    [
      {
        annotations: [
          { startIndex: 0, length: 5, message: 'foo' },
          { startIndex: 5, length: 5, message: 'bar' },
        ],
      },
    ],
    // Two annotations with space between
    [
      {
        annotations: [
          { startIndex: 0, length: 5, message: 'foo' },
          { startIndex: 10, length: 5, message: 'bar' },
        ],
      },
    ],
  ])('renders simple text annotations', ({ annotations }) => {
    const answer = createAnswer()
    renderAnnotations(answer, annotations, 'red')
    expect(wrap(answer.innerHTML)).toMatchSnapshot()
  })

  it.each([
    // Identical annotations
    [
      {
        pregradingAnnotations: [{ startIndex: 0, length: 10, message: 'Opettaja' }],
        censorAnnotations: [{ startIndex: 0, length: 10, message: 'Sensori' }],
      },
    ],
    // Overlapping
    [
      {
        pregradingAnnotations: [{ startIndex: 0, length: 10, message: 'Opettaja' }],
        censorAnnotations: [{ startIndex: 5, length: 10, message: 'Sensori' }],
      },
    ],
  ])('renders both pregrading and censoring annotations', ({ pregradingAnnotations, censorAnnotations }) => {
    const answer = createAnswer()
    renderAnnotations(answer, pregradingAnnotations, 'blue')
    renderAnnotations(answer, censorAnnotations, 'red')
    expect(wrap(answer.innerHTML)).toMatchSnapshot()
  })

  it('rendering order does not matter', () => {
    const pregradingAnnotations = [{ startIndex: 0, length: 10, message: 'Opettaja' }]
    const censoringAnnotations = [{ startIndex: 5, length: 10, message: 'Sensori' }]

    const answer1 = createAnswer()
    renderAnnotations(answer1, pregradingAnnotations, 'blue')
    renderAnnotations(answer1, censoringAnnotations, 'red')

    const answer2 = createAnswer()
    renderAnnotations(answer2, censoringAnnotations, 'red')
    renderAnnotations(answer2, pregradingAnnotations, 'blue')

    const getAnnotation = (element: Element, message: string) =>
      Array.from(element.querySelectorAll(`mark[title="${message}"]`))
        .map((e) => e.textContent)
        .join('')

    expect(getAnnotation(answer1, 'Opettaja')).toEqual(getAnnotation(answer2, 'Opettaja'))
    expect(getAnnotation(answer1, 'Sensori')).toEqual(getAnnotation(answer2, 'Sensori'))
  })
})

function createAnswer(html = 'Lorem ipsum dolor sit amet') {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}
