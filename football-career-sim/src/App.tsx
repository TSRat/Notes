import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CareerPage } from './pages/CareerPage'
import { DatabasePage } from './pages/DatabasePage'
import { HomePage } from './pages/HomePage'
import { MatchdayPage } from './pages/MatchdayPage'
import { NotFoundPage } from './pages/NotFoundPage'

function RouteAnnouncer() {
  const location = useLocation()

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': '新建球员档案',
      '/career': '职业中心',
      '/database': '足球百科',
    }
    const pageTitle = location.pathname.startsWith('/match/') ? '比赛日' : titles[location.pathname] ?? '页面未找到'
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
        <Route path="/career" element={<CareerPage />} />
        <Route path="/database" element={<DatabasePage />} />
        <Route path="/match/:id" element={<MatchdayPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
