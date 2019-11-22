const _ = require('lodash')

const ns = { e: 'http://ylioppilastutkinto.fi/exam.xsd' }

function createGradingStructure(masteredDoc) {
  assertAbittiCompatibleGradingStructure(masteredDoc)

  const sectionElements = masteredDoc.find('//e:section', ns)
  const questions = _.flatMap(sectionElements, sectionElement =>
    findClosestChildQuestions(sectionElement)
      .map(questionElement => createQuestions(questionElement))
      .flat()
  )

  return { questions }
}

const assertAbittiCompatibleGradingStructure = masteredDoc => {
  // Abitti (and koe/ktpjs?) currently only supports for XML exams:
  // (1) max 2 levels of questions
  // (2) single or multiple text- or rich-text-answers within question. Same question cannot
  // contain both sub-questions and answers.

  // (TODO) Support for partial autograded answers would be relatively easy to implement with
  // these restrictions: For now asserted, since tests, shuffling support,
  // etc. are missing.
  // (3) single choice-answer within second level question. the first level question in these
  // can only contain this kind of 2nd level questions.
  // (4) multiple dropdown-answers within top-level question
  // (5) only text content within choice-answer-option and dropdown-answer-option

  // exam.xml in addition would support at least:
  // (a) multiple answers of any type within the same questions
  // (b) question hierarchy of any depth
  // (c) html end exam.xsd elements within choice-answer-option and dropdown-answer-option

  assertMaxTwoLevelsOfQuestions(masteredDoc) // (1)
  assertNoAnswersAndSubQuestionsWithinSameQuestion(masteredDoc) // (2)
  assertNoChoicesOrDropdownAnswers(masteredDoc) // (TODO)
  assertAllChoiceAnswersWithinIndependentSecondLevelQuestions(masteredDoc) // (3)
  assertAllDropdownAnswersWithinTopLevelQuestions(masteredDoc) // (4)
  assertOnlyTextContentWithinOptions(masteredDoc) // (5)
}

const assertMaxTwoLevelsOfQuestions = masteredDoc => {
  const questionElementsAt3rdLevel = masteredDoc.find('.//e:question//e:question//e:question', ns)
  if (questionElementsAt3rdLevel.length > 0) {
    throw new Error('Too deep question hierarchy, max 2 supported')
  }
}

const assertNoAnswersAndSubQuestionsWithinSameQuestion = masteredDoc => {
  const answerElements = masteredDoc.find(
    './/e:text-answer | .//e:scored-text-answer | .//e:choice-answer | .//e:dropdown-answer',
    ns
  )

  answerElements.forEach(answerElement => {
    const questionElement = findParentQuestion(answerElement)
    const childQuestionElements = findClosestChildQuestions(questionElement)
    if (childQuestionElements.length > 0) {
      throw new Error('Question contains both answer(s) and sub-question(s)')
    }
  })
}

const assertNoChoicesOrDropdownAnswers = masteredDoc => {
  const answerElements = masteredDoc.find('.//e:choice-answer | .//e:dropdown-answer', ns)

  if (answerElements.length > 0) {
    throw new Error('Choices and dropdowns are not supported for now')
  }
}

const assertAllChoiceAnswersWithinIndependentSecondLevelQuestions = masteredDoc => {
  const choiceAnswerElements = masteredDoc.find('.//e:choice-answer', ns)

  choiceAnswerElements.forEach(choiceAnswerElement => {
    if (getQuestionHierarchyDepth(choiceAnswerElement) !== 2) {
      throw new Error('Choice answer not within 2nd level question')
    }
    const questionElement = findParentQuestion(choiceAnswerElement)
    const answerElements = findChildAnswers(questionElement)
    if (answerElements.length !== 1) {
      throw new Error('2nd level question with choice answer with more than one child answer')
    }

    const parentQuestionElement = findParentQuestion(questionElement)
    const nonChoiceAnswerElements = parentQuestionElement.find(
      './/e:text-answer | .//e:scored-text-answer | .//e:dropdown-answer',
      ns
    )

    if (nonChoiceAnswerElements > 0) {
      throw new Error('top-level choice question with other answer types')
    }
  })
}

const assertAllDropdownAnswersWithinTopLevelQuestions = masteredDoc => {
  const dropdownAnswerElements = masteredDoc.find('.//e:dropdown-answer', ns)

  dropdownAnswerElements.forEach(dropdownAnswerElement => {
    if (getQuestionHierarchyDepth(dropdownAnswerElement) !== 1) {
      throw new Error('Dropdown answer not within top-level question')
    }
    const questionElement = findParentQuestion(dropdownAnswerElement)
    const nonDropdownAnswerElements = questionElement.find(
      './/e:text-answer | .//e:scored-text-answer | .//e:choice-answer',
      ns
    )
    if (nonDropdownAnswerElements.length > 0) {
      throw new Error('Non-dropdown-answers within same question as dropdown-answers')
    }
  })
}

const assertOnlyTextContentWithinOptions = masteredDoc => {
  const optionElements = masteredDoc.find('.//e:dropdown-answer-option | .//e:choice-answer-option', ns)

  optionElements.forEach(optionElement => {
    const childNodes = optionElement.childNodes()
    const childNodeCount = childNodes.length
    const childNodeElementName = childNodeCount ? childNodes[0].name() : undefined
    if (childNodeCount !== 1 || childNodeElementName !== 'text') {
      throw new Error('Non-text content within option elements')
    }
  })
}

