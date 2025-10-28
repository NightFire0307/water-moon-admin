import { useState } from 'react'

export function useModal() {
  const [open, setOpen] = useState(false)

  function show() {
    setOpen(true)
  }

  function hide() {
    setOpen(false)
  }

  return {
    open,
    show,
    hide,
  }
}
