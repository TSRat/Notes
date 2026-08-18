import { BookOpenText, ExternalLink, Filter, MapPin, Search, ShieldCheck, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { ClubWordmark } from '../components/ClubWordmark'
import { ContextDrawer } from '../components/ContextDrawer'
import { terms } from '../data/db'
import {
  competitions,
  getCompetition,
  getWorldClub,
  worldClubs,
  worldSources,
} from '../data/world/worldData'

export function WorldPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [competitionId, setCompetitionId] = useState('all')
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null)
  const glossaryOpen = searchParams.get('panel') === 'glossary'
  const [view, setView] = useState<'clubs' | 'glossary'>(glossaryOpen ? 'glossary' : 'clubs')
  const selectedClub = selectedClubId ? getWorldClub(selectedClubId) : undefined

  const filteredClubs = useMemo(() => worldClubs.filter((club) => {
    const competitionMatch = competitionId === 'all' || club.competitionId === competitionId
    const queryText = `${club.zhName} ${club.name} ${club.city} ${club.stadium} ${club.identityTags.join(' ')}`.toLowerCase()
    return competitionMatch && queryText.includes(query.trim().toLowerCase())
  }), [competitionId, query])
  const filteredTerms = useMemo(() => terms.filter((term) => `${term.title} ${term.englishTerm} ${term.category}`.toLowerCase().includes(query.trim().toLowerCase())), [query])

  return (
    <AppShell pageLabel="WORLD / REFERENCE">
      <main id="main-content" className="world-page">
        <header className="world-hero"><div><p className="eyebrow">REAL CLUB WORLD · SIMULATED PEOPLE</p><h1>足球世界不是一张强弱榜。</h1><p>城市、球场、传统色、青训通道、竞争压力与比赛文化共同构成职业环境。当前版本精选 15 个生态、60 家真实俱乐部；人物与未来赛季全部模拟。</p></div><div className="world-hero__count"><strong>15</strong><span>足球生态</span><strong>60</strong><span>真实俱乐部起点</span></div></header>
        <div className="world-controls">
          <div className="view-switch"><button className={view === 'clubs' ? 'is-active' : ''} type="button" onClick={() => setView('clubs')}><ShieldCheck /> 俱乐部网络</button><button className={view === 'glossary' ? 'is-active' : ''} type="button" onClick={() => setView('glossary')}><BookOpenText /> 生涯百科</button></div>
          <label className="world-search"><Search /><span className="visually-hidden">搜索</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={view === 'clubs' ? '搜索俱乐部、城市或球场' : '搜索足球概念'} />{query ? <button type="button" onClick={() => setQuery('')} aria-label="清除搜索"><X /></button> : null}</label>
          {view === 'clubs' ? <label className="world-filter"><Filter /><span className="visually-hidden">联赛筛选</span><select value={competitionId} onChange={(event) => setCompetitionId(event.target.value)}><option value="all">全部生态</option>{competitions.map((competition) => <option key={competition.id} value={competition.id}>{competition.zhName}</option>)}</select></label> : null}
        </div>

        {view === 'clubs' ? (
          <section className="club-catalog" aria-label="俱乐部目录">{filteredClubs.map((club) => <button type="button" onClick={() => setSelectedClubId(club.id)} key={club.id}><ClubWordmark clubId={club.id} /><div className="club-catalog__facts"><span><MapPin /> {club.stadium}</span><span>青训 {club.developmentProfile.academy}</span><span>环境压力 {club.pressureProfile.level}</span></div><div className="identity-tags">{club.identityTags.slice(0, 3).map((tag) => <i key={tag}>{tag}</i>)}</div><small>模拟强度基准 {club.strengthBaseline.rating} · {club.strengthBaseline.asOf}</small></button>)}</section>
        ) : (
          <section className="glossary-grid" aria-label="足球生涯百科">{filteredTerms.map((term) => <article key={term.id}><span>{term.category}</span><h2>{term.title}</h2><small>{term.englishTerm}</small><p>{term.description}</p><div><strong>为什么会影响你的生涯</strong><p>{term.whyItMatters}</p></div></article>)}</section>
        )}

        <section className="source-contract"><div><p className="eyebrow">SOURCE CONTRACT</p><h2>真实事实有来源，模拟判断有标签。</h2></div><p>规则与当前赛制优先采用官方机构；学术研究与权威著作用于机制和语境；俱乐部强度为编辑性模拟基准，不冒充实时排名。真实人物数据入口已预留，但当前未启用。</p></section>
      </main>

      <ContextDrawer open={Boolean(selectedClub)} title={selectedClub?.zhName ?? '俱乐部资料'} onClose={() => setSelectedClubId(null)}>
        {selectedClub ? <div className="club-detail"><ClubWordmark clubId={selectedClub.id} /><dl className="plain-data"><div><dt>联赛</dt><dd>{getCompetition(selectedClub.competitionId)?.zhName}</dd></div><div><dt>城市 / 球场</dt><dd>{selectedClub.city} / {selectedClub.stadium}</dd></div><div><dt>青训路径</dt><dd>{selectedClub.developmentProfile.pathway}</dd></div><div><dt>招募特征</dt><dd>{selectedClub.developmentProfile.recruitment}</dd></div><div><dt>支持者压力</dt><dd>{selectedClub.pressureProfile.supporter} · {selectedClub.pressureProfile.level}/100</dd></div><div><dt>数据置信度</dt><dd>{selectedClub.confidence}</dd></div></dl><h3>资料来源</h3>{selectedClub.sourceRefs.map((sourceId) => { const source = worldSources.find((item) => item.id === sourceId); return source ? <a key={source.id} href={source.urlOrLocalRef.startsWith('http') ? source.urlOrLocalRef : undefined} target="_blank" rel="noreferrer"><span><strong>{source.title}</strong><small>{source.publisherOrInstitution} · 权威级别 {source.authorityTier}</small></span>{source.urlOrLocalRef.startsWith('http') ? <ExternalLink /> : null}</a> : null })}<p className="rights-note">不使用官方队徽、球衣或人物肖像。俱乐部以名称、城市与传统色呈现。</p></div> : null}
      </ContextDrawer>
    </AppShell>
  )
}
