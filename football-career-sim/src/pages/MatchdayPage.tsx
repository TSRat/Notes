import { ArrowLeft, Radio, ShieldAlert, Timer, Trophy } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { trackEvent } from '../app/analytics'
import type { Choice } from '../app/types'
import { getClub, getMatch } from '../data/db'
import { ClubMark } from '../components/ClubMark'
import { DecisionPanel } from '../components/DecisionPanel'
import { ExperienceContext } from '../components/ExperienceContext'
import { ToastRegion } from '../components/ToastRegion'

export function MatchdayPage() {
  const { id = '' } = useParams()
  const match = getMatch(id)
  const { state, dispatch } = useCareer()
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null)

  if (!match) {
    return (
      <div className="matchday-page theme-north-harbor">
        <main id="main-content" className="route-error">
          <ShieldAlert aria-hidden="true" size={32} />
          <p className="eyebrow">MATCH NOT FOUND</p>
          <h1>这场比赛不在当前赛程里</h1>
          <p>链接可能已经失效，或者比赛尚未写入你的职业档案。</p>
          <Link className="secondary-button" to="/career"><ArrowLeft aria-hidden="true" size={18} /> 返回职业中心</Link>
        </main>
      </div>
    )
  }

  const homeClub = getClub(match.homeClubId)
  const interactiveEvent = match.events.find((event) => event.isInteractive && event.relatedChoice)
  const eventId = interactiveEvent?.id ?? 'match-decision'
  const resolved = state.player.completedChoices.includes(eventId)

  const choose = (choice: Choice) => {
    setSelectedChoice(choice)
    dispatch({ type: 'apply-choice', payload: { eventId, choice } })
    trackEvent('match_choice_made', {
      matchId: match.id,
      choiceId: choice.id,
      minute: interactiveEvent?.minute ?? match.currentMinute,
    })
  }

  return (
    <div className={`matchday-page ${homeClub.themeClass}`}>
      <header className="matchday-header">
        <Link to="/career" className="text-link"><ArrowLeft aria-hidden="true" size={17} /> 职业中心</Link>
        <span><Radio aria-hidden="true" size={16} /> LIVE TEXT · 外部消息已静音</span>
        <span>{match.competition}</span>
      </header>

      <main id="main-content" className="matchday-main">
        <section className="scoreboard" aria-label={`${homeClub.name} ${match.score.home} 比 ${match.score.away} ${match.awayName}`}>
          <div className="scoreboard__meta">
            <span>{match.date}</span>
            <span>{match.venue}</span>
          </div>
          <div className="scoreboard__teams">
            <div><ClubMark clubId={homeClub.id} /><strong>{homeClub.name}</strong></div>
            <div className="scoreboard__score">
              <span>{match.score.home}</span><i>:</i><span>{match.score.away}</span>
              <small><Timer aria-hidden="true" size={14} /> {match.currentMinute}'</small>
            </div>
            <div className="away-mark"><span>IV</span><strong>{match.awayName}</strong></div>
          </div>
          <div className="broadcast-ticker"><Radio aria-hidden="true" size={16} /><span>北港需要再进一球才能直接晋级 · 现场 2,840 人</span></div>
        </section>

        <div className="matchday-grid">
          <section className="match-log" aria-labelledby="match-log-title">
            <span className="notebook-tab">NOTEBOOK 03</span>
            <h2 id="match-log-title">比赛记录</h2>
            <ol>
              {match.events.map((event) => (
                <li key={event.id} className={event.isInteractive ? 'is-current' : ''}>
                  <time>{event.minute}'</time>
                  <span className={`event-dot event-dot--${event.type}`} />
                  <p>{event.text}</p>
                </li>
              ))}
              {selectedChoice ? (
                <li className="is-result">
                  <time>73'</time><span className="event-dot event-dot--goal" />
                  <p><strong>{selectedChoice.label}</strong>。这个决定已写入本场记录，教练席正在重新调整站位。</p>
                </li>
              ) : null}
            </ol>
          </section>

          {interactiveEvent?.relatedChoice ? (
            <div className="match-decision-stack">
              <ExperienceContext experienceId={interactiveEvent.experienceId ?? 'debut-var'} />
              <DecisionPanel
                eventId={eventId}
                eyebrow="ON-PITCH DECISION"
                title={interactiveEvent.relatedChoice.title}
                prompt={`${interactiveEvent.text} ${interactiveEvent.relatedChoice.prompt}`}
                choices={interactiveEvent.relatedChoice.choices}
                seconds={10}
                resolved={resolved}
                onChoose={choose}
              />
            </div>
          ) : (
            <section className="resolved-card">
              <Trophy aria-hidden="true" />
              <h2>比赛暂时没有新的决定</h2>
              <p>继续阅读文字播报，下一次交互会在关键事件出现时开放。</p>
            </section>
          )}
        </div>

        <Link className="match-return" to="/career"><ArrowLeft aria-hidden="true" size={18} /> 保存本场结果并返回职业中心</Link>
      </main>
      <ToastRegion />
    </div>
  )
}
