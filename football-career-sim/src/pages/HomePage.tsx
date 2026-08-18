import { ArrowRight, CircleDotDashed, Globe2, History, RotateCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { ClubWordmark } from '../components/ClubWordmark'

const FEATURED_CLUBS = ['fc-barcelona', 'manchester-united', 'bayern-munich', 'ac-milan', 'ajax', 'boca-juniors']

export function HomePage() {
  const { state } = useCareer()
  const career = state.career

  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link className="brand-lockup brand-lockup--large" to="/">
          <span className="brand-lockup__number">91</span>
          <span><strong>第 91 分钟</strong><small>PLAYER CAREER SIMULATOR</small></span>
        </Link>
        <span>真实俱乐部世界 · 模拟球员生态</span>
      </header>
      <main id="main-content">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <p className="eyebrow">ONE PLAYER · ONE COMPLETE LIFE</p>
            <h1>不是经营一支球队。<br /><span>是活完一名球员。</span></h1>
            <p className="landing-hero__lead">从 16 岁第一次签字，到国家队抉择、关键比赛、伤病、转会、家庭与退役。事实清楚，结果不保证；很多人生都能成为好结局。</p>
            <div className="landing-actions">
              <Link className="primary-button" to="/create">开始新生涯 <ArrowRight aria-hidden="true" /></Link>
              {career ? <Link className="secondary-button" to={career.status === 'retired' ? '/museum' : '/career'}><RotateCcw aria-hidden="true" /> 继续 {career.player.name} 的生涯</Link> : null}
            </div>
            <dl className="landing-metrics">
              <div><dt>完整一生</dt><dd>25–40 分钟</dd></div>
              <div><dt>关键决定</dt><dd>约 30–40 次</dd></div>
              <div><dt>世界范围</dt><dd>15 个足球生态</dd></div>
            </dl>
          </div>
          <aside className="landing-dossier" aria-label="玩法摘要">
            <div className="dossier-stamp"><span>CAREER FILE</span><strong>0001</strong><small>CLASS OF 2026</small></div>
            <article><CircleDotDashed /><span><small>足球主导</small><strong>赛季会推进，但重要时刻必须由你决定</strong></span></article>
            <article><Globe2 /><span><small>真实世界</small><strong>俱乐部、城市、联赛与球场唤起真实情感</strong></span></article>
            <article><Sparkles /><span><small>受控不确定</small><strong>能力、状态、适配与运气共同决定结果</strong></span></article>
            <article><History /><span><small>生涯博物馆</small><strong>跨周目收藏结局与无加成的独特印记</strong></span></article>
          </aside>
        </section>
        <section className="world-ribbon" aria-labelledby="world-ribbon-title">
          <div><p className="eyebrow">A SELECTED GLOBAL NETWORK</p><h2 id="world-ribbon-title">你认识这些名字，但不会知道哪一家最适合你。</h2></div>
          <div className="world-ribbon__clubs">{FEATURED_CLUBS.map((clubId) => <ClubWordmark key={clubId} clubId={clubId} />)}</div>
        </section>
      </main>
      <footer className="landing-footer"><span>无真实队徽 · 无真实球员姓名 · 俱乐部名称与传统色仅用于文本模拟</span><span>存档保存在本机</span></footer>
    </div>
  )
}
