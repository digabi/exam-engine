import { useContext } from 'react'
import { ResultsContext } from '../context/ResultsContext'

export const useIsStudentsExamineExamPage = () => {
  const { gradingStructure } = useContext(ResultsContext)
  return gradingStructure === undefined
}
