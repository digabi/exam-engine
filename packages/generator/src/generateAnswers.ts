import { ChoiceGroupQuestion, ExamAnswer, GradingStructure, TextQuestion } from '@digabi/exam-engine-core'
import _ from 'lodash'

export function generateAnswers(gradingStructure: GradingStructure): ExamAnswer[] {
  return _.flatMap(gradingStructure.questions, question => {
    switch (question.type) {
      case 'text':
        return generateTextAnswer(question)
      case 'choicegroup':
        return generateChoiceAnswer(question)
      case 'audio':
        return []
    }
  })
}

function generateTextAnswer(question: TextQuestion): ExamAnswer[] {
  const value = `Answer to question ${question.displayNumber}`
  return [
    {
      questionId: question.id,
      type: 'text',
      characterCount: getCharacterCount(value),
      value
    }
  ]
}

function generateChoiceAnswer(question: ChoiceGroupQuestion): ExamAnswer[] {
  return question.choices.map((choice, i) => {
    const option = choice.options[i % choice.options.length]
    return {
      questionId: choice.id,
      type: 'choice',
      value: String(option.id)
    }
  })
}

function getCharacterCount(answerText: string) {
  return answerText.replace(/\s/g, '').length
}
