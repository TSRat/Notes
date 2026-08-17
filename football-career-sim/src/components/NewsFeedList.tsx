import { AlertTriangle, Clock3 } from 'lucide-react'
import type { NewsEvent } from '../app/types'
import { TermLink } from './TermLink'

function NewsCopy({ event }: { event: NewsEvent }) {
  const termId = event.termIds[0]
  if (!termId) return <>{event.content}</>

  const termLabels: Record<string, string> = {
    'half-space': '半空间',
    'inverted-winger': '内切型边锋',
    'expected-goals': '预期进球',
  }
  const label = termLabels[termId]
  if (!label || !event.content.includes(label)) return <>{event.content}</>

  const [before, after] = event.content.split(label)
  return <>{before}<TermLink termId={termId}>{label}</TermLink>{after}</>
}

export function NewsFeedList({ events, activeId }: { events: NewsEvent[]; activeId?: string }) {
  return (
    <ol className="news-feed">
      {events.map((event) => (
        <li key={event.id} className={`news-item ${event.id === activeId ? 'news-item--active' : ''}`}>
          <div className="news-item__meta">
            <span><Clock3 aria-hidden="true" size={13} /> {event.time}</span>
            {event.type === 'urgent' ? <span className="urgent-tag"><AlertTriangle aria-hidden="true" size={13} /> 限时</span> : null}
          </div>
          <p className="news-item__source">{event.source}</p>
          <h3>{event.headline}</h3>
          <p><NewsCopy event={event} /></p>
        </li>
      ))}
    </ol>
  )
}
