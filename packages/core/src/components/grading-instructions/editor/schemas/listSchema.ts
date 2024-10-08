import { bulletList, listItem, orderedList } from 'prosemirror-schema-list'

export const listSchema = {
  ordered_list: { ...orderedList, content: 'list_item+', group: 'block' },
  bullet_list: { ...bulletList, content: 'list_item+', group: 'block' },
  list_item: { ...listItem, content: 'paragraph block*' }
}
