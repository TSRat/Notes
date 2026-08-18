import { ArrowLeft, Award, Goal, ShieldCheck, Star } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { AppShell } from '../components/AppShell'
import { ClubWordmark } from '../components/ClubWordmark'
import { achievementDefinitions } from '../data/world/worldData'

export function SeasonReviewPage() {
  const { year = '' } = useParams()
  const { state } = useCareer()
  if (state.lifecycle === 'loading') return <div className="loading-screen"><span>91</span><p>正在调取赛季账本…</p></div>
  if (!state.career) return <Navigate to="/create" replace />
  const season = state.career.seasonRecords.find((record) => record.seasonYear === Number(year))
  if (!season) return <AppShell pageLabel="SEASON / NOT FOUND"><main className="route-error"><p className="eyebrow">SEASON NOT FOUND</p><h1>这一季还没有写进账本</h1><Link className="secondary-button" to="/career"><ArrowLeft /> 返回职业中心</Link></main></AppShell>

  return (
    <AppShell pageLabel={`SEASON / ${season.seasonYear}`}>
      <main id="main-content" className="season-page">
        <header className="season-hero"><div><Link className="text-link" to="/career"><ArrowLeft /> 职业时间线</Link><p className="eyebrow">OFFICIAL CAREER LEDGER</p><h1>{season.seasonYear}/{String(season.seasonYear + 1).slice(-2)}</h1><p>{season.summary}</p></div><ClubWordmark clubId={season.clubId} /></header>
        <section className="season-stat-grid"><article><ShieldCheck /><span>出场</span><strong>{season.statistics.appearances}</strong><small>{season.statistics.starts} 次首发</small></article><article><Goal /><span>进球</span><strong>{season.statistics.goals}</strong><small>{season.statistics.assists} 次助攻</small></article><article><Star /><span>场均表现</span><strong>{season.statistics.averageRating.toFixed(2)}</strong><small>联赛第 {season.statistics.teamFinish} 位</small></article><article><Award /><span>奖杯</span><strong>{season.statistics.trophyCount}</strong><small>国家队新增 {season.nationalCaps} 场</small></article></section>
        <section className="season-narrative"><div><p className="eyebrow">DEVELOPMENT</p><h2>OVR {season.overallStart} → {season.overallEnd}</h2><p>赛季能力变化来自训练、出场、年龄曲线和已发生选择。它不是对真实球员或真实赛季的评价。</p></div><div><p className="eyebrow">ACHIEVEMENTS</p><h2>本季生涯印记</h2>{season.achievementIds.length ? <ul>{season.achievementIds.map((id) => <li key={id}>{achievementDefinitions.find((item) => item.id === id)?.title}</li>)}</ul> : <p>这一季没有新增印记，但它仍然构成完整生涯的一部分。</p>}</div></section>
      </main>
    </AppShell>
  )
}
