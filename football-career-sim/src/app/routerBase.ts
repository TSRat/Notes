export function getRouterBase(pathname = window.location.pathname) {
  const buildMarker = '/football-career-sim/dist'
  const markerIndex = pathname.indexOf(buildMarker)

  if (markerIndex >= 0) {
    return pathname.slice(0, markerIndex + buildMarker.length)
  }

  const indexFile = pathname.lastIndexOf('/index.html')
  if (indexFile >= 0) return pathname.slice(0, indexFile) || '/'

  return '/'
}
