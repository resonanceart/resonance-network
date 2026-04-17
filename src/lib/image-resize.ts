/**
 * Client-side image resize via <canvas>. Returns a JPEG File capped at
 * maxDimension on its longest edge. If the input isn't an image, is already
 * small enough, or anything fails, the original file is returned unchanged
 * so callers can always await this safely.
 *
 * Must run in a browser context — uses Image, FileReader, and document.
 */
export function resizeImageFile(
  file: File,
  maxDimension: number,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        if (img.width <= maxDimension && img.height <= maxDimension) {
          resolve(file)
          return
        }
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height
        if (w > h) {
          if (w > maxDimension) { h = Math.round(h * (maxDimension / w)); w = maxDimension }
        } else {
          if (h > maxDimension) { w = Math.round(w * (maxDimension / h)); h = maxDimension }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(file); return }
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return }
            const resized = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })
            resolve(resized)
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => resolve(file)
      img.src = reader.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
