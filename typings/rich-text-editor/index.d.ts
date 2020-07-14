declare module 'rich-text-editor'

declare module 'rich-text-editor/dist/rich-text-editor' {
  export interface RichTextEditorOptions {
    locale: 'fi' | 'sv'
    screenshot: {
      saver: ({ data, type }: { data: any; type: string }) => Promise<string>
    }
  }
  export function makeRichText(
    element: Element,
    options: RichTextEditorOptions,
    onChange: (data: { answerHTML: string; answerText: string }) => void
  )
}
