import { CalendarDays, HeartPulse, Shirt, UsersRound } from 'lucide-react'
import type { SimCareer } from '../engine/careerTypes'
import { getAssociation, getWorldClub } from '../data/world/worldData'
import { OverallBadge } from './OverallBadge'

const ROLE_LABELS: Record<SimCareer['player']['clubRole'], string> = {
  academy: '青训球员',
  prospect: '重点新秀',
  rotation: '轮换球员',
  starter: '常规主力',
  'key-player': '核心球员',
  captain: '队长',
  surplus: '计划外球员',
}

export function CareerStatusBar({ career }: { career: SimCareer }) {
  const club = getWorldClub(career.player.currentClubId)
  const association = career.player.nationalTeam.committedAssociationId
    ? getAssociation(career.player.nationalTeam.committedAssociationId)
    : undefined

  return (
    <section className="career-status-bar" aria-label="当前职业状态">
      <OverallBadge overall={career.player.overall} compact />
      <div><CalendarDays aria-hidden="true" /><span><small>赛季 / 年龄</small>{career.seasonYear}/{String(career.seasonYear + 1).slice(-2)} · {career.player.age} 岁</span></div>
      <div><Shirt aria-hidden="true" /><span><small>俱乐部角色</small>{club?.zhName} · {ROLE_LABELS[career.player.clubRole]}</span></div>
      <div><HeartPulse aria-hidden="true" /><span><small>竞技状态</small>状态 {career.player.metrics.form} · 体能 {career.player.metrics.fitness}</span></div>
      <div><UsersRound aria-hidden="true" /><span><small>国家队</small>{association?.zhName ?? '尚未决定'} · {career.player.nationalTeam.caps} 场</span></div>
    </section>
  )
}
