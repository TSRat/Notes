import { describe, expect, it } from 'vitest'
import { careerExperiences, knowledgeSources, newsEvents, terms } from './db'

const requiredCoverageSignals = [
  '儿童保护',
  '女足医学',
  '残障足球',
  '五人制',
  '球探招募',
  '对手分析',
  '定位球',
  '数据局限',
  '经纪人',
  '俱乐部治理',
  '多俱乐部集团',
  '反兴奋剂',
  '脑震荡',
  '草皮',
  '无障碍',
  '可持续发展',
  '国家身份',
  '记忆与创伤',
  'LGBTQ+',
  '种族歧视',
  '足球档案',
  '教练教育',
  '门将专项',
  '沙滩足球',
  '足球美学',
  '足球游戏',
  '职业支持团队',
  '足球争议解决',
  '表现科技',
  '赛事体系',
]

describe('career experience content contracts', () => {
  it('keeps all records uniquely addressable and newcomer-complete', () => {
    expect(new Set(careerExperiences.map((item) => item.id)).size).toBe(careerExperiences.length)
    expect(new Set(terms.map((item) => item.id)).size).toBe(terms.length)
    expect(careerExperiences.length).toBeGreaterThanOrEqual(50)
    expect(terms.length).toBeGreaterThanOrEqual(50)

    for (const experience of careerExperiences) {
      expect(experience.scenario.length).toBeGreaterThan(28)
      expect(experience.factors.length).toBeGreaterThanOrEqual(2)
      expect(experience.surfaces.length).toBeGreaterThanOrEqual(2)
      expect(experience.termIds.length).toBeGreaterThan(0)
    }

    for (const term of terms) {
      expect(term.description.length).toBeGreaterThan(30)
      expect(term.whyItMatters.length).toBeGreaterThan(20)
      expect(term.englishTerm.length).toBeGreaterThan(2)
      expect(term.deepLink.startsWith('/career?experience=') || term.deepLink.startsWith('/match/')).toBe(true)
    }
  })

  it('connects every term and source to real career experiences', () => {
    const termIds = new Set(terms.map((term) => term.id))
    const sourceIds = new Set(knowledgeSources.map((source) => source.id))
    const referencedTerms = new Set(careerExperiences.flatMap((experience) => experience.termIds))

    for (const experience of careerExperiences) {
      experience.termIds.forEach((termId) => expect(termIds.has(termId)).toBe(true))
      experience.sourceIds?.forEach((sourceId) => expect(sourceIds.has(sourceId)).toBe(true))
    }
    for (const term of terms) {
      expect(referencedTerms.has(term.id)).toBe(true)
      term.sourceIds?.forEach((sourceId) => expect(sourceIds.has(sourceId)).toBe(true))
    }
  })

  it('covers the supplied football scope inside one chronological career graph', () => {
    const factorText = careerExperiences.flatMap((experience) => experience.factors).join(' ')
    requiredCoverageSignals.forEach((signal) => expect(factorText).toContain(signal))

    const stageCounts = careerExperiences.reduce<Record<string, number>>((counts, experience) => {
      counts[experience.stage] = (counts[experience.stage] ?? 0) + 1
      return counts
    }, {})
    expect(Object.keys(stageCounts)).toHaveLength(6)
    Object.values(stageCounts).forEach((count) => expect(count).toBeGreaterThanOrEqual(7))
  })

  it('links live news decisions into the same experience graph', () => {
    const experienceIds = new Set(careerExperiences.map((experience) => experience.id))
    newsEvents.forEach((event) => expect(event.experienceId && experienceIds.has(event.experienceId)).toBe(true))
  })

  it('keeps high-consequence topics attached to official source entry points', () => {
    const sensitiveTermIds = ['safeguarding', 'football-agent', 'concussion-protocol', 'anti-doping', 'offside']
    sensitiveTermIds.forEach((termId) => {
      const term = terms.find((item) => item.id === termId)
      expect(term?.sourceIds?.length).toBeGreaterThan(0)
    })

    knowledgeSources.forEach((source) => {
      expect(source.url.startsWith('https://')).toBe(true)
      expect(source.checkedAt).toBe('2026-08-18')
    })
  })
})
