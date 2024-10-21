import React from 'react'

export const NativeDND = () => {
  let dragSrcEl: HTMLElement

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (e.preventDefault) {
      e.preventDefault()
    }

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move'
    }
    return false
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    target.classList.add('over')
    target.style.borderColor = 'red'
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    target.classList.add('over')
    target.style.borderColor = 'black'
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    if (e.stopPropagation) {
      e.stopPropagation() // stops the browser from redirecting.
    }

    if (dragSrcEl !== e.target) {
      dragSrcEl.innerHTML = (e.target as HTMLElement).innerHTML
      const target = e.target as HTMLElement
      const data = e.dataTransfer?.getData('text/html')
      console.log(data)
      target.innerHTML = e.dataTransfer.getData('text/html')
    }

    return false
  }

  function handleDragEnd(e: React.DragEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    target.style.opacity = '1'
    target.style.borderColor = 'black'

    items.forEach(item => {
      item.classList.remove('over')
    })
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    target.style.opacity = '0.4'

    dragSrcEl = e.target as HTMLElement

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/html', (e.target as HTMLElement).innerHTML)
    }
  }

  const items = document.querySelectorAll('.container .box')

  const data = [
    <div key={1}>A</div>,
    <div key={2}>B</div>,
    <div key={3}>
      <img
        style={{ pointerEvents: 'none' }}
        src="https://its-finland.fi/wp-content/uploads/2023/06/ytl-toimiliitto-1-uai-780x438-1.jpg"
        width="50"
      />
    </div>
  ]

  return (
    <div>
      <div className="container" style={{ minWidth: '100px', minHeight: '200px', background: '#fcf' }}>
        {data.map((item, index) => (
          <div
            key={index}
            draggable="true"
            className="box"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              width: '50px',
              height: '50px',
              padding: '0 50px',
              border: '2px solid black',
              display: 'grid',
              placeContent: 'center',
              marginBottom: '10px',
              transition: 'all 0.3s',
              background: 'lightblue'
            }}
          >
            {item}
          </div>
        ))}
      </div>
      <div
        className="container"
        style={{ minWidth: '100px', minHeight: '200px', background: '#ffc' }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      ></div>
    </div>
  )
}
