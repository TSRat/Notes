import { Earth, History, LayoutList, Plus, UserRound } from 'lucide-react'
import { type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { getWorldClub } from '../data/world/worldData'
import { ClubWordmark } from './ClubWordmark'
import { getClubThemeStyle } from './clubTheme'
import { MobileTabbar } from './MobileTabbar'
import { OverallBadge } from './OverallBadge'
import { ToastRegion } from './ToastRegion'

const SAVE_LABELS = {
  idle: '未建立存档',
  saving: '正在保存',
  saved: '已保存到本机',
  error: '保存失败',
}

export function AppShell({ children, pageLabel }: { children: ReactNode; pageLabel: string }) {
  const { state } = useCareer()
  const career = state.career
  const club = career ? getWorldClub(career.player.currentClubId) : undefined

  return (
    <div className="app-root" style={getClubThemeStyle(club)}>
      <header className="site-header">
        <Link className="brand-lockup" to="/" aria-label="第 91 分钟，返回首页">
          <span className="brand-lockup__number">91</span>
          <span><strong>第 91 分钟</strong><small>PLAYER CAREER SIMULATOR</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="主导航">
          <NavLink to="/career"><LayoutList aria-hidden="true" /> 生涯</NavLink>
          <NavLink to="/career/player"><UserRound aria-hidden="true" /> 球员</NavLink>
          <NavLink to="/world"><Earth aria-hidden="true" /> 足球世界</NavLink>
          <NavLink to="/museum"><History aria-hidden="true" /> 博物馆</NavLink>
        </nav>
        <div className="header-context">
          <span className="header-context__page">{pageLabel}</span>
          {career ? <>
            <ClubWordmark clubId={career.player.currentClubId} compact />
            <OverallBadge overall={career.player.overall} compact />
            <span className="header-context__player"><strong>{career.player.name}</strong><small>{SAVE_LABELS[state.saveStatus]}</small></span>
          </> : <Link className="header-create" to="/create"><Plus /> 新建球员</Link>}
        </div>
      </header>
      {children}
      <MobileTabbar />
      <ToastRegion />
    </div>
  )
}
