import type { CareerTimelineEntry } from '../engine/careerTypes'
import { TimelineEventCard } from './TimelineEventCard'

export function CareerTimeline({ entries, limit }: { entries: CareerTimelineEntry[]; limit?: number }) {
  const visible = [...entries].reverse().slice(0, limit ?? entries.length)
  return (
    <div className="career-timeline">
      {visible.map((entry, index) => <TimelineEventCard key={entry.id} entry={entry} active={index === 0} />)}
    </div>
  )
}
