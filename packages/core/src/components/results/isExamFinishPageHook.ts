import { useContext } from 'react'
import { ResultsContext } from '../context/ResultsContext'

export const useIsFinishExamPage = () => {
  const { gradingStructure } = useContext(ResultsContext)
  return gradingStructure === undefined
}
