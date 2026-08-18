import { ArrowUpRight, BookOpen, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getExperiencesForTerm, getSource, terms } from '../data/db'
import { t } from '../i18n'
import { PanelHeader } from './PanelHeader'

export function EncyclopediaPanel({ compact = false }: { compact?: boolean }) {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState('全部')
  const categories = ['全部', ...new Set(terms.map((term) => term.category))]

  useEffect(() => {
    const nextQuery = searchParams.get('q')
    if (nextQuery !== null) setQuery(nextQuery)
  }, [searchParams])

  const filteredTerms = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN')
    return terms.filter((term) => {
      const matchesCategory = category === '全部' || term.category === category
      const haystack = `${term.title} ${term.englishTerm} ${term.description} ${term.whyItMatters}`.toLocaleLowerCase('zh-CN')
      return matchesCategory && (!normalized || haystack.includes(normalized))
    })
  }, [category, query])

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
  }

  return (
    <section className={`encyclopedia ${compact ? 'encyclopedia--compact' : ''}`} aria-label="足球百科">
      <PanelHeader notebook="CAREER CONTEXT" title="足球解释层" meta={`${terms.length} 个概念 · 全部回到职业情境`} />

      <form className="database-search" role="search" onSubmit={submitSearch}>
        <Search aria-hidden="true" size={17} />
        <label className="visually-hidden" htmlFor={`database-search-${compact ? 'compact' : 'full'}`}>搜索足球术语</label>
        <input
          id={`database-search-${compact ? 'compact' : 'full'}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索战术、数据或合同"
        />
        {query ? (
          <button type="button" className="icon-button" aria-label="清除搜索" onClick={() => setQuery('')}>
            <X aria-hidden="true" size={16} />
          </button>
        ) : null}
      </form>

      <div className="category-filter" aria-label="术语分类">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? 'is-selected' : ''}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {filteredTerms.length ? (
        <ul className="term-list">
          {filteredTerms.map((term) => (
            <li key={term.id} id={`term-${term.id}`}>
              <span className="term-list__category">{term.category}</span>
              <h3>{term.title}</h3>
              <p className="term-list__english">{term.englishTerm}</p>
              <p>{term.description}</p>
              {!compact ? <p className="term-list__why"><strong>为什么现在有用：</strong>{term.whyItMatters}</p> : null}
              {!compact ? (
                <div className="term-list__experiences">
                  <span>{getExperiencesForTerm(term.id).length} 个生涯情境：</span>
                  {getExperiencesForTerm(term.id).slice(0, 3).map((experience) => (
                    <Link key={experience.id} to={`/career?experience=${experience.id}`}>{experience.title}</Link>
                  ))}
                </div>
              ) : null}
              <div className="term-list__links">
                <Link className="text-link" to={term.deepLink}>
                  <BookOpen aria-hidden="true" size={15} /> 回到职业情境
                </Link>
                {term.sourceIds?.map((sourceId) => {
                  const source = getSource(sourceId)
                  return source ? (
                    <a key={source.id} className="source-link" href={source.url} target="_blank" rel="noreferrer">
                      {source.label} <ArrowUpRight aria-hidden="true" size={13} />
                    </a>
                  ) : null
                })}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <Search aria-hidden="true" size={24} />
          <p>{t('empty.search', { query })}</p>
          <button type="button" className="text-button" onClick={() => { setQuery(''); setCategory('全部') }}>
            {t('action.clearSearch')}
          </button>
        </div>
      )}
    </section>
  )
}
