import { ResolvedPos } from 'prosemirror-model'

export function getNodeFromPosition(pos: ResolvedPos, type: string) {
  for (let d = pos.depth; d > 0; d--) {
    const node = pos.node(d)
    if (node.type.name === type) {
      return node
    }
  }
  return null
}
