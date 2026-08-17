import { BookOpen, Building2, Newspaper, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getExperience, getTerm } from '../data/db'

const surfaceLabels = {
  news: { label: '舆情 / 社会', icon: Newspaper },
  club: { label: '俱乐部 / 竞技', icon: Building2 },
  match: { label: '比赛 / 实践', icon: Radio },
}

export function ExperienceContext({ experienceId }: { experienceId: string }) {
  const experience = getExperience(experienceId)
  if (!experience) return null

  return (
    <aside className="experience-context" aria-label="当前职业事件的足球因素">
      <div className="experience-context__intro">
        <span className="eyebrow">ONE CAREER · CONNECTED FACTORS</span>
        <strong>{experience.title}</strong>
        <p>{experience.scenario}</p>
      </div>
      <div className="experience-context__surfaces" aria-label="这个事件会进入的职业记录">
        {experience.surfaces.map((surface) => {
          const item = surfaceLabels[surface]
          const Icon = item.icon
          return <span key={surface}><Icon aria-hidden="true" size={14} /> {item.label}</span>
        })}
      </div>
      <div className="factor-list" aria-label="相关足球因素">
        {experience.factors.map((factor) => <span key={factor}>{factor}</span>)}
      </div>
      <div className="experience-context__terms">
        <BookOpen aria-hidden="true" size={15} />
        <span>需要理解：</span>
        {experience.termIds.slice(0, 4).map((termId) => {
          const term = getTerm(termId)
          return term ? <Link key={termId} to={`/database?q=${encodeURIComponent(term.title)}`}>{term.title}</Link> : null
        })}
      </div>
    </aside>
  )
}
