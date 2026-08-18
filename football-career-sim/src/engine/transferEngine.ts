import { getAssociation, getWorldClub, worldClubs, type ClubProfile } from '../data/world/worldData'
import type { ClubRole, PlayerPosition } from '../domain/types'
import type { SimCareer, TransferOffer } from './careerTypes'
import { pickOne, randomInt, type RandomState } from './random'

function roleFor(overall: number, clubStrength: number): ClubRole {
  const difference = overall - clubStrength
  if (difference >= 3) return 'key-player'
  if (difference >= -2) return 'starter'
  if (difference >= -7) return 'rotation'
  if (difference >= -13) return 'prospect'
  return 'surplus'
}

function positionLabel(position: PlayerPosition) {
  if (position === 'GK') return '门将位置'
  if (['RB', 'RWB', 'LB', 'LWB'].includes(position)) return '边路位置'
  if (position === 'CB') return '中后卫位置'
  if (['DM', 'CM', 'AM'].includes(position)) return '中场位置'
  if (['RW', 'LW'].includes(position)) return '边锋位置'
  return '中锋位置'
}

function createOffer(career: SimCareer, club: ClubProfile, state: RandomState, isLoan: boolean) {
  const role = roleFor(career.player.overall, club.strengthBaseline.rating)
  const years = randomInt(state, isLoan ? 1 : 2, isLoan ? 1 : 5)
  const fitNoise = randomInt(years.state, -8, 8)
  const fit = Math.max(30, Math.min(95, 68 + (club.developmentProfile.academy - 75) / 3 + fitNoise.value))
  const salaryTier = Math.max(1, Math.min(5, Math.round((club.strengthBaseline.rating - 58) / 8)))
  const offer: TransferOffer = {
    clubId: club.id,
    role,
    contractYears: years.value,
    salaryTier,
    fit,
    isLoan,
    knownFacts: [
      `预计角色：${role}`,
      `${positionLabel(career.player.primaryPosition)}竞争取决于季前表现`,
      club.developmentProfile.pathway,
      `${club.city} · ${club.stadium}`,
    ],
  }
  return { offer, state: fitNoise.state }
}

export function generateStartingClubOffers(
  nationality: string,
  randomState: RandomState,
): { clubIds: string[]; state: RandomState } {
  const domestic = worldClubs.filter((club) => club.countryId === nationality)
  const pool = domestic.length >= 3 ? domestic : worldClubs.filter((club) => club.strengthBaseline.rating <= 84)
  const selected: string[] = []
  let state = randomState

  while (selected.length < Math.min(3, pool.length)) {
    const result = pickOne(state, pool.filter((club) => !selected.includes(club.id)))
    selected.push(result.value.id)
    state = result.state
  }

  return { clubIds: selected, state }
}

export function generateTransferOffers(career: SimCareer, randomState: RandomState) {
  const current = getWorldClub(career.player.currentClubId)
  const currentAssociation = current ? getAssociation(current.countryId) : undefined
  const targetStrength = career.player.overall + (career.player.age <= 23 ? 8 : 3)
  const plausible = worldClubs.filter((club) => {
    if (club.id === career.player.currentClubId) return false
    const gap = Math.abs(club.strengthBaseline.rating - targetStrength)
    return gap <= 13
  })
  const fallback = plausible.length >= 3 ? plausible : worldClubs.filter((club) => club.id !== career.player.currentClubId)
  const selected: ClubProfile[] = []
  let state = randomState

  const differentConfederation = fallback.filter((club) => {
    const association = getAssociation(club.countryId)
    return association?.confederation !== currentAssociation?.confederation
  })
  if (differentConfederation.length > 0) {
    const first = pickOne(state, differentConfederation)
    selected.push(first.value)
    state = first.state
  }

  while (selected.length < 3) {
    const remaining = fallback.filter((club) => !selected.some((selectedClub) => selectedClub.id === club.id))
    if (remaining.length === 0) break
    const next = pickOne(state, remaining)
    selected.push(next.value)
    state = next.state
  }

  const offers: TransferOffer[] = []
  for (const club of selected) {
    const isLoan = career.player.age <= 22 && career.player.clubRole !== 'starter' && career.player.clubRole !== 'key-player'
    const result = createOffer(career, club, state, isLoan)
    offers.push(result.offer)
    state = result.state
  }

  return { offers, state }
}

export function selectTransferTarget(career: SimCareer, mode: 'strongest' | 'different-confederation' | 'best-fit') {
  if (career.transferOffers.length === 0) return undefined
  const currentClub = getWorldClub(career.player.currentClubId)
  const currentConfederation = currentClub ? getAssociation(currentClub.countryId)?.confederation : undefined

  if (mode === 'strongest') {
    return [...career.transferOffers].sort((a, b) => (getWorldClub(b.clubId)?.strengthBaseline.rating ?? 0) - (getWorldClub(a.clubId)?.strengthBaseline.rating ?? 0))[0]
  }
  if (mode === 'different-confederation') {
    return career.transferOffers.find((offer) => getAssociation(getWorldClub(offer.clubId)?.countryId ?? '')?.confederation !== currentConfederation)
      ?? career.transferOffers[0]
  }
  return [...career.transferOffers].sort((a, b) => b.fit - a.fit)[0]
}
