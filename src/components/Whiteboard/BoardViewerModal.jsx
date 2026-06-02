import { useState, useEffect, useRef } from 'react'
import PostIt from './PostIt'

// Visualização do quadro inteiro, escalado para caber na tela (somente leitura).
export default function BoardViewerModal({ postIts, eventTitle, boardW, boardH, finished, downloading, onDownload, onClose }) {
  const [scale, setScale] = useState(1)
  const innerRef = useRef(null)

  useEffect(() => {
    function calc() {
      const availW = window.innerWidth * 0.96
      const availH = window.innerHeight * 0.84
      setScale(Math.min(availW / boardW, availH / boardH))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [boardW, boardH])

  return (
    <div className="board-viewer-backdrop">
      <div className="board-viewer-bar">
        <span className="board-viewer-title">{eventTitle}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {finished && (
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '8px 16px' }}
              onClick={onDownload}
              disabled={downloading}
            >
              {downloading ? 'Gerando...' : '⬇ Baixar imagem'}
            </button>
          )}
          <button
            className="btn-secondary"
            style={{ width: 'auto', padding: '8px 16px' }}
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>

      <div className="board-viewer-stage">
        <div
          className="board-viewer-scaler"
          style={{ width: boardW, height: boardH, transform: `scale(${scale})` }}
        >
          <div
            className="whiteboard-canvas"
            ref={innerRef}
            style={{ width: boardW, height: boardH, cursor: 'default' }}
          >
            <div className="whiteboard-canvas-title">{eventTitle}</div>
            {postIts.map((p, index) => (
              <PostIt
                key={p.id}
                postit={p}
                zIndex={postIts.length - index}
                boardRef={innerRef}
                canDrag={false}
                canDelete={false}
                onMoveCommit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
