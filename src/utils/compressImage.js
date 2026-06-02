// Lê um File de imagem, redimensiona e devolve um data URL JPEG (base64).
// Usado pelo ImagePicker (capa de evento) e pelos post-its polaroid do quadro.
export function compressImage(file, { maxW = 1200, maxH = 500, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        const ratio = Math.min(maxW / width, maxH / height, 1)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
