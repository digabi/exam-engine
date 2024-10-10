import { MarkSpec } from 'prosemirror-model'

export const subSupSchema: MarkSpec = {
  sub: {
    parseDOM: [
      {
        tag: 'sub'
      }
    ],
    toDOM() {
      return ['sub', 0]
    }
  },
  sup: {
    parseDOM: [
      {
        tag: 'sup'
      }
    ],
    toDOM() {
      return ['sup', 0]
    }
  }
}
