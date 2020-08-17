import { renderAnnotations } from '../src/renderAnnotations'
import { Annotation } from '../src'
import wrap from 'jest-snapshot-serializer-raw'

describe('renderAnnotations()', () => {
  it('one text annotation', () => {
    expect(
      render('Lorem ipsum dolor sit amet', [
        {
          startIndex: 0,
          length: 5,
          message: 'foo',
        },
      ])
    ).toMatchSnapshot()
  })

  it('two text annotations, side by side', () => {
    expect(
      render('Lorem ipsum dolor sit amet', [
        { startIndex: 0, length: 5, message: 'foo' },
        { startIndex: 5, length: 5, message: 'bar' },
      ])
    ).toMatchSnapshot()
  })

  it('two text annotations with space in between', () => {
    expect(
      render('Lorem ipsum dolor sit amet', [
        { startIndex: 0, length: 5, message: 'foo' },
        { startIndex: 10, length: 5, message: 'bar' },
      ])
    ).toMatchSnapshot()
  })

  it('rect annotation', () => {
    expect(
      render(`Lorem <img src="" /> ipsum dolor sit amet`, [
        {
          type: 'rect',
          attachmentIndex: 0,
          message: 'foo',
          x: 0.25,
          y: 0.25,
          height: 0.5,
          width: 0.5,
        },
      ])
    ).toMatchSnapshot()
  })

  it('line annotation', () => {
    expect(
      render(`Lorem <img src="" /> ipsum dolor sit amet`, [
        {
          type: 'line',
          attachmentIndex: 0,
          message: 'foo',
          x1: 0.25,
          y1: 0.25,
          x2: 0.75,
          y2: 0.25,
        },
      ])
    ).toMatchSnapshot()
  })
})

function createAnswer(html: string) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

function render(html = 'Lorem ipsum dolor sit amet', annotations: Annotation[], backgroundColor = 'red') {
  const answer = createAnswer(html)
  renderAnnotations(answer, annotations, backgroundColor)
  return wrap(answer.innerHTML)
}
