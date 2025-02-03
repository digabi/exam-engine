import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { findChildElement, getBooleanAttribute, NBSP } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { CommonExamContext } from '../context/CommonExamContext'
import RenderChildNodes from '../RenderChildNodes'
import classNames from 'classnames'

function Reference({ element, renderChildNodes }: ExamComponentProps) {
  const { t } = useExamTranslation()
  function renderWith(localName: string, Component: React.ComponentType<ExamComponentProps>) {
    const childElement = findChildElement(element, localName)
    if (childElement) {
      const key = childElement.localName
      const content = <Component {...{ element: childElement, renderChildNodes, key }} />
      if (content) {
        const isHidden = getBooleanAttribute(childElement, 'hidden')
        return isHidden ? <del key={key}>{content}</del> : content
      }
    }
  }

  function renderWithPrefix(
    localName: string,
    translationKey:
      | 'references.date'
      | 'references.reference-date'
      | 'references.translator'
      | 'references.modified-by',
    Component: React.ComponentType<ExamComponentProps>
  ) {
    const childElement = findChildElement(element, localName)
    return (
      childElement && (
        <React.Fragment key={childElement.localName}>
          <span>{t(translationKey)} </span>
          <Component {...{ element: childElement, renderChildNodes, key: childElement.localName }} />
        </React.Fragment>
      )
    )
  }

  return (
    <span className={classNames('e-break-word', { 'e-line-through': getBooleanAttribute(element, 'hidden') })}>
      <span>
        {t('references.source')} {NBSP}
      </span>
      {intersperse('. ', [
        renderWith('author', RenderChildNodes),
        renderWith('title', Italic),
        renderWith('publisher', RenderChildNodes),
        renderWith('publication', RenderChildNodes),
        renderWith('howpublished', RenderChildNodes),
        renderWith('url', Link),
        renderWithPrefix('publication-date', 'references.date', AsDate),
        renderWithPrefix('reference-date', 'references.reference-date', AsDate),
        renderWithPrefix('translator', 'references.translator', RenderChildNodes),
        renderWithPrefix('modified-by', 'references.modified-by', RenderChildNodes),
        renderWith('note', RenderChildNodes)
      ])}
    </span>
  )
}

function Italic({ element, renderChildNodes }: ExamComponentProps) {
  return <em>{renderChildNodes(element)}</em>
}

function Link({ element, renderChildNodes }: ExamComponentProps) {
  return <i>{renderChildNodes(element)}</i>
}

function AsDate({ element }: ExamComponentProps) {
  const textContent = element.textContent!
  if (/^[0-9]{4}$/.test(textContent)) {
    return <span>{textContent}</span>
  } else {
    // The XML tag might contain leading or trailing whitespace, which breaks Date parsing.
    const date = new Date(textContent.trim())
    const { dateTimeFormatter } = useContext(CommonExamContext)
    return <span>{dateTimeFormatter.format(date)}</span>
  }
}

function intersperse(separator: string, contents: React.ReactNode[]): React.ReactNode[] {
  return contents.filter(Boolean).reduce<React.ReactNode[]>((acc, curr, i) => {
    acc.push(curr)
    if (i !== contents.length - 1) {
      acc.push(<span key={i}>{separator}</span>)
    }
    return acc
  }, [])
}

export default React.memo(Reference)
