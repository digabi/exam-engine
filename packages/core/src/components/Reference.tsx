import React, { useContext } from 'react'
import { ExamComponentProps } from '../createRenderChildNodes'
import { findChildElement, NBSP } from '../dom-utils'
import { useExamTranslation } from '../i18n'
import { CommonExamContext } from './CommonExamContext'
import RenderChildNodes from './RenderChildNodes'

function Reference({ element, renderChildNodes }: ExamComponentProps) {
  const { t } = useExamTranslation()
  function renderWith(localName: string, Component: React.ComponentType<ExamComponentProps>) {
    const childElement = findChildElement(element, localName)
    return childElement && <Component {...{ element: childElement, renderChildNodes, key: childElement.localName }} />
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
          {t(translationKey)}{' '}
          <Component {...{ element: childElement, renderChildNodes, key: childElement.localName }} />
        </React.Fragment>
      )
    )
  }

  return (
    <span className="e-break-word">
      {t('references.source')}
      {NBSP}
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
        renderWith('note', RenderChildNodes),
      ])}
    </span>
  )
}

function Italic({ element, renderChildNodes }: ExamComponentProps) {
  return <em>{renderChildNodes(element)}</em>
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
    const { dateTimeFormatter } = useContext(CommonExamContext)
    return <>{dateTimeFormatter.format(date)}</>
  }
}

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
