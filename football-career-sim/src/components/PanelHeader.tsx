import type { ReactNode } from 'react'

type PanelHeaderProps = {
  notebook: string
  title: string
  meta?: string
  action?: ReactNode
}

export function PanelHeader({ notebook, title, meta, action }: PanelHeaderProps) {
  return (
    <header className="panel-header">
      <div>
        <span className="notebook-tab">{notebook}</span>
        <h2>{title}</h2>
        {meta ? <p>{meta}</p> : null}
      </div>
      {action ? <div className="panel-header__action">{action}</div> : null}
    </header>
  )
}
