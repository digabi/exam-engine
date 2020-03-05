import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import Downshift from 'downshift'
import * as _ from 'lodash-es'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { findChildElement, getNumericAttribute, mapChildElements, NBSP } from '../dom-utils'
import * as fonts from '../fonts'
import { AppState } from '../store'
import * as actions from '../store/answers/actions'
import { QuestionContext } from './QuestionContext'
import { Score } from './Score'
import { ChoiceAnswer as ChoiceAnswerT, ExamComponentProps } from './types'

interface DropdownAnswerProps extends ExamComponentProps {
  saveAnswer: typeof actions.saveAnswer
  answer?: ChoiceAnswerT
}

const menuBorderWidthPx = 2
const roundingErrorCompensationPx = 1
const noAnswer = ''
const runningInBrowser = !navigator.userAgent.includes('jsdom/')

type Item = Element | typeof noAnswer

function DropdownAnswer({ element, renderChildNodes, saveAnswer, answer }: DropdownAnswerProps) {
  const questionId = getNumericAttribute(element, 'question-id')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const displayNumber = element.getAttribute('display-number')!
  const currentlySelectedItem =
    answer &&
    answer.value &&
    findChildElement(element, childElement => answer.value === childElement.getAttribute('option-id'))

  const onChange = (selectedAnswer: '' | Element | null) => {
    const value = selectedAnswer ? selectedAnswer.getAttribute('option-id')! : ''
    saveAnswer({ type: 'choice', questionId, value, displayNumber })
  }

  const labelRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const [measuring, setMeasuring] = useState(true)

  if (runningInBrowser) {
    // Force a re-measure if element changes or fonts are loaded after this
    // component has been rendered.
    const [, setFontsLoaded] = useState(fonts.loaded)
    fonts.ready.then(() => setFontsLoaded(true))

    useEffect(() => setMeasuring(true), [element])

    useEffect(() => {
      if (measuring && menuRef.current && labelRef.current) {
        const menuEl = menuRef.current
        const labelEl = labelRef.current
        const preferredWidth = _.max(mapChildElements(menuEl, el => el.firstElementChild!.scrollWidth))!

        // Run the DOM mutations on the next frame to avoid layout trashing in exams with lots of dropdowns.
        const requestId = requestAnimationFrame(() => {
          labelEl.style.width = preferredWidth + menuBorderWidthPx + roundingErrorCompensationPx + 'px'
          setMeasuring(false)
        })
        return () => cancelAnimationFrame(requestId)
      }
    })
  }

  const items: Item[] = [noAnswer, ...element.children]
  const { answers } = useContext(QuestionContext)

  return (
    <span className="e-nowrap">
      <Downshift
        itemToString={item => (item ? item.textContent! : '')}
        onChange={onChange}
        initialSelectedItem={currentlySelectedItem}
      >
        {({
          getItemProps,
          getMenuProps,
          getLabelProps,
          getToggleButtonProps,
          highlightedIndex,
          isOpen,
          selectedItem
        }) => (
          <span className={classNames('e-dropdown-answer e-normal')}>
            <div
              className={classNames('e-dropdown-answer__toggle-button e-columns', {
                'e-dropdown-answer__toggle-button--open': isOpen
              })}
              tabIndex="0"
              {...getToggleButtonProps()}
            >
              <span className="e-dropdown-answer__label e-column e-pad-l-1 e-pad-r-4" {...getLabelProps()}>
                <div className="e-ellipsis" ref={labelRef}>
                  {selectedItem ? renderChildNodes(selectedItem) : NBSP}
                </div>
              </span>
              <span
                className={classNames(
                  'e-dropdown-answer__toggle-icon e-text-center e-column e-column--narrow e-column--gapless e-color-link'
                )}
              >
                <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
              </span>
            </div>
            <div
              {...getMenuProps({
                className: classNames('e-dropdown-answer__menu', { 'e-dropdown-answer__menu--open': isOpen }),
                ref: menuRef
              })}
            >
              {items.map((item, i) => (
                // tslint:disable-next-line: jsx-key
                <div
                  className={classNames('e-dropdown-answer__menu-item e-pad-l-1 e-pad-r-4', {
                    'e-dropdown-answer__menu-item--selected': item === selectedItem,
                    'e-bg-color-off-white': highlightedIndex !== i,
                    'e-bg-color-lighterblue': highlightedIndex === i
                  })}
                  {...getItemProps({
                    item,
                    index: i,
                    key: i
                  })}
                >
                  {/* Use a wrapper element to exclude menu item padding when calculating the scroll width. */}
                  <div className={classNames('e-dropdown-answer__menu-item-inner', { 'e-nowrap': measuring })}>
                    {item ? renderChildNodes(item) : NBSP}
                  </div>
                </div>
              ))}
            </div>
          </span>
        )}
      </Downshift>
      {answers.length > 1 && <Score score={maxScore} size={'inline'} />}
    </span>
  )
}

function mapStateToprops(state: AppState, { element }: ExamComponentProps) {
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = state.answers.answersById[questionId] as ChoiceAnswerT | undefined
  return { answer }
}

export default connect(mapStateToprops, {
  saveAnswer: actions.saveAnswer
})(DropdownAnswer)
