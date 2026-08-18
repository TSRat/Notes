import { ArrowLeft, MapPinOff } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main id="main-content" className="route-error theme-north-harbor">
      <MapPinOff aria-hidden="true" size={32} />
      <p className="eyebrow">404 / ROUTE LOST</p>
      <h1>这条职业路线不存在</h1>
      <p>返回职业中心，继续当前赛季的档案。</p>
      <Link className="secondary-button" to="/career"><ArrowLeft aria-hidden="true" size={18} /> 返回职业中心</Link>
    </main>
  )
}
