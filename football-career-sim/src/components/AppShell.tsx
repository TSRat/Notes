import { BookOpen, Home, Radio, UserRound } from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { getClub } from '../data/db'
import { t } from '../i18n'
import { ClubMark } from './ClubMark'
import { EncyclopediaPanel } from './EncyclopediaPanel'
import { ResponsiveDrawer } from './ResponsiveDrawer'
import { ToastRegion } from './ToastRegion'

export function AppShell({ children, pageLabel }: { children: ReactNode; pageLabel: string }) {
  const { state } = useCareer()
  const navigate = useNavigate()
  const [databaseOpen, setDatabaseOpen] = useState(false)
  const club = getClub(state.player.currentClubId)
  const closeDatabase = useCallback(() => setDatabaseOpen(false), [])

  const openDatabase = () => {
    if (window.matchMedia('(max-width: 767px)').matches) navigate('/database')
    else setDatabaseOpen(true)
  }

  return (
    <div className={`app-root ${club.themeClass}`}>
      <header className="site-header">
        <Link className="brand-lockup" to="/" aria-label={`${t('brand.name')}，${t('brand.subtitle')}，返回首页`}>
          <span className="brand-lockup__number">91</span>
          <span>
            <strong>{t('brand.name')}</strong>
            <small>{t('brand.subtitle')}</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="主导航">
          <NavLink to="/" end><Home aria-hidden="true" size={16} /> {t('nav.home')}</NavLink>
          <NavLink to="/career"><UserRound aria-hidden="true" size={16} /> {t('nav.career')}</NavLink>
          <NavLink to="/match/final-qualifier"><Radio aria-hidden="true" size={16} /> {t('nav.match')}</NavLink>
          <button type="button" onClick={openDatabase}><BookOpen aria-hidden="true" size={16} /> {t('nav.database')}</button>
        </nav>

        <div className="header-context">
          <span className="header-context__page">{pageLabel}</span>
          <ClubMark clubId={club.id} compact />
          <span className="header-context__player">
            <strong>{state.player.name}</strong>
            <small>{state.player.isGuest ? t('status.visitor') : t('status.saved')}</small>
          </span>
        </div>
      </header>

      {children}

      <ResponsiveDrawer open={databaseOpen} title="足球百科" onClose={closeDatabase}>
        <EncyclopediaPanel />
      </ResponsiveDrawer>
      <ToastRegion />
    </div>
  )
}
