import { ArrowUpRight, CalendarDays, CircleGauge, Radio, Swords } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { trackEvent } from '../app/analytics'
import type { Choice } from '../app/types'
import { getClub, newsEvents } from '../data/db'
import { AppShell } from '../components/AppShell'
import { CareerJourneyMap } from '../components/CareerJourneyMap'
import { ClubMark } from '../components/ClubMark'
import { DecisionPanel } from '../components/DecisionPanel'
import { EncyclopediaPanel } from '../components/EncyclopediaPanel'
import { ExperienceContext } from '../components/ExperienceContext'
import { HexagonStatsChart } from '../components/HexagonStatsChart'
import { MobileTabbar, type MobileTab } from '../components/MobileTabbar'
import { NewsFeedList } from '../components/NewsFeedList'
import { PanelHeader } from '../components/PanelHeader'
import { TermLink } from '../components/TermLink'

export function CareerPage() {
  const { state, dispatch } = useCareer()
  const [searchParams] = useSearchParams()
  const [mobileTab, setMobileTab] = useState<MobileTab>('career')
  const club = getClub(state.player.currentClubId)
  const urgentEvent = newsEvents.find((event) => event.type === 'urgent') ?? newsEvents[0]
  const resolved = state.player.completedChoices.includes(urgentEvent.id)

  useEffect(() => {
    if (searchParams.get('focus') === urgentEvent.id) setMobileTab('career')
    const experienceId = searchParams.get('experience')
    if (experienceId) {
      setMobileTab('career')
      window.setTimeout(() => document.getElementById(`experience-${experienceId}`)?.scrollIntoView({ block: 'center' }), 50)
    }
  }, [searchParams, urgentEvent.id])

  const choose = (choice: Choice) => {
    const previousClubId = state.player.currentClubId
    dispatch({ type: 'apply-choice', payload: { eventId: urgentEvent.id, choice } })
    trackEvent('key_choice_made', {
      eventId: urgentEvent.id,
      choiceId: choice.id,
      careerWeek: state.player.careerWeek,
    })
    if (choice.effects.currentClubId && choice.effects.currentClubId !== previousClubId) {
      trackEvent('club_changed', {
        fromClubId: previousClubId,
        toClubId: choice.effects.currentClubId,
        reasonEventId: urgentEvent.id,
      })
    }
  }

  return (
    <AppShell pageLabel="CAREER HUB / WEEK 01">
      <main id="main-content" className="career-shell">
        {state.player.isGuest ? (
          <div className="guest-banner" role="status">
            <span>访客体验档</span>
            当前使用示例球员周野。你的选择仍然可以完整体验，但刷新后不会保存。
            <Link to="/">创建自己的档案</Link>
          </div>
        ) : null}

        <div className="three-pane-layout" data-mobile-active={mobileTab}>
          <section className="career-center pane pane--center" aria-label="球员与当前决定">
            <PanelHeader
              notebook="NOTEBOOK 02"
              title="球员与俱乐部"
              meta={`赛季 ${state.player.season} · 第 ${String(state.player.careerWeek).padStart(2, '0')} 周`}
              action={<span className="live-indicator"><i /> LIVE FILE</span>}
            />

            <div className="career-hero">
              <div>
                <p className="eyebrow">CURRENT ASSIGNMENT</p>
                <h1>{state.player.name}</h1>
                <p>{state.player.position} · {state.player.playStyle}</p>
              </div>
              <ClubMark clubId={club.id} />
            </div>

            <div className="player-overview">
              <HexagonStatsChart player={state.player} />
              <dl className="career-facts">
                <div><dt><CalendarDays aria-hidden="true" size={16} /> 下一场</dt><dd>今晚 19:30</dd></div>
                <div><dt><Swords aria-hidden="true" size={16} /> 对手</dt><dd>铁谷青年队</dd></div>
                <div><dt><CircleGauge aria-hidden="true" size={16} /> 战术</dt><dd>{club.tacticsStyle}</dd></div>
              </dl>
            </div>

            <div className="club-context-grid" aria-label="当前俱乐部职业环境">
              <div><span>青训路径</span><strong>{club.academyPathway}</strong></div>
              <div><span>招募模型</span><strong>{club.recruitmentProfile}</strong></div>
              <div><span>医疗与负荷</span><strong>{club.medicalModel}</strong></div>
              <div><span>社区身份</span><strong>{club.communityIdentity}</strong></div>
            </div>

            <ExperienceContext experienceId={urgentEvent.experienceId ?? 'first-contract'} />

            {!resolved ? (
              <DecisionPanel
                eventId={urgentEvent.id}
                eyebrow="AGENT WINDOW · URGENT"
                title={urgentEvent.headline}
                prompt={urgentEvent.content}
                choices={urgentEvent.choices}
                resolved={resolved}
                onChoose={choose}
              />
            ) : (
              <section className="resolved-card">
                <span className="eyebrow">DECISION LOGGED</span>
                <h2>合同窗口已经关闭</h2>
                <p>你的选择已写入职业档案。俱乐部主题、属性与后续报道会以当前结果为准。</p>
                {state.player.currentClubId === 'red-forge' ? <p>红炉联注册将在今晚北港资格赛后生效；这会是你身穿旧队颜色的告别战。</p> : null}
                <p>赛前重点：进入右侧<TermLink termId="half-space">半空间</TermLink>后，先观察套边队友，再决定转身方向。</p>
              </section>
            )}

            <Link className="match-card" to="/match/final-qualifier">
              <span className="match-card__signal"><Radio aria-hidden="true" size={18} /> MATCHDAY 19:30</span>
              <span>
                <strong>北港竞技 <b>VS</b> 铁谷青年队</strong>
                <small>全国发展联赛 · 晋级资格赛</small>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </Link>

            <CareerJourneyMap />
          </section>

          <aside className="pane pane--news" aria-label="舆情与消息">
            <PanelHeader notebook="NOTEBOOK 01" title="舆情与消息" meta="今天 · 3 条更新" />
            <NewsFeedList events={newsEvents} activeId={urgentEvent.id} />
          </aside>

          <aside className="pane pane--database" aria-label="足球百科侧栏">
            <EncyclopediaPanel compact />
          </aside>
        </div>
      </main>

      <MobileTabbar active={mobileTab} onChange={setMobileTab} />
    </AppShell>
  )
}
