import R from 'ramda'
import { ns } from './schema'

/**
 * Generates HVP.
 *
 * @param {import("libxmljs2").Document} doc
 * @param {string} targetLanguage
 * @returns string
 */
export const createHvp = (doc, targetLanguage) => {
  const cleanString = (input) => input.trim().replace(/\s+/g, ' ')
  const nodeContains = (elementName, node) => {
    return node.find(`.//${elementName}`, ns).length > 0
  }

  const findQuestionTypes = (node) => {
    const elementNamesToTypes = {
      'fi-FI': {
        'e:scored-text-answer': 'keskitetysti arvosteltava tekstivastaus',
        'e:choice-answer': 'monivalintavastaus',
        'e:dropdown-answer': 'monivalintavastaus',
        'e:text-answer': 'tekstivastaus',
      },
      'sv-FI': {
        'e:scored-text-answer': 'centraliserat bedömt textsvar',
        'e:choice-answer': 'flervalssvar',
        'e:dropdown-answer': 'flervalssvar',
        'e:text-answer': 'textsvar',
      },
    }

    const elementNamesToTypesInTargetLanguage = elementNamesToTypes[targetLanguage]

    return Object.keys(elementNamesToTypesInTargetLanguage)
      .map((elementName) => (nodeContains(elementName, node) ? elementNamesToTypesInTargetLanguage[elementName] : null))
      .filter((x) => x !== null)
  }

  const optionsWithScoresString = function (node, optionElementName) {
    const prefix =
      optionElementName === 'e:choice-answer-option' ? '-' : R.last(getDisplayNumber(node).split('.')) + '.'
    return node
      .find(`.//${optionElementName}[@score]`, ns)
      .map((o) => `${prefix} ${cleanString(o.text())} (${o.attr('score').value()} p.)`)
      .join('\n')
  }

  const getAttributeValue = (attributeName) => (node) => node.attr(attributeName).value()
  const getMaxScore = getAttributeValue('max-score')
  const getScore = getAttributeValue('score')
  const getDisplayNumber = getAttributeValue('display-number')

  const nodeToStrings = function (node) {
    switch (node.name()) {
      case 'exam-title':
        return [cleanString(node.text())]
      case 'section': {
        const sectionTitle = cleanString(node.get('./e:section-title', ns).text())
        return [
          `\n### ${targetLanguage === 'sv-FI' ? 'Del' : 'Osa'} ${getDisplayNumber(
            node
          )}: ${sectionTitle} (${getMaxScore(node)} p.)`,
        ]
      }
      case 'question': {
        const displayNumber = getDisplayNumber(node)
        const isTopLevelQuestion = !displayNumber.includes('.')
        const answerTypesInQuestion = findQuestionTypes(node)
        const questionTitle = cleanString(node.find('e:question-title', ns)[0].text())
        return [
          `\n${isTopLevelQuestion ? '#### ' : ''}${displayNumber}. ${questionTitle} (${getMaxScore(node)} p.) ${
            isTopLevelQuestion ? '' : '(' + answerTypesInQuestion.join(', ') + ')'
          }\n`,
        ]
      }
      case 'choice-answer': {
        return [optionsWithScoresString(node, 'e:choice-answer-option')]
      }
      case 'scored-text-answer': {
        return [
          `- ${getDisplayNumber(node)}. ${node.get('./e:hint', ns)?.text().trim() ?? ''}\n${node
            .find('.//e:accepted-answer[@score]', ns)
            .map((elem) => `    - ${cleanString(elem.text())} (${getScore(elem)} p.)`)
            .join('\n')}`,
        ]
      }
      case 'dropdown-answer': {
        return [optionsWithScoresString(node, 'e:dropdown-answer-option')]
      }
      default:
        return []
    }
  }

  const processNode = (node) => {
    if (node.type() !== 'element') {
      return []
    }

    const childNodes = node.childNodes()
    return childNodes.length !== 0 ? [...nodeToStrings(node), ...childNodes.map(processNode)] : []
  }

  return R.flatten(doc.childNodes().map(processNode)).join('\n').trim()
}
