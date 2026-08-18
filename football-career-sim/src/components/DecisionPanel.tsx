import { Clock3, CornerDownRight } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { CareerEventInstance } from '../engine/careerTypes'

type TimerStyle = CSSProperties & { '--decision-seconds': string }

export function DecisionPanel({ event, onChoose, onExpire }: { event: CareerEventInstance; onChoose: (choiceId: string) => void; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(event.timedSeconds)
  const expirySent = useRef(false)
  const expired = remaining === 0

  useEffect(() => {
    setRemaining(event.timedSeconds)
    expirySent.current = false
  }, [event.instanceId, event.timedSeconds])

  useEffect(() => {
    if (remaining === null || remaining <= 0) return
    const timer = window.setTimeout(() => setRemaining(remaining - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [remaining])

  useEffect(() => {
    if (remaining !== 0 || expirySent.current) return
    expirySent.current = true
    onExpire()
  }, [onExpire, remaining])

  return (
    <section className="decision-panel" aria-labelledby={`decision-${event.instanceId}`}>
      <div className="decision-panel__topline">
        <span>KEY MOMENT · {event.stage.toUpperCase()}</span>
        {remaining !== null ? <strong className={remaining <= 3 ? 'is-urgent' : ''}><Clock3 aria-hidden="true" /> {expired ? '窗口已关闭' : `${remaining} 秒`}</strong> : <strong>结果不会被提前揭示</strong>}
      </div>
      {event.timedSeconds ? (
        <div className="pressure-track" aria-hidden="true"><span key={event.instanceId} style={{ '--decision-seconds': `${event.timedSeconds}s` } as TimerStyle} /></div>
      ) : null}
      <h2 id={`decision-${event.instanceId}`}>{event.title}</h2>
      <p>{event.summary}</p>
      <div className="decision-options">
        {event.choices.map((choice, index) => (
          <button key={choice.id} type="button" disabled={expired} onClick={() => onChoose(choice.id)}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{choice.label}</strong>
            <small>{choice.riskTag}</small>
            <CornerDownRight aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="decision-panel__contract">你能看到已知条件与风险方向，但成功概率不会显示。相同选择在不同生涯中可能产生不同结果。</p>
      {remaining !== null ? <span className="visually-hidden" aria-live="assertive">{expired ? '决定窗口已经关闭' : `还剩 ${remaining} 秒`}</span> : null}
    </section>
  )
}
