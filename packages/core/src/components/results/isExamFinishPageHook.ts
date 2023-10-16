import { useContext } from 'react'
import { ResultsContext } from '../context/ResultsContext'

export const useIsStudentsFinishExamPage = () => {
  const { gradingStructure } = useContext(ResultsContext)
  return gradingStructure === undefined
}
