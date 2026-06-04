import { useEffect } from 'react'

export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return <div className={`toast ${type}`} onClick={onClose}>{message}</div>
}
