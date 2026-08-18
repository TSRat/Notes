import type { CSSProperties } from 'react'
import type { ClubProfile } from '../data/world/worldData'

export type ClubThemeStyle = CSSProperties & {
  '--club-primary': string
  '--club-secondary': string
  '--club-ink': string
  '--club-glow': string
}

export function getClubThemeStyle(club?: ClubProfile): ClubThemeStyle | undefined {
  if (!club) return undefined
  return {
    '--club-primary': club.traditionalColors.primary,
    '--club-secondary': club.traditionalColors.secondary,
    '--club-ink': club.traditionalColors.ink,
    '--club-glow': `color-mix(in srgb, ${club.traditionalColors.primary} 22%, transparent)`,
  }
}
