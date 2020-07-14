import React from 'react'

type DocumentTitleProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>

export default class DocumentTitle extends React.PureComponent<DocumentTitleProps> {
  private ref: React.RefObject<HTMLHeadingElement>

  constructor(props: DocumentTitleProps) {
    super(props)
    this.ref = React.createRef()
  }

  componentDidMount(): void {
    this.updateTitle()
  }

  componentDidUpdate(): void {
    this.updateTitle()
  }

  updateTitle = (): void => {
    if (this.ref.current) {
      document.title = this.ref.current.textContent!
    }
  }

  render(): React.ReactNode {
    return <h1 {...this.props} ref={this.ref} />
  }
}
