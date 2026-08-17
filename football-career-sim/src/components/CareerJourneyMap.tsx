import { ArrowRight, Check, LockKeyhole } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { CareerStage } from '../app/types'
import { careerExperiences, getTerm } from '../data/db'

const stages: Array<{ id: CareerStage; number: string; title: string; range: string }> = [
  { id: 'academy', number: '01', title: '青训与成长', range: '12–17 岁' },
  { id: 'breakthrough', number: '02', title: '职业突破', range: '17–21 岁' },
  { id: 'established', number: '03', title: '站稳一线队', range: '21–25 岁' },
  { id: 'prime', number: '04', title: '巅峰与公众角色', range: '25–30 岁' },
  { id: 'turning-point', number: '05', title: '转折与重建', range: '贯穿生涯' },
  { id: 'legacy', number: '06', title: '老将与第二职业', range: '30 岁以后' },
]

export function CareerJourneyMap() {
  const [searchParams] = useSearchParams()
  const requestedExperience = searchParams.get('experience')
  const requestedStage = careerExperiences.find((item) => item.id === requestedExperience)?.stage
  const [activeStage, setActiveStage] = useState<CareerStage>(requestedStage ?? 'breakthrough')

  useEffect(() => {
    if (requestedStage) setActiveStage(requestedStage)
  }, [requestedStage])

  const activeExperiences = useMemo(
    () => careerExperiences.filter((experience) => experience.stage === activeStage),
    [activeStage],
  )

  return (
    <section className="career-journey" aria-labelledby="career-journey-title">
      <header className="career-journey__header">
        <div>
          <span className="eyebrow">CAREER EXPERIENCE GRAPH · {careerExperiences.length} SCENARIOS</span>
          <h2 id="career-journey-title">足球世界不会分科出现在你面前</h2>
          <p>战术、合同、文化、医疗、裁判、治理和球场运行会在同一段职业时间里互相影响。下面按时间推进，不按学科拆开。</p>
        </div>
        <span className="career-journey__progress">当前生涯位置：职业突破</span>
      </header>

      <div className="career-stage-tabs" role="tablist" aria-label="生涯阶段">
        {stages.map((stage, index) => {
          const count = careerExperiences.filter((item) => item.stage === stage.id).length
          const isCurrent = stage.id === 'breakthrough'
          const isPast = index === 0
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={activeStage === stage.id}
              className={activeStage === stage.id ? 'is-active' : ''}
              onClick={() => setActiveStage(stage.id)}
            >
              <span className="career-stage-tabs__number">{isPast ? <Check aria-hidden="true" size={14} /> : isCurrent ? 'NOW' : stage.number}</span>
              <span><strong>{stage.title}</strong><small>{stage.range} · {count} 种体验</small></span>
            </button>
          )
        })}
      </div>

      <div className="career-experience-grid" role="tabpanel">
        {activeExperiences.map((experience) => {
          const isRequested = experience.id === requestedExperience
          const isCurrent = experience.id === 'first-contract'
          return (
            <article key={experience.id} id={`experience-${experience.id}`} className={isRequested || isCurrent ? 'is-highlighted' : ''}>
              <div className="career-experience-card__state">
                {isCurrent ? <span className="is-live">当前事件</span> : <span><LockKeyhole aria-hidden="true" size={12} /> 潜在经历</span>}
              </div>
              <h3>{experience.title}</h3>
              <p>{experience.scenario}</p>
              <div className="factor-list">
                {experience.factors.map((factor) => <span key={factor}>{factor}</span>)}
              </div>
              <div className="career-experience-card__terms">
                {experience.termIds.slice(0, 3).map((termId) => {
                  const term = getTerm(termId)
                  return term ? <Link key={termId} to={`/database?q=${encodeURIComponent(term.title)}`}>{term.title}</Link> : null
                })}
              </div>
            </article>
          )
        })}
      </div>

      <Link className="career-journey__database" to="/database">
        查看所有职业情境背后的足球解释 <ArrowRight aria-hidden="true" size={17} />
      </Link>
    </section>
  )
}
