import React, { useContext, useState } from 'react'
import { ExamContext } from '../context/ExamContext'

export const EndExamSession = () => {
  const [examEnded, setExamEnded] = useState<boolean>(false)

  const { examServerApi } = useContext(ExamContext)

  const endExam = async () => {
    console.log('end')
    const res = await examServerApi?.endSession()
    console.log('res', res)
    const sections = document.querySelectorAll('.e-section')
    sections.forEach(section => {
      const sec = section as HTMLElement
      const sectionHeight = section.clientHeight
      sec.style.height = `${sectionHeight}px`
      section.classList.add('e-hidden')
      setExamEnded(true)
      setTimeout(() => {
        sec.style.height = '0px'
        sec.style.opacity = '0'
        sec.style.padding = '0'
        sec.style.margin = '0'
      }, 250)
    })
  }

  return (
    <div className="e-logout-container">
      <div className="e-bg-color-off-white e-pad-6 ">
        <p>
          {examEnded ? (
            'Kiitos! Sammuta vielä tietokoneesi'
          ) : (
            <>
              Kun olet tarkistanut vastauksesi, päätä koe klikkaamalla alla olevaa nappia. <br />
              Napin klikkaamisen jälkeen et voi enää palata kokeeseen.
            </>
          )}
        </p>
        {!examEnded && (
          <button className="e-button" onClick={() => void endExam()}>
            Päätä koe
          </button>
        )}
      </div>
    </div>
  )
}
