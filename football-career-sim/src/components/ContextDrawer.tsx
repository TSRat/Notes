import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

export function ContextDrawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose, open])

  if (!open) return null
  return (
    <div className="context-drawer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <aside role="dialog" aria-modal="true" aria-label={title}>
        <header><div><span>CONTEXT / ON DEMAND</span><h2>{title}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="关闭"><X /></button></header>
        <div className="context-drawer__content">{children}</div>
      </aside>
    </div>
  )
}
