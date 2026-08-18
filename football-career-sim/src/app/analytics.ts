type AnalyticsValue = string | number | boolean

export function trackEvent(name: string, properties: Record<string, AnalyticsValue> = {}) {
  window.dispatchEvent(
    new CustomEvent('career-sim:analytics', {
      detail: { name, properties },
    }),
  )
}
