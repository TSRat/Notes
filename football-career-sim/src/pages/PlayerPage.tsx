import { Activity, BrainCircuit, Footprints, HeartHandshake, Shield, Sparkles } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { AppShell } from '../components/AppShell'
import { ClubWordmark } from '../components/ClubWordmark'
import { OverallBadge } from '../components/OverallBadge'
import { getAssociation } from '../data/world/worldData'
import type { AttributeKey } from '../domain/types'
import { calculatePositionRatings } from '../engine/overall'

const ATTRIBUTE_GROUPS: Array<{ title: string; icon: typeof Activity; keys: Array<[AttributeKey, string]> }> = [
  { title: '速度与身体', icon: Footprints, keys: [['acceleration', '爆发'], ['pace', '速度'], ['stamina', '耐力'], ['strength', '力量'], ['agility', '灵活']] },
  { title: '控球与传递', icon: Sparkles, keys: [['ballControl', '停控'], ['dribbling', '盘带'], ['shortPassing', '短传'], ['longPassing', '长传'], ['vision', '视野']] },
  { title: '进攻', icon: Activity, keys: [['finishing', '终结'], ['shotPower', '射门力量'], ['attackingPositioning', '进攻跑位'], ['aerial', '制空']] },
  { title: '防守与阅读', icon: Shield, keys: [['tackling', '抢断'], ['marking', '盯人'], ['anticipation', '预判'], ['decisions', '决策']] },
  { title: '心理与门将', icon: BrainCircuit, keys: [['composure', '镇定'], ['goalkeeping', '门将技术']] },
]

function MetricBar({ label, value }: { label: string; value: number }) {
  return <div className="metric-bar"><span>{label}</span><div><i style={{ width: `${value}%` }} /></div><strong>{value}</strong></div>
}

export function PlayerPage() {
  const { state } = useCareer()
  if (state.lifecycle === 'loading') return <div className="loading-screen"><span>91</span><p>正在读取球员档案…</p></div>
  if (!state.career) return <Navigate to="/create" replace />
  const career = state.career
  const player = career.player
  const positionRatings = calculatePositionRatings(player.attributes, [player.primaryPosition, ...player.secondaryPositions])

  return (
    <AppShell pageLabel="PLAYER / DOSSIER">
      <main id="main-content" className="player-page">
        <header className="player-hero">
          <div><p className="eyebrow">ACTIVE PLAYER DOSSIER · {player.id.toUpperCase()}</p><h1>{player.name}</h1><p>{getAssociation(player.primaryNationality)?.zhName} · {player.birthplace} · {player.dominantFoot === 'left' ? '左脚' : '右脚'} · {player.age} 岁</p><ClubWordmark clubId={player.currentClubId} /></div>
          <OverallBadge overall={player.overall} />
        </header>
        <div className="player-grid">
          <section className="attribute-sheet"><header><div><p className="eyebrow">CURRENT ABILITY</p><h2>能力档案</h2></div><span>位置权重计算 OVR · 1–99</span></header><div className="attribute-groups">{ATTRIBUTE_GROUPS.map((group) => { const Icon = group.icon; return <article key={group.title}><h3><Icon /> {group.title}</h3>{group.keys.map(([key, label]) => <MetricBar key={key} label={label} value={player.attributes[key]} />)}</article> })}</div></section>
          <aside className="player-context">
            <section><p className="eyebrow">POSITION READOUT</p><h2>位置能力</h2>{positionRatings.map((rating) => <div className="position-rating" key={rating.position}><span>{rating.position}</span><strong>{rating.overall}</strong></div>)}<p className="fine-print">综合能力是当前位置所需属性的加权结果，不包含声望、近期状态或球队名气。</p></section>
            <section><p className="eyebrow">HUMAN CONTEXT</p><h2><HeartHandshake /> 球员不是数值卡</h2><dl className="signal-list"><div><dt>身心状态</dt><dd>{player.metrics.wellbeing}</dd></div><div><dt>归属感</dt><dd>{player.metrics.belonging}</dd></div><div><dt>财务安全</dt><dd>{player.metrics.financialSecurity}</dd></div><div><dt>领导力</dt><dd>{player.metrics.leadership}</dd></div></dl></section>
            <section><p className="eyebrow">NATIONAL TEAM</p><h2>国家队生涯</h2><dl className="plain-data"><div><dt>资格</dt><dd>{player.nationalTeam.eligibleAssociationIds.map((id) => getAssociation(id)?.zhName).join(' / ')}</dd></div><div><dt>已承诺</dt><dd>{player.nationalTeam.committedAssociationId ? getAssociation(player.nationalTeam.committedAssociationId)?.zhName : '尚未决定'}</dd></div><div><dt>出场 / 进球</dt><dd>{player.nationalTeam.caps} / {player.nationalTeam.goals}</dd></div></dl></section>
          </aside>
        </div>
      </main>
    </AppShell>
  )
}