const findClosestChildQuestions = element => {
  const parentQuestionHierarchyDepth = getQuestionHierarchyDepth(element)
  return element
    .find('.//e:question', ns)
    .filter(questionElement => getQuestionHierarchyDepth(questionElement) === parentQuestionHierarchyDepth + 1)
}

const createQuestions = questionElement => {
  const isDropdownQuestion = questionElement.find('.//e:dropdown-answer', ns).length > 0
  if (isDropdownQuestion) {
    return [createDropdownQuestion(questionElement)]
  } else {
    return findChildAnswers(questionElement).map(answerElement => createNonDropdownQuestion(answerElement))
  }
}

const createDropdownQuestion = questionElement => {
  const parentDisplayNumber = questionElement.attr('display-number').value()
  const maxScore = Number(questionElement.attr('max-score').value())
  const text = ''
  const type = 'multichoicegap'

  const answerElements = questionElement.find('.//e:dropdown-answer', ns)

  // Get id of the parent question from the first answer element's id
  const id = Number(answerElements[0].attr('question-id').value()) * 100000

  const content = answerElements
    .map(answerElement => {
      // If there is only single answer as a direct child of a question, use the
      // question's display-number directly.
      const displayNumber = `${parentDisplayNumber}${answerElement.attr('display-number').value()}`

      const id = Number(answerElement.attr('question-id').value())
      const maxScore = Number(answerElement.attr('max-score').value())

      const options = createOptions('e:dropdown-answer-option', id, maxScore, answerElement)

      return [
        {
          type: 'text',
          text: displayNumber
        },
        {
          id,
          type: 'gap',
          options
        }
      ]
    })
    .flat()

  return {
    maxScore,
    displayNumber: parentDisplayNumber,
    text,
    id,
    type,
    content
  }
}

const findChildAnswers = element =>
  element.find('.//e:text-answer | .//e:scored-text-answer | .//e:choice-answer | .//e:dropdown-answer', ns)

const createNonDropdownQuestion = answerElement => {
  const parentDisplayNumber = findDisplayNumberOfParentQuestion(answerElement)
  const hasSiblings = hasSiblingAnswers(answerElement)

  const id = Number(answerElement.attr('question-id').value())

  // If there is only single answer as a direct child of a question, use the
  // question's display-number directly.
  const displayNumber = hasSiblings
    ? `${parentDisplayNumber}${answerElement.attr('display-number').value()}`
    : parentDisplayNumber

  const maxScore = Number(answerElement.attr('max-score').value())

  switch (answerElement.name()) {
    case 'text-answer':
    case 'scored-text-answer': {
      return {
        type: 'text',
        id,
        displayNumber,
        maxScore
      }
    }
    case 'choice-answer': {
      return createChoiceGroup('e:choice-answer-option', id, displayNumber, maxScore, answerElement)
    }
    default:
      throw new Error(`Unsupported answer type: ${answerElement.name()}`)
  }
}

// Display numbers have max 2 digits from question:
// Therefore with higher question hierarchy we need to search further up
const findDisplayNumberOfParentQuestion = element => {
  const potentialParent = element.parent()
  if (potentialParent.name() !== 'question') {
    return findDisplayNumberOfParentQuestion(potentialParent)
  }
  const hierarchyDepth = getQuestionHierarchyDepth(potentialParent)

  if (hierarchyDepth <= 2) {
    return potentialParent.attr('display-number').value()
  } else {
    return findDisplayNumberOfParentQuestion(potentialParent)
  }
}

const hasSiblingAnswers = answerElement => {
  const hierarchyDepth = getQuestionHierarchyDepth(answerElement)
  const questionElement = findParentQuestion(answerElement)

  const siblings = findChildAnswers(questionElement).filter(answerElement => {
    // Filter out the deeper levels
    return getQuestionHierarchyDepth(answerElement) == hierarchyDepth
  })

  return siblings.length > 1
}

const findParentQuestion = element => {
  const maybeQuestions = element.find('.//ancestor::e:question[1]', ns)
  return maybeQuestions ? maybeQuestions[0] : null
}

const getQuestionHierarchyDepth = element => (element.path().match(/e:question/g) || []).length

const createChoiceGroup = (childElementName, id, displayNumber, maxScore, answerElement) => {
  const options = createOptions(childElementName, id, maxScore, answerElement)

  // Don't render text at all, since filling the correct content within it would require parsing and sanitizing
  // HTML content from the exam
  const text = ''
  const choices = [
    {
      id: 100000 * id,
      type: 'choice',
      text,
      displayNumber,
      options
    }
  ]

  return {
    maxScore,
    displayNumber,
    id,
    type: 'choicegroup',
    choices
  }
}

const createOptions = (childElementName, answerId, answerMaxScore, answerElement) => {
  return answerElement.find(`.//${childElementName}`, ns).map((answerOption, i) => {
    const id = answerId * 100000 + i + 1

    // If the option contains html or e: elements, don't try to add the content to the structure,
    // since it would not render correctly or at all in grading UIs.
    const childNodes = answerOption.childNodes()
    const childNodeCount = childNodes.length
    const childNodeElementName = childNodeCount ? childNodes[0].name() : undefined
    const text =
      childNodeCount === 1 && childNodeElementName === 'text'
        ? answerOption.text()
        : `Vaihtoehto ${i + 1} / Alternativ ${i + 1}`

    const maybeScore = answerOption.attr('score')
    const score = maybeScore ? Number(maybeScore.value()) : 0
    const correct = score == answerMaxScore
    return {
      id,
      text,
      correct,
      score
    }
  })
}

module.exports = {
  createGradingStructure
}
