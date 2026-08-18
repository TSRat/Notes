import { ArrowLeft, Radio, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { ClubWordmark } from '../components/ClubWordmark'
import { getClubThemeStyle } from '../components/clubTheme'
import { DecisionPanel } from '../components/DecisionPanel'
import { ToastRegion } from '../components/ToastRegion'
import { getWorldClub, worldClubs } from '../data/world/worldData'
import { expireCareerEvent, resolveCareerEvent } from '../engine/careerEngine'

export function MatchdayPage() {
  const { id = '' } = useParams()
  const { state, dispatch } = useCareer()
  const [resolved, setResolved] = useState<{ title: string; detail: string } | null>(null)
  if (state.lifecycle === 'loading') return <div className="loading-screen"><span>91</span><p>正在接入比赛信号…</p></div>
  if (!state.career) return <Navigate to="/create" replace />
  const career = state.career
  const event = career.pendingEvents.find((candidate) => candidate.instanceId === id)
  const club = getWorldClub(career.player.currentClubId)
  const opponents = worldClubs.filter((candidate) => candidate.competitionId === club?.competitionId && candidate.id !== club.id)
  const opponent = opponents[Math.abs(id.length + career.seasonIndex) % Math.max(1, opponents.length)] ?? worldClubs.find((candidate) => candidate.id !== club?.id)

  const choose = (choiceId: string) => {
    if (!event) return
    const update = resolveCareerEvent(career, event.instanceId, choiceId)
    const notice = update.notices[0]
    setResolved({ title: notice?.title ?? '决定已经记录', detail: notice?.detail ?? '比赛继续。' })
    dispatch({ type: 'replace-career', payload: update })
  }

  const expire = () => {
    if (!event) return
    const update = expireCareerEvent(career, event.instanceId)
    const notice = update.notices[0]
    setResolved({ title: notice?.title ?? '决定窗口已经关闭', detail: notice?.detail ?? '未行动已经写入职业记录。' })
    dispatch({ type: 'replace-career', payload: update })
  }

  if (!event && !resolved) {
    return (
      <div className="matchday-page" style={getClubThemeStyle(club)}><main className="route-error"><ShieldAlert /><p className="eyebrow">MATCH SIGNAL CLOSED</p><h1>这次比赛决定已经结束</h1><p>比赛记录已经回到职业时间线，或者该链接不属于当前存档。</p><Link className="secondary-button" to="/career"><ArrowLeft /> 返回职业中心</Link></main></div>
    )
  }

  return (
    <div className="matchday-page" style={getClubThemeStyle(club)}>
      <header className="matchday-header"><Link to="/career" className="text-link"><ArrowLeft /> 职业中心</Link><span><Radio /> LIVE SIMULATION · 外部消息已静音</span><span>{career.seasonYear}/{String(career.seasonYear + 1).slice(-2)}</span></header>
      <main id="main-content" className="matchday-main">
        <section className="live-scoreboard" aria-label={`${club?.zhName} 对 ${opponent?.zhName}`}>
          <div className="live-scoreboard__meta"><span>模拟关键比赛</span><span>{club?.stadium}</span><span>第 74 分钟</span></div>
          <div className="live-scoreboard__teams"><ClubWordmark clubId={club?.id ?? ''} /><div><strong>—</strong><span>74'</span><strong>—</strong></div><ClubWordmark clubId={opponent?.id ?? ''} /></div>
          <div className="live-ticker"><Radio /><span>比分被暂时隐藏：你必须先处理场上决定，最终赛季结果仍由模拟引擎结算。</span></div>
        </section>
        <div className="matchday-workspace">
          <section className="broadcast-log"><p className="eyebrow">LIVE TEXT</p><h2>比赛正在向你这一侧倾斜</h2><ol><li><time>61'</time><p>对手开始收窄中路，边线附近出现了可利用空间。</p></li><li><time>68'</time><p>教练席示意保持结构，但队友已经准备向前压。</p></li><li className="is-live"><time>74'</time><p>{event?.summary ?? resolved?.detail}</p></li></ol></section>
          {event && !resolved ? <DecisionPanel event={event} onChoose={choose} onExpire={expire} /> : <section className="match-resolved"><span>DECISION RECORDED</span><h2>{resolved?.title}</h2><p>{resolved?.detail}</p><p>精确后果不会立即全部揭晓；它可能在本场赛季结算、教练信任或未来事件中显现。</p><Link className="primary-button" to="/career">回到职业时间线 <ArrowLeft /></Link></section>}
        </div>
      </main>
      <ToastRegion />
    </div>
  )
}
