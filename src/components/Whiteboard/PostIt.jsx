import { useRef, useState, useEffect } from 'react'

// Inclinação determinística (leve), derivada do id — não persiste no backend.
function tiltFor(id) {
  return ((id % 7) - 3) // -3..+3 graus
}

export default function PostIt({ postit, zIndex, boardRef, canDrag, canDelete, onMoveCommit, onDelete }) {
  // Posição local (em %) — atualizada durante o arraste, confirmada no servidor ao soltar.
  const [pos, setPos] = useState({ x: postit.xPct ?? 50, y: postit.yPct ?? 50 })
  const [dragging, setDragging] = useState(false)
  const movedRef = useRef(false)

  // Se o servidor mandar uma posição nova (polling) e não estivermos arrastando, sincroniza.
  useEffect(() => {
    if (!dragging) setPos({ x: postit.xPct ?? 50, y: postit.yPct ?? 50 })
  }, [postit.xPct, postit.yPct, dragging])

  function pointFromEvent(e) {
    const rect = boardRef.current?.getBoundingClientRect()
    if (!rect) return null
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    }
  }

  function handlePointerDown(e) {
    if (!canDrag) return
    e.preventDefault()
    e.stopPropagation() // impede o pan do fundo do quadro
    e.currentTarget.setPointerCapture(e.pointerId)
    movedRef.current = false
    setDragging(true)
  }

  function handlePointerMove(e) {
    if (!dragging) return
    const p = pointFromEvent(e)
    if (p) {
      movedRef.current = true
      setPos(p)
    }
  }

  function handlePointerUp(e) {
    if (!dragging) return
    setDragging(false)
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* noop */ }
    if (movedRef.current) {
      onMoveCommit(postit.id, { xPct: pos.x, yPct: pos.y })
    }
  }

  const tilt = dragging ? 0 : tiltFor(postit.id)
  const isPhoto = postit.type === 'PHOTO'

  return (
    <div
      className={`postit ${isPhoto ? 'postit-photo' : 'postit-text'}${dragging ? ' dragging' : ''}${canDrag ? ' draggable' : ''}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex,
        transform: `translate(-50%, -50%) rotate(${tilt}deg)`,
        background: isPhoto ? '#fff' : (postit.color || '#FFF8B8'),
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {canDelete && (
        <button
          className="postit-delete"
          title="Remover post-it"
          onPointerDown={e => e.stopPropagation()}
          onClick={() => onDelete(postit.id)}
        >
          ×
        </button>
      )}

      {isPhoto ? (
        <>
          <div className="postit-photo-img">
            <img src={postit.imageBase64} alt={postit.text || 'foto'} draggable={false} />
          </div>
          <p className="postit-caption">{postit.text}</p>
        </>
      ) : (
        <p className="postit-message">{postit.text}</p>
      )}

      <span className="postit-author">{postit.authorName}</span>
    </div>
  )
}
