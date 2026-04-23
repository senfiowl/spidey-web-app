'use client'
import { useState, useEffect } from 'react'

const KEY = 'spidey:preview'
const EVENT = 'spidey:previewchange'

export function usePreviewMode() {
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    setPreview(localStorage.getItem(KEY) === 'true')
    const handler = () => setPreview(localStorage.getItem(KEY) === 'true')
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  const toggle = () => {
    const next = localStorage.getItem(KEY) !== 'true'
    localStorage.setItem(KEY, String(next))
    window.dispatchEvent(new Event(EVENT))
  }

  return { preview, toggle }
}
