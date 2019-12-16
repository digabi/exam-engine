import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { findChildElement } from '../dom-utils'
import { ExamContext } from './ExamContext'
import { ExamComponentProps } from './types'

function Reference({ element, renderChildNodes }: ExamComponentProps) {
  const { t } = useTranslation()
  function renderWith(localName: string, Component: React.ComponentType<ExamComponentProps>) {
    const childElement = findChildElement(element, localName)
    return childElement && <Component {...{ element: childElement, renderChildNodes, key: childElement.localName }} />
  }

  function renderWithPrefix(
    localName: string,
    translationKey: string,
    Component: React.ComponentType<ExamComponentProps>
  ) {
    const childElement = findChildElement(element, localName)
    return (
      childElement && (
        <React.Fragment key={childElement.localName}>
          {t(translationKey)}{' '}
          <Component {...{ element: childElement, renderChildNodes, key: childElement.localName }} />
        </React.Fragment>
      )
    )
  }

  return (
    <span className="e-break-word">
      {t('references.source')}{' '}
      {intersperse('. ', [
        renderWith('author', Span),
        renderWith('title', Italic),
        renderWith('publisher', Span),
        renderWith('publication', Span),
        renderWith('howpublished', Span),
        renderWith('url', Link),
        renderWithPrefix('publication-date', 'references.date', AsDate),
        renderWithPrefix('reference-date', 'references.reference-date', AsDate),
        renderWithPrefix('translator', 'references.translator', Span),
        renderWithPrefix('modified-by', 'references.modified-by', Span),
        renderWith('note', Span)
      ])}
    </span>
  )
}

function Span({ element, renderChildNodes }: ExamComponentProps) {
  return <span className="e-inline-block e-text-top">{renderChildNodes(element)}</span>
}

function Italic({ element, renderChildNodes }: ExamComponentProps) {
  return <em className="e-inline-block e-text-top">{renderChildNodes(element)}</em>
}

function Link({ element, renderChildNodes }: ExamComponentProps) {
  return <a href={element.textContent!}>{renderChildNodes(element)}</a>
}

function AsDate({ element }: ExamComponentProps) {
  const textContent = element.textContent!
  if (/^[0-9]{4}$/.test(textContent)) {
    return <>{textContent}</>
  } else {
    const date = new Date(textContent)
    const { dateTimeFormatter } = useContext(ExamContext)
    return <>{dateTimeFormatter.format(date)}</>
  }
}

// function surroundWith(start: string, end: string, contents: React.ReactNode[]): React.ReactNode[] {
//   const filtered = contents.filter(Boolean)
//   return filtered.length > 0 ? [start, ...filtered, end] : []
// }

function intersperse(separator: string, contents: React.ReactNode[]): React.ReactNode[] {
  return contents.filter(Boolean).reduce<React.ReactNode[]>((acc, curr, i) => {
    acc.push(curr)
    if (i !== contents.length - 1) {
      acc.push(separator)
    }
    return acc
  }, [])
}

export default React.memo(Reference)
