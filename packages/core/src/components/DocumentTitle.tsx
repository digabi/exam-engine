import React from 'react'

type DocumentTitleProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>

export default class DocumentTitle extends React.PureComponent<DocumentTitleProps> {
  private ref: React.RefObject<HTMLHeadingElement>

  constructor(props: DocumentTitleProps) {
    super(props)
    this.ref = React.createRef()
  }

  componentDidMount() {
    this.updateTitle()
  }

  componentDidUpdate() {
    this.updateTitle()
  }

  updateTitle() {
    if (this.ref.current) {
      const title = this.ref.current.textContent!
      document.title = title
    }
  }

  render() {
    return <h1 {...this.props} ref={this.ref} />
  }
}
