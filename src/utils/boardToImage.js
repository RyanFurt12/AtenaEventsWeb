// Renderiza o quadro (fundo + post-its + título) num canvas e devolve um PNG.
// Não depende de bibliotecas externas — desenha tudo manualmente.

const COLOR_DEFAULT = '#FFF8B8'

function tiltRad(id) {
  return (((id % 7) - 3) * Math.PI) / 180 // mesma inclinação do componente PostIt
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Desenha a imagem cobrindo a área (object-fit: cover), recortando o excesso.
function drawImageCover(ctx, img, dx, dy, dw, dh) {
  const ir = img.width / img.height
  const dr = dw / dh
  let sx, sy, sw, sh
  if (ir > dr) { sh = img.height; sw = sh * dr; sx = (img.width - sw) / 2; sy = 0 }
  else { sw = img.width; sh = sw / dr; sx = 0; sy = (img.height - sh) / 2 }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

function wrapText(ctx, text, maxW) {
  const words = (text || '').split(/\s+/)
  const lines = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w }
    else cur = test
  }
  if (cur) lines.push(cur)
  return lines.length ? lines : ['']
}

export async function exportBoardImage({ postIts, title, width, height }) {
  const scale = 2 // renderiza em 2x para nitidez
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  // Fundo de cortiça
  ctx.fillStyle = '#d9b88f'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(0,0,0,0.04)'
  for (let i = 0; i < 500; i++) {
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, 1.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Pré-carrega as fotos das polaroids
  const imgs = {}
  await Promise.all(
    postIts.filter(p => p.type === 'PHOTO' && p.imageBase64).map(async (p) => {
      try { imgs[p.id] = await loadImage(p.imageBase64) } catch { /* ignora foto quebrada */ }
    })
  )

  // O mais antigo (index 0) deve ficar em cima → desenha do último para o primeiro.
  for (let i = postIts.length - 1; i >= 0; i--) {
    const p = postIts[i]
    const cx = ((p.xPct ?? 50) / 100) * width
    const cy = ((p.yPct ?? 50) / 100) * height

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(tiltRad(p.id))
    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 6

    if (p.type === 'PHOTO') {
      const W = 160, pad = 10, imgS = W - 2 * pad
      const capH = p.text ? 24 : 6
      const authH = 18
      const H = pad + imgS + capH + authH + pad
      const top = -H / 2

      ctx.fillStyle = '#fff'
      ctx.fillRect(-W / 2, top, W, H)
      ctx.shadowColor = 'transparent'

      if (imgs[p.id]) drawImageCover(ctx, imgs[p.id], -W / 2 + pad, top + pad, imgS, imgS)
      else { ctx.fillStyle = '#eee'; ctx.fillRect(-W / 2 + pad, top + pad, imgS, imgS) }

      if (p.text) {
        ctx.fillStyle = '#333'
        ctx.textAlign = 'center'
        ctx.font = "600 16px 'Segoe UI', sans-serif"
        ctx.fillText(p.text, 0, top + pad + imgS + 17)
      }
      ctx.fillStyle = 'rgba(42,42,42,0.55)'
      ctx.font = "600 11px 'Segoe UI', sans-serif"
      ctx.textAlign = 'center'
      ctx.fillText(p.authorName || '', 0, top + H - 8)
    } else {
      const W = 150, pad = 14
      ctx.font = "15px 'Segoe UI', sans-serif"
      const lines = wrapText(ctx, p.text, W - 2 * pad)
      const lineH = 20
      const H = pad + lines.length * lineH + 8 + 16 + pad
      const top = -H / 2

      ctx.fillStyle = p.color || COLOR_DEFAULT
      ctx.fillRect(-W / 2, top, W, H)
      ctx.shadowColor = 'transparent'

      ctx.fillStyle = '#3a3a2a'
      ctx.textAlign = 'left'
      let ty = top + pad + 15
      for (const ln of lines) { ctx.fillText(ln, -W / 2 + pad, ty); ty += lineH }

      ctx.fillStyle = 'rgba(42,42,42,0.55)'
      ctx.font = "600 11px 'Segoe UI', sans-serif"
      ctx.fillText(p.authorName || '', -W / 2 + pad, top + H - 8)
    }

    ctx.restore()
  }

  // Título do evento (pílula no topo, centralizada)
  if (title) {
    ctx.save()
    ctx.font = "700 22px 'Segoe UI', sans-serif"
    const tw = ctx.measureText(title).width
    const ph = 40, pw = tw + 44
    const px = width / 2 - pw / 2, py = 18
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 20); ctx.fill() }
    else ctx.fillRect(px, py, pw, ph)
    ctx.fillStyle = '#1A1D3A'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(title, width / 2, py + ph / 2)
    ctx.restore()
  }

  return canvas.toDataURL('image/png')
}

export function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}
