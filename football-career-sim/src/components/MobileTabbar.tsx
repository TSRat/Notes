import { Earth, History, LayoutList, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export function MobileTabbar() {
  return (
    <nav className="mobile-tabbar" aria-label="移动端主导航">
      <NavLink to="/career"><LayoutList aria-hidden="true" /><span>生涯</span></NavLink>
      <NavLink to="/career/player"><UserRound aria-hidden="true" /><span>球员</span></NavLink>
      <NavLink to="/world"><Earth aria-hidden="true" /><span>世界</span></NavLink>
      <NavLink to="/museum"><History aria-hidden="true" /><span>博物馆</span></NavLink>
    </nav>
  )
}
