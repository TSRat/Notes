import { ArrowLeft, ArrowRight, Check, Footprints, ShieldQuestion } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { ClubWordmark } from '../components/ClubWordmark'
import { associations, competitions, worldClubs } from '../data/world/worldData'
import { PLAYER_POSITIONS, type CareerDifficulty, type PlayerPosition } from '../domain/types'
import { createCareer } from '../engine/careerEngine'
import type { CareerTrait } from '../engine/careerTypes'

const TRAITS: Array<{ id: CareerTrait; title: string; description: string }> = [
  { id: 'gifted', title: '天赋被看见', description: '起点更受关注，也更早面对外界期待。' },
  { id: 'late-bloomer', title: '后发成长', description: '早期不耀眼，但成熟期仍有上升空间。' },
  { id: 'street-football', title: '街头灵感', description: '脚下大胆，比赛决策需要职业体系打磨。' },
  { id: 'coach-child', title: '战术家庭', description: '更快理解教练意图，也容易想得太多。' },
  { id: 'dual-heritage', title: '双重文化', description: '适应力更强，未来会面对国家队身份抉择。' },
]

const DIFFICULTIES: Array<{ id: CareerDifficulty; title: string; description: string }> = [
  { id: 'story', title: '故事模式', description: '挫折仍存在，但更容易延续重要关系。' },
  { id: 'standard', title: '标准生涯', description: '推荐。好结局常见，成为球星仍然稀有。' },
  { id: 'journeyman', title: '漂泊挑战', description: '适应、出场与合同压力会更加严苛。' },
]

