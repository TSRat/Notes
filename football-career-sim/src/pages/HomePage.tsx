import { ArrowRight, ChevronDown, RadioTower, ShieldCheck, TimerReset } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import type { PlayerPosition } from '../app/types'
import { t } from '../i18n'

const positions: Array<{ value: PlayerPosition; label: string }> = [
  { value: 'RW', label: '右边锋 · RW' },
  { value: 'CM', label: '中场 · CM' },
  { value: 'ST', label: '中锋 · ST' },
  { value: 'CB', label: '中后卫 · CB' },
]

const playStyles = ['空间猎手', '节拍器', '禁区终结者', '防线指挥官']

export function HomePage() {
  const { state, dispatch } = useCareer()
  const navigate = useNavigate()
  const errorId = useId()
  const [name, setName] = useState(state.player.isGuest ? '' : state.player.name)
  const [position, setPosition] = useState<PlayerPosition>(state.player.position)
  const [playStyle, setPlayStyle] = useState(state.player.playStyle)
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedName = name.trim()
    if (!normalizedName) {
      setError('请输入球员姓名，中文或拉丁字母均可。')
      return
    }
    if (normalizedName.length > 18) {
      setError('姓名请控制在 18 个字符以内。')
      return
    }

    dispatch({ type: 'register', payload: { name: normalizedName, position, playStyle } })
    navigate('/career')
  }

  return (
    <div className="home-page theme-north-harbor">
      <header className="home-header">
        <div className="brand-lockup brand-lockup--large">
          <span className="brand-lockup__number">91</span>
          <span>
            <strong>{t('brand.name')}</strong>
            <small>{t('brand.subtitle')}</small>
          </span>
        </div>
        <a href="#academy-intake" className="text-link">跳过介绍，创建档案 <ChevronDown aria-hidden="true" size={15} /></a>
      </header>

      <main id="main-content" className="home-main">
        <section className="home-manifesto" aria-labelledby="home-title">
          <div className="season-stamp" aria-hidden="true">
            <span>SEASON</span>
            <strong>31/32</strong>
            <small>ACADEMY INTAKE</small>
          </div>
          <p className="eyebrow">ONE CAREER · EVERY CONSEQUENCE</p>
          <h1 id="home-title">你的生涯，<br /><span>从下一次选择开始。</span></h1>
          <p className="home-manifesto__intro">
            从街头球场、青训名单到比赛第 91 分钟与退役后的第二职业，你会亲历战术、合同、伤病、身份、俱乐部治理和场上决定。没有抽卡，也没有真实队徽——只有一份会记住每个后果的职业档案。
          </p>
          <div className="promise-grid" aria-label="游戏核心系统">
            <div><RadioTower aria-hidden="true" /><span><small>NOTEBOOK 01</small>舆情决定别人如何谈论你</span></div>
            <div><ShieldCheck aria-hidden="true" /><span><small>NOTEBOOK 02</small>俱乐部改变你的成长方式</span></div>
            <div><TimerReset aria-hidden="true" /><span><small>NOTEBOOK 03</small>比赛不给你无限思考时间</span></div>
          </div>
        </section>

        <section id="academy-intake" className="intake-card" aria-labelledby="intake-title">
          <div className="intake-card__head">
            <span className="notebook-tab">NEW SAVE / 001</span>
            <p>青训营注册</p>
            <h2 id="intake-title">建立你的第一份球员档案</h2>
          </div>
          <form onSubmit={submit} noValidate>
            <div className="form-field">
              <label htmlFor="player-name">球员姓名</label>
              <input
                id="player-name"
                value={name}
                onChange={(event) => { setName(event.target.value); setError('') }}
                placeholder="例如：周野"
                autoComplete="name"
                aria-describedby={error ? errorId : undefined}
                aria-invalid={Boolean(error)}
              />
              {error ? <p id={errorId} className="field-error" role="alert">{error}</p> : <small>只保存在本机，不会上传。</small>}
            </div>

            <fieldset>
              <legend>场上位置</legend>
              <div className="segmented-options">
                {positions.map((item) => (
                  <label key={item.value}>
                    <input type="radio" name="position" value={item.value} checked={position === item.value} onChange={() => setPosition(item.value)} />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-field">
              <label htmlFor="play-style">自我定位</label>
              <select id="play-style" value={playStyle} onChange={(event) => setPlayStyle(event.target.value)}>
                {playStyles.map((style) => <option key={style}>{style}</option>)}
              </select>
            </div>

            <button className="primary-button" type="submit">
              {t('action.start')} <ArrowRight aria-hidden="true" size={20} />
            </button>
          </form>
          <p className="privacy-note">MVP 不含账户、广告或设备追踪。存档可随时在浏览器设置中清除。</p>
        </section>
      </main>
    </div>
  )
}
