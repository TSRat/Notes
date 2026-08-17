import { ArrowRight, LockKeyhole, TimerReset } from 'lucide-react'
import { useEffect, useId, useState, type CSSProperties } from 'react'
import type { Choice } from '../app/types'
import { t } from '../i18n'

type DecisionPanelProps = {
  eventId: string
  eyebrow: string
  title: string
  prompt: string
  choices: Choice[]
  seconds?: number
  resolved?: boolean
  onChoose: (choice: Choice) => void
}

export function DecisionPanel({
  eventId,
  eyebrow,
  title,
  prompt,
  choices,
  seconds = 12,
  resolved = false,
  onChoose,
}: DecisionPanelProps) {
  const [remaining, setRemaining] = useState(seconds)
  const [expired, setExpired] = useState(false)
  const promptId = useId()

  useEffect(() => {
    if (resolved || expired) return
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer)
          setExpired(true)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [expired, resolved])

  const isClosed = resolved || expired

  return (
    <section className="decision-panel" aria-labelledby={`${eventId}-title`} aria-describedby={promptId}>
      <div className="decision-panel__topline">
        <span className="eyebrow eyebrow--urgent">{eyebrow}</span>
        <span
          className="timer-copy"
          role="timer"
          aria-live={remaining <= 5 && !isClosed ? 'assertive' : 'polite'}
          aria-atomic="true"
        >
          {isClosed ? (
            <><LockKeyhole aria-hidden="true" size={15} /> {resolved ? '决定已记录' : t('timer.expired')}</>
          ) : (
            <><TimerReset aria-hidden="true" size={15} /> {t('timer.remaining', { seconds: remaining })}</>
          )}
        </span>
      </div>
      <h2 id={`${eventId}-title`}>{title}</h2>
      <p id={promptId} className="decision-panel__prompt">{prompt}</p>

      <div
        className={`pressure-bar ${isClosed ? 'pressure-bar--stopped' : ''}`}
        aria-hidden="true"
        style={{ '--timer-duration': `${seconds}s` } as CSSProperties}
      >
        <span />
      </div>

      <div className="decision-list">
        {choices.map((choice, index) => (
          <button
            className="decision-button"
            type="button"
            key={choice.id}
            disabled={isClosed}
            onClick={() => onChoose(choice)}
          >
            <span className="decision-button__index">0{index + 1}</span>
            <span>
              <strong>{choice.label}</strong>
              <small>{choice.hint}</small>
            </span>
            <ArrowRight className="decision-button__arrow" aria-hidden="true" size={20} />
          </button>
        ))}
      </div>
    </section>
  )
}
