import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getWhiteboard, activateWhiteboard, createPostIt, movePostIt, deletePostIt,
} from '../../api/whiteboardApi'
import PostIt from './PostIt'
import AddPostItModal from './AddPostItModal'
import BoardViewerModal from './BoardViewerModal'
import { exportBoardImage, downloadDataUrl } from '../../utils/boardToImage'
import './Whiteboard.css'

// ─── Tamanho fixo do quadro (em px) ──────────────────────────────────────────
// As posições dos post-its são em % (0–100) relativas a esta área. Altere aqui
// para mudar as dimensões do quadro; se não couber na tela, arrasta-se o fundo.
const BOARD_W = 1600
const BOARD_H = 1000

function formatRemaining(ms) {
  if (ms <= 0) return '00:00'
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`
}

// Posição inicial aleatória, longe das bordas (em %).
function randomPos() {
  return { xPct: 25 + Math.random() * 50, yPct: 25 + Math.random() * 50 }
}

export default function Whiteboard({ eventId, eventTitle, isOwner, participating }) {
  const { user, isGuest } = useAuth()
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [now, setNow] = useState(Date.now())
  const boardRef = useRef(null)
  const viewportRef = useRef(null)
  // Instante (epoch real do cliente) em que o quadro expira — calculado a partir
  // de (expiresAt - serverNow), o que cancela qualquer diferença de fuso horário.
  const deadlineRef = useRef(null)
  // Estado do arraste do fundo (pan).
  const panRef = useRef(null)

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getWhiteboard(eventId)
      setBoard(data)
      return data
    } catch {
      return null
    }
  }, [eventId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchBoard().finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fetchBoard])

  // Recalcula o deadline sempre que o board chega/atualiza (sincroniza com o relógio do servidor).
  useEffect(() => {
    if (board?.activated && board?.expiresAt && board?.serverNow) {
      const remaining = new Date(board.expiresAt).getTime() - new Date(board.serverNow).getTime()
      deadlineRef.current = Date.now() + remaining
    }
  }, [board?.expiresAt, board?.serverNow, board?.activated])

  // Polling enquanto o servidor considera o quadro ativo.
  useEffect(() => {
    if (!board?.active) return
    const id = setInterval(fetchBoard, 4000)
    return () => clearInterval(id)
  }, [board?.active, fetchBoard])

  // Contagem regressiva (tick de 1s) enquanto ativo.
  useEffect(() => {
    if (!board?.active) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [board?.active])

  if (loading) return null
  // Sem quadro ativado: só o dono vê (para poder ativar). Os demais não veem a seção.
  if (!board?.activated && !isOwner) return null

  const clientActive = !!board?.activated && deadlineRef.current != null && now < deadlineRef.current
  const finished = !!board?.activated && !clientActive
  const remainingMs = deadlineRef.current != null ? deadlineRef.current - now : 0
  const isFull = !!user && !isGuest
  const canPost = isFull && (participating || isOwner) && clientActive && (board?.myPostItCount ?? 0) < 2
  const postIts = board?.postIts ?? []

  async function handleActivate() {
    if (!window.confirm('Ativar o quadro? Ele ficará disponível por tempo limitado e não pode ser reativado.')) return
    setActivating(true)
    try {
      const data = await activateWhiteboard(eventId)
      setBoard(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setActivating(false)
    }
  }

  async function handleCreate(content) {
    const pos = randomPos()
    await createPostIt(eventId, { ...content, ...pos })
    await fetchBoard()
  }

  // Move otimista: reflete a nova posição imediatamente no estado (sem snap-back),
  // depois persiste; em caso de erro, recarrega do servidor.
  function handleMove(id, pos) {
    setBoard(prev => prev ? {
      ...prev,
      postIts: prev.postIts.map(p => p.id === id ? { ...p, xPct: pos.xPct, yPct: pos.yPct } : p),
    } : prev)
    movePostIt(eventId, id, pos).catch(() => fetchBoard())
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover este post-it?')) return
    try {
      await deletePostIt(eventId, id)
      await fetchBoard()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const dataUrl = await exportBoardImage({
        postIts, title: eventTitle, width: BOARD_W, height: BOARD_H,
      })
      const safe = (eventTitle || 'quadro').replace(/[^\w\-]+/g, '_')
      downloadDataUrl(dataUrl, `quadro-${safe}.png`)
    } catch {
      alert('Não foi possível gerar a imagem do quadro.')
    } finally {
      setDownloading(false)
    }
  }

  // ─── Arrastar o fundo para deslocar o quadro (pan) ─────────────────────────
  function handleBgPointerDown(e) {
    // Só paneia ao clicar no fundo, não num post-it.
    if (e.target.closest('.postit')) return
    const vp = viewportRef.current
    if (!vp) return
    panRef.current = {
      x: e.clientX, y: e.clientY,
      left: vp.scrollLeft, top: vp.scrollTop,
    }
    boardRef.current?.setPointerCapture?.(e.pointerId)
    vp.classList.add('panning')
  }

  function handleBgPointerMove(e) {
    if (!panRef.current) return
    const vp = viewportRef.current
    vp.scrollLeft = panRef.current.left - (e.clientX - panRef.current.x)
    vp.scrollTop = panRef.current.top - (e.clientY - panRef.current.y)
  }

  function handleBgPointerUp(e) {
    if (!panRef.current) return
    panRef.current = null
    try { boardRef.current?.releasePointerCapture?.(e.pointerId) } catch { /* noop */ }
    viewportRef.current?.classList.remove('panning')
  }

  return (
    <div className="whiteboard-section fade-in">
      <div className="whiteboard-header">
        <h3 className="whiteboard-title">Quadro do evento</h3>
        {board?.activated ? (
          clientActive ? (
            <span className="whiteboard-timer" title="Tempo restante">
              ⏱ {formatRemaining(remainingMs)}
            </span>
          ) : (
            <span className="whiteboard-timer ended">Encerrado</span>
          )
        ) : isOwner ? (
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 18px', fontSize: '13px' }}
            onClick={handleActivate}
            disabled={activating}
          >
            {activating ? 'Ativando...' : 'Ativar quadro'}
          </button>
        ) : null}
      </div>

      {!board?.activated && isOwner && (
        <p className="whiteboard-hint">
          Ative o quadro para que os participantes colem post-its (mensagens ou fotos polaroid)
          por tempo limitado. Só pode ser ativado uma vez.
        </p>
      )}

      {board?.activated && (
        <>
          <div className="whiteboard-board-wrap">
          <div className="whiteboard-side-controls">
            <button className="whiteboard-side-btn" onClick={() => setShowViewer(true)}>
              ⛶ Ver completo
            </button>
            {finished && (
              <button className="whiteboard-side-btn" onClick={handleDownload} disabled={downloading}>
                {downloading ? 'Gerando...' : '⬇ Baixar imagem'}
              </button>
            )}
          </div>
          <div className="whiteboard-viewport" ref={viewportRef}>
            <div
              className="whiteboard-canvas"
              ref={boardRef}
              style={{ width: BOARD_W, height: BOARD_H }}
              onPointerDown={handleBgPointerDown}
              onPointerMove={handleBgPointerMove}
              onPointerUp={handleBgPointerUp}
            >
              <div className="whiteboard-canvas-title">{eventTitle}</div>

              {postIts.length === 0 && (
                <p className="whiteboard-empty">
                  {clientActive ? 'Nenhum post-it ainda. Seja o primeiro a colar!' : 'O quadro encerrou sem post-its.'}
                </p>
              )}
              {postIts.map((p, index) => (
                <PostIt
                  key={p.id}
                  postit={p}
                  zIndex={postIts.length - index} // mais antigo (index menor) fica em cima
                  boardRef={boardRef}
                  canDrag={clientActive && p.authorId === user?.id}
                  canDelete={clientActive && (p.authorId === user?.id || isOwner)}
                  onMoveCommit={handleMove}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
          </div>

          {clientActive && (
            <div className="whiteboard-footer">
              {canPost ? (
                <button
                  className="btn-primary"
                  style={{ width: 'auto', padding: '10px 22px' }}
                  onClick={() => setShowAdd(true)}
                >
                  + Post-it
                </button>
              ) : isFull && (participating || isOwner) ? (
                <span className="whiteboard-note">Você atingiu o limite de 2 post-its.</span>
              ) : (
                <span className="whiteboard-note">Participe do evento com uma conta completa para colar post-its.</span>
              )}
            </div>
          )}
        </>
      )}

      {showAdd && (
        <AddPostItModal onCreate={handleCreate} onClose={() => setShowAdd(false)} />
      )}

      {showViewer && (
        <BoardViewerModal
          postIts={postIts}
          eventTitle={eventTitle}
          boardW={BOARD_W}
          boardH={BOARD_H}
          finished={finished}
          downloading={downloading}
          onDownload={handleDownload}
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  )
}
