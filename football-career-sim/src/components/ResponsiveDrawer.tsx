import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

type ResponsiveDrawerProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function ResponsiveDrawer({ open, title, onClose, children }: ResponsiveDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.classList.add('drawer-open')

    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.classList.remove('drawer-open')
      previousFocus.current?.focus()
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="drawer-layer">
      <button className="drawer-backdrop" type="button" aria-label="关闭百科抽屉" onClick={onClose} />
      <aside className="responsive-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="responsive-drawer__topbar">
          <span className="eyebrow">DATABASE / DRAWER</span>
          <button ref={closeButtonRef} className="icon-button" type="button" aria-label="关闭百科" onClick={onClose}>
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  )
}
