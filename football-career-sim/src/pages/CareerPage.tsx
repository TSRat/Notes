import { ArrowRight, CalendarCheck, ChevronRight, CircleEllipsis, Radio, Trophy } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { AppShell } from '../components/AppShell'
import { CareerStatusBar } from '../components/CareerStatusBar'
import { CareerTimeline } from '../components/CareerTimeline'
import { ClubWordmark } from '../components/ClubWordmark'
import { DecisionPanel } from '../components/DecisionPanel'
import { SeasonLedger } from '../components/SeasonLedger'
import { getEventTemplate, getWorldClub } from '../data/world/worldData'
import { advanceCareerSeason, expireCareerEvent, resolveCareerEvent } from '../engine/careerEngine'

export function CareerPage() {
  const { state, dispatch } = useCareer()
  if (state.lifecycle === 'loading') return <div className="loading-screen"><span>91</span><p>正在读取职业档案…</p></div>
  if (!state.career) return <Navigate to="/create" replace />
  const career = state.career
  const currentEvent = career.pendingEvents[0]
  const currentTemplate = currentEvent ? getEventTemplate(currentEvent.templateId) : undefined
  const club = getWorldClub(career.player.currentClubId)

  const choose = (choiceId: string) => {
    if (!currentEvent) return
    const update = resolveCareerEvent(career, currentEvent.instanceId, choiceId)
    dispatch({ type: 'replace-career', payload: update })
  }

  const advance = () => {
    const update = advanceCareerSeason(career)
    dispatch({ type: 'replace-career', payload: update })
  }

  const expire = () => {
    if (!currentEvent) return
    const update = expireCareerEvent(career, currentEvent.instanceId)
    dispatch({ type: 'replace-career', payload: update })
  }

  return (
    <AppShell pageLabel="CAREER / LIVE FILE">
      <main id="main-content" className="career-page">
        <CareerStatusBar career={career} />
        <header className="career-masthead">
          <div><p className="eyebrow">{career.status === 'retired' ? 'CAREER COMPLETE' : `SEASON ${String(career.seasonIndex + 1).padStart(2, '0')} · ${career.stage.toUpperCase()}`}</p><h1>{career.status === 'retired' ? career.ending?.title : `${career.player.name} 的职业时间线`}</h1><p>{career.status === 'retired' ? career.ending?.biography : `你在 ${club?.city} 的每一个关键选择都会留下记录。普通比赛由系统推进，真正改变道路的时刻由你处理。`}</p></div>
          <ClubWordmark clubId={career.player.currentClubId} />
        </header>

        <div className="career-workspace">
          <section className="career-primary" aria-label="当前关键时刻">
            {career.status === 'retired' ? (
              <article className="retirement-callout"><Trophy /><p className="eyebrow">THE FILE IS CLOSED</p><h2>{career.ending?.title}</h2><p>{career.ending?.biography}</p><Link className="primary-button" to="/museum">进入生涯博物馆 <ArrowRight /></Link></article>
            ) : currentEvent ? (
              currentTemplate?.kind === 'match' ? (
                <article className="match-callout">
                  <div className="match-callout__signal"><Radio /><span>模拟比赛 · 关键转播</span></div>
                  <p className="eyebrow">MATCHDAY DECISION</p><h2>{currentEvent.title}</h2><p>{currentEvent.summary}</p>
                  <div className="match-callout__facts"><span>决定窗口 {currentEvent.timedSeconds ?? 10} 秒</span><span>外部消息将静音</span><span>比赛结果仍不确定</span></div>
                  <Link className="primary-button" to={`/match/${currentEvent.instanceId}`}>进入比赛日 <ChevronRight /></Link>
                </article>
              ) : <DecisionPanel event={currentEvent} onChoose={choose} onExpire={expire} />
            ) : (
              <article className="season-ready">
                <CalendarCheck /><p className="eyebrow">ALL KEY MOMENTS RESOLVED</p><h2>{career.seasonYear}/{String(career.seasonYear + 1).slice(-2)} 赛季可以结算</h2><p>系统会模拟普通比赛、出场、状态与俱乐部成绩。事实会写入赛季账本，新的关键时刻随后出现。</p><button className="primary-button" type="button" onClick={advance}>推进一个赛季 <ArrowRight /></button>
              </article>
            )}

            {career.transferOffers.length > 0 && currentTemplate && ['transfer', 'contract'].includes(currentTemplate.kind) ? (
              <section className="market-board"><header><div><p className="eyebrow">KNOWN MARKET FACTS</p><h2>经纪人带来的真实环境信息</h2></div><span>{career.transferOffers.length} 份可能路径</span></header><div>{career.transferOffers.map((offer) => <article key={offer.clubId}><ClubWordmark clubId={offer.clubId} /><dl><div><dt>预计角色</dt><dd>{offer.role}</dd></div><div><dt>战术适配</dt><dd>{offer.fit}/100</dd></div><div><dt>合同</dt><dd>{offer.contractYears} 年</dd></div></dl><ul>{offer.knownFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul></article>)}</div></section>
            ) : null}

            <section className="timeline-section"><header><div><p className="eyebrow">CHRONOLOGICAL CAREER FILE</p><h2>已经发生的事</h2></div><span>{career.timeline.length} 条记录</span></header><CareerTimeline entries={career.timeline} limit={12} /></section>
          </section>

          <aside className="career-sidebar">
            <section className="next-queue"><header><CircleEllipsis /><div><small>DECISION QUEUE</small><strong>本赛季剩余关键时刻</strong></div></header>{career.pendingEvents.length > 0 ? <ol>{career.pendingEvents.map((event, index) => <li className={index === 0 ? 'is-current' : ''} key={event.instanceId}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{event.title}</strong><small>{event.stage} · {getEventTemplate(event.templateId)?.kind}</small></div></li>)}</ol> : <p>所有关键时刻已经处理，可以推进赛季。</p>}</section>
            <section className="sidebar-section"><header><div><small>SEASON LEDGER</small><strong>最近赛季</strong></div><Link to={`/season/${career.seasonRecords.at(-1)?.seasonYear ?? career.seasonYear}`}>查看</Link></header><SeasonLedger seasons={career.seasonRecords} compact /></section>
            <section className="sidebar-section"><header><div><small>PLAYER SIGNALS</small><strong>影响下一次结果的状态</strong></div><Link to="/career/player">详情</Link></header><dl className="signal-list"><div><dt>教练信任</dt><dd>{career.player.metrics.coachTrust}</dd></div><div><dt>战术适配</dt><dd>{career.player.metrics.tacticalFit}</dd></div><div><dt>身心状态</dt><dd>{career.player.metrics.wellbeing}</dd></div><div><dt>压力</dt><dd>{career.player.metrics.pressure}</dd></div></dl><p className="fine-print">这些是已知状态，不等于成功概率。</p></section>
          </aside>
        </div>
      </main>
    </AppShell>
  )
}
