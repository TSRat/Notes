import { Award, CircleDot, Flag, MoveRight, Radio, Shield, Trophy } from 'lucide-react'
import type { CareerTimelineEntry } from '../engine/careerTypes'
import { ClubWordmark } from './ClubWordmark'

const ICONS = {
  'career-start': Flag,
  decision: CircleDot,
  season: Shield,
  transfer: MoveRight,
  'national-team': Radio,
  achievement: Award,
  retirement: Trophy,
}

export function TimelineEventCard({ entry, active = false }: { entry: CareerTimelineEntry; active?: boolean }) {
  const Icon = ICONS[entry.type]
  return (
    <article className={`timeline-event timeline-event--${entry.tone}${active ? ' is-active' : ''}`}>
      <div className="timeline-event__rail" aria-hidden="true"><Icon size={16} /></div>
      <div className="timeline-event__body">
        <div className="timeline-event__meta"><span>{entry.seasonYear}</span><span>{entry.age} 岁</span><span>{entry.type.replace('-', ' ')}</span></div>
        <h3>{entry.title}</h3>
        <p>{entry.detail}</p>
        {entry.clubId ? <ClubWordmark clubId={entry.clubId} compact /> : null}
      </div>
    </article>
  )
}