function randomSeed(name: string) {
  return `${name}:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}:${Math.random()}`}`
}

export function CreatePlayerPage() {
  const { dispatch } = useCareer()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [nationality, setNationality] = useState('CHN')
  const [secondaryNationality, setSecondaryNationality] = useState('')
  const [birthplace, setBirthplace] = useState('上海')
  const [dominantFoot, setDominantFoot] = useState<'left' | 'right'>('right')
  const [position, setPosition] = useState<PlayerPosition>('RW')
  const [trait, setTrait] = useState<CareerTrait>('late-bloomer')
  const [difficulty, setDifficulty] = useState<CareerDifficulty>('standard')
  const recommendedClubs = useMemo(() => worldClubs.filter((club) => club.countryId === nationality), [nationality])
  const [startingClubId, setStartingClubId] = useState('shanghai-shenhua')
  const [childhoodClubId, setChildhoodClubId] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('请先给球员一个名字。')
      return
    }
    const career = createCareer({
      seed: randomSeed(name.trim()),
      name: name.trim().slice(0, 24),
      primaryNationality: nationality,
      secondaryNationality: secondaryNationality || undefined,
      birthplace: birthplace.trim() || '未记录',
      dominantFoot,
      primaryPosition: position,
      trait,
      difficulty,
      startingClubId,
      childhoodClubId: childhoodClubId || undefined,
    })
    dispatch({ type: 'start-career', payload: career })
    navigate('/career')
  }

  return (
    <div className="create-page">
      <header className="create-header"><Link className="text-link" to="/"><ArrowLeft /> 返回</Link><span>PLAYER INTAKE · 01/01</span></header>
      <main id="main-content" className="create-layout">
        <section className="create-intro">
          <p className="eyebrow">BUILD A PERSON, NOT A CARD</p>
          <h1>先决定你从哪里来。<br />能力会在路上形成。</h1>
          <p>初始档案决定语境，不保证结局。即使选择同一个俱乐部、同一个位置，不同生涯也会因为状态、教练信任和受控随机而分岔。</p>
          <div className="create-principle"><ShieldQuestion /><span><strong>不会显示潜力值</strong><small>你只会看到当前 OVR 与已经发生的事实。</small></span></div>
          <div className="create-principle"><Footprints /><span><strong>没有唯一正确开局</strong><small>小俱乐部的上场机会可能比豪门身份更重要。</small></span></div>
        </section>
        <form className="create-form" onSubmit={submit}>
          <section>
            <header><span>01</span><div><p>身份</p><h2>球员档案</h2></div></header>
            <div className="form-grid">
              <label className="form-field form-field--wide"><span>姓名</span><input value={name} onChange={(event) => { setName(event.target.value); setError('') }} placeholder="例如：周野" maxLength={24} />{error ? <small className="field-error">{error}</small> : <small>仅保存在本机。</small>}</label>
              <label className="form-field"><span>主要国籍</span><select value={nationality} onChange={(event) => { const value = event.target.value; setNationality(value); const first = worldClubs.find((club) => club.countryId === value); if (first) setStartingClubId(first.id) }}>
                {associations.map((association) => <option key={association.id} value={association.id}>{association.zhName}</option>)}
              </select></label>
              <label className="form-field"><span>第二国籍（可选）</span><select value={secondaryNationality} onChange={(event) => setSecondaryNationality(event.target.value)}><option value="">无</option>{associations.filter((item) => item.id !== nationality).map((association) => <option key={association.id} value={association.id}>{association.zhName}</option>)}</select></label>
              <label className="form-field"><span>出生城市</span><input value={birthplace} onChange={(event) => setBirthplace(event.target.value)} /></label>
              <fieldset className="form-field"><legend>惯用脚</legend><div className="two-options"><label><input type="radio" checked={dominantFoot === 'right'} onChange={() => setDominantFoot('right')} /><span>右脚</span></label><label><input type="radio" checked={dominantFoot === 'left'} onChange={() => setDominantFoot('left')} /><span>左脚</span></label></div></fieldset>
            </div>
          </section>
          <section>
            <header><span>02</span><div><p>足球</p><h2>位置与成长背景</h2></div></header>
            <fieldset className="position-picker"><legend>主要位置</legend>{PLAYER_POSITIONS.map((item) => <label key={item}><input type="radio" checked={position === item} onChange={() => setPosition(item)} /><span>{item}</span></label>)}</fieldset>
            <fieldset className="trait-picker"><legend>成长特质</legend>{TRAITS.map((item) => <label key={item.id}><input type="radio" checked={trait === item.id} onChange={() => setTrait(item.id)} /><span><strong>{item.title}</strong><small>{item.description}</small>{trait === item.id ? <Check /> : null}</span></label>)}</fieldset>
          </section>
          <section>
            <header><span>03</span><div><p>起点</p><h2>第一家真实俱乐部</h2></div></header>
            <p className="section-note">推荐来自你的主要国籍联赛；也可以直接选择全球网络中的其他俱乐部。名称、城市、球场与传统色是真实语境，阵容人员为模拟生态。</p>
            <div className="recommended-clubs">{recommendedClubs.map((club) => <button className={startingClubId === club.id ? 'is-selected' : ''} type="button" key={club.id} onClick={() => setStartingClubId(club.id)}><ClubWordmark clubId={club.id} /><small>青训 {club.developmentProfile.academy} · 压力 {club.pressureProfile.level}</small></button>)}</div>
            <div className="form-grid">
              <label className="form-field"><span>全部俱乐部</span><select value={startingClubId} onChange={(event) => setStartingClubId(event.target.value)}>{competitions.map((competition) => <optgroup key={competition.id} label={competition.zhName}>{worldClubs.filter((club) => club.competitionId === competition.id).map((club) => <option key={club.id} value={club.id}>{club.zhName} · {club.city}</option>)}</optgroup>)}</select></label>
              <label className="form-field"><span>童年支持俱乐部（可选）</span><select value={childhoodClubId} onChange={(event) => setChildhoodClubId(event.target.value)}><option value="">未指定</option>{worldClubs.map((club) => <option key={club.id} value={club.id}>{club.zhName}</option>)}</select></label>
            </div>
          </section>
          <section>
            <header><span>04</span><div><p>节奏</p><h2>生涯难度</h2></div></header>
            <fieldset className="difficulty-picker"><legend className="visually-hidden">难度</legend>{DIFFICULTIES.map((item) => <label key={item.id}><input type="radio" checked={difficulty === item.id} onChange={() => setDifficulty(item.id)} /><span><strong>{item.title}</strong><small>{item.description}</small></span></label>)}</fieldset>
          </section>
          <div className="create-submit"><p>预计 25–40 分钟完成一生。所有关键选择自动保存。</p><button className="primary-button" type="submit">建立档案并签入青训 <ArrowRight /></button></div>
        </form>
      </main>
    </div>
  )
}
