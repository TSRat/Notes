import { BookOpenText, Radio, UserRound } from 'lucide-react'

export type MobileTab = 'news' | 'career' | 'database'

type MobileTabbarProps = {
  active: MobileTab
  onChange: (tab: MobileTab) => void
}

export function MobileTabbar({ active, onChange }: MobileTabbarProps) {
  const items = [
    { id: 'news' as const, notebook: '01', label: '消息', icon: Radio },
    { id: 'career' as const, notebook: '02', label: '生涯', icon: UserRound },
    { id: 'database' as const, notebook: '03', label: '百科', icon: BookOpenText },
  ]

  return (
    <nav className="mobile-tabbar" aria-label="职业中心面板">
      {items.map(({ id, notebook, label, icon: Icon }) => (
        <button
          type="button"
          key={id}
          className={active === id ? 'is-active' : ''}
          aria-current={active === id ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <Icon aria-hidden="true" size={18} />
          <span><small>{notebook}</small>{label}</span>
        </button>
      ))}
    </nav>
  )
}
