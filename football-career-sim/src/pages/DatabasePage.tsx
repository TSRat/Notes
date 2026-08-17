import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EncyclopediaPanel } from '../components/EncyclopediaPanel'

export function DatabasePage() {
  return (
    <AppShell pageLabel="DATABASE / DIRECT ENTRY">
      <main id="main-content" className="database-page">
        <header className="route-intro">
          <div>
            <p className="eyebrow">FOOTBALL ENCYCLOPEDIA</p>
            <h1>每个概念，都会在生涯里发生。</h1>
            <p>这里不是与游戏分开的课程目录。战术、合同、文化、医学、裁判、治理与球场运行，都从你可能亲历的职业事件进入，并回到具体选择。</p>
          </div>
          <Link className="secondary-button" to="/career"><ArrowLeft aria-hidden="true" size={18} /> 返回职业中心</Link>
        </header>
        <EncyclopediaPanel />
      </main>
    </AppShell>
  )
}
