import { Archive, ArrowRight, Download, FileUp, Medal, Plus, Trophy } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCareer } from '../app/CareerContext'
import { AchievementReveal } from '../components/AchievementReveal'
import { AppShell } from '../components/AppShell'
import { ClubWordmark } from '../components/ClubWordmark'
import type { SaveSummary } from '../storage/saveRepository'

const DIMENSION_LABELS = {
  sporting: '竞技高度',
  longevity: '生涯长度',
  clubLegacy: '俱乐部遗产',
  nationalLegacy: '国家队遗产',
  life: '人生完整度',
}

export function MuseumPage() {
  const { state, exportCareer, importCareer, listCareers, loadCareer } = useCareer()
  const [archives, setArchives] = useState<SaveSummary[]>([])
  const fileInput = useRef<HTMLInputElement>(null)
  const career = state.career

  useEffect(() => {
    void listCareers().then(setArchives)
  }, [career?.id, listCareers, state.saveStatus])

  const download = () => {
    const json = exportCareer()
    if (!json || !career) return
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${career.player.name}-career-save.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await importCareer(await file.text())
    event.target.value = ''
  }

  return (
    <AppShell pageLabel="MUSEUM / ALL LIVES">
      <main id="main-content" className="museum-page">
        <header className="museum-hero"><div><p className="eyebrow">CAREER MUSEUM</p><h1>不是奖杯柜。<br />是你活过的所有道路。</h1><p>成就没有属性加成，也不会逼你选择“正确答案”。这里收藏里程碑、独特职业路径、比赛瞬间与人生选择。</p></div><div className="museum-actions"><Link className="primary-button" to="/create"><Plus /> 新建另一种人生</Link><button className="secondary-button" type="button" onClick={download} disabled={!career}><Download /> 导出当前存档</button><button className="secondary-button" type="button" onClick={() => fileInput.current?.click()}><FileUp /> 导入存档</button><input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={importFile} /></div></header>

        {career ? <>
          <section className="museum-current"><div className="museum-current__identity"><span>CURRENT EXHIBIT</span><h2>{career.player.name}</h2><ClubWordmark clubId={career.player.currentClubId} /><p>{career.status === 'retired' ? career.ending?.biography : `${career.player.age} 岁，生涯仍在进行。最高 OVR ${career.player.peakOverall}。`}</p></div>{career.ending ? <div className="ending-plaque"><Trophy /><span>{career.ending.isGoodEnding ? 'A GOOD LIFE' : 'AN UNFINISHED FEELING'}</span><h2>{career.ending.title}</h2><div>{Object.entries(career.ending.dimensions).map(([key, value]) => <div key={key}><span>{DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS]}</span><strong>{value}</strong><i style={{ width: `${value}%` }} /></div>)}</div></div> : <div className="ending-plaque ending-plaque--open"><Medal /><span>EXHIBIT IN PROGRESS</span><h2>结局还没有名字</h2><p>继续生涯，或者先查看已经解锁的印记。好结局不只属于最高 OVR。</p><Link className="text-link" to="/career">继续时间线 <ArrowRight /></Link></div>}</section>
          <section className="museum-achievements"><header><div><p className="eyebrow">CAREER MARKS</p><h2>生涯印记</h2></div><span>{career.unlockedAchievementIds.length} / 24 已解锁</span></header><AchievementReveal unlockedIds={career.unlockedAchievementIds} showLocked /></section>
        </> : <section className="empty-museum"><Archive /><h2>博物馆还没有展品</h2><p>创建一名球员，或者导入一份已有 JSON 存档。</p><Link className="primary-button" to="/create">开始第一种人生</Link></section>}

        <section className="archive-shelf"><header><div><p className="eyebrow">LOCAL ARCHIVE</p><h2>本机职业档案</h2></div><span>{archives.length} 份</span></header>{archives.length ? <div>{archives.map((archive) => <button type="button" key={archive.id} className={archive.id === career?.id ? 'is-current' : ''} onClick={() => void loadCareer(archive.id)}><span>{archive.status === 'retired' ? '已退役' : `${archive.age} 岁`}</span><strong>{archive.playerName}</strong><small>OVR {archive.overall} · 修订 {archive.revision}</small></button>)}</div> : <p className="empty-copy">存档只保存在这台设备的当前浏览器中。</p>}</section>
      </main>
    </AppShell>
  )
}
