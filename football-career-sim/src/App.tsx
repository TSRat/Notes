import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CareerPage } from './pages/CareerPage'
import { CreatePlayerPage } from './pages/CreatePlayerPage'
import { HomePage } from './pages/HomePage'
import { MatchdayPage } from './pages/MatchdayPage'
import { MuseumPage } from './pages/MuseumPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlayerPage } from './pages/PlayerPage'
import { SeasonReviewPage } from './pages/SeasonReviewPage'
import { WorldPage } from './pages/WorldPage'

function RouteAnnouncer() {
  const location = useLocation()

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': '球员职业生涯模拟器',
      '/index.html': '球员职业生涯模拟器',
      '/create': '创建球员',
      '/career': '职业时间线',
      '/career/player': '球员档案',
      '/world': '足球世界',
      '/museum': '生涯博物馆',
    }
    const pageTitle = location.pathname.startsWith('/match/')
      ? '比赛日'
      : location.pathname.startsWith('/season/')
        ? '赛季账本'
        : titles[location.pathname] ?? '页面未找到'
    document.title = `${pageTitle} · 第 91 分钟`
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return <p className="visually-hidden" role="status" aria-live="polite">已进入新页面</p>
}

export default function App() {
  return (
    <>
      <RouteAnnouncer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<HomePage />} />
        <Route path="/create" element={<CreatePlayerPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/career/player" element={<PlayerPage />} />
        <Route path="/world" element={<WorldPage />} />
        <Route path="/season/:year" element={<SeasonReviewPage />} />
        <Route path="/museum" element={<MuseumPage />} />
        <Route path="/database" element={<Navigate to="/world?panel=glossary" replace />} />
        <Route path="/match/:id" element={<MatchdayPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
