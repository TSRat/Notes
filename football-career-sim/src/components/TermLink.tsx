import { createPortal } from 'react-dom'
import { useRef, useState, type ReactNode } from 'react'
import { getTerm } from '../data/db'

export function TermLink({ termId, children }: { termId: string; children: ReactNode }) {
  const term = getTerm(termId)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const openTimer = useRef<number | null>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  if (!term) return <>{children}</>

  const open = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
    openTimer.current = window.setTimeout(() => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = Math.min(320, window.innerWidth - 32)
      const left = Math.min(Math.max(16, rect.left), window.innerWidth - width - 16)
      const top = Math.min(rect.bottom + 10, window.innerHeight - 190)
      setPosition({ top: Math.max(16, top), left })
    }, 200)
  }

  const close = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
    setPosition(null)
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="term-link"
        data-term={term.id}
        aria-expanded={Boolean(position)}
        aria-describedby={position ? `tooltip-${term.id}` : undefined}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        onClick={() => (position ? close() : open())}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close()
        }}
      >
        {children}
      </button>
      {position
        ? createPortal(
            <aside
              id={`tooltip-${term.id}`}
              role="tooltip"
              className="term-tooltip"
              style={{ top: position.top, left: position.left }}
            >
              <span className="eyebrow">{term.category}</span>
              <strong>{term.title}</strong>
              <p>{term.description}</p>
            </aside>,
            document.body,
          )
        : null}
    </>
  )
}
