import { CheckCircle2, X } from 'lucide-react'
import { useEffect } from 'react'
import { useCareer } from '../app/CareerContext'

export function ToastRegion() {
  const { state, dispatch } = useCareer()

  useEffect(() => {
    if (!state.toast) return
    const timeout = window.setTimeout(() => dispatch({ type: 'dismiss-toast' }), 5000)
    return () => window.clearTimeout(timeout)
  }, [dispatch, state.toast])

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {state.toast ? (
        <div className="toast" key={state.toast.id}>
          <CheckCircle2 aria-hidden="true" size={20} />
          <div>
            <strong>{state.toast.title}</strong>
            <p>{state.toast.detail}</p>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="关闭提示"
            onClick={() => dispatch({ type: 'dismiss-toast' })}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
