'use client'
import { useState, useEffect } from 'react'
import SpiderCard from './SpiderCard'
import { createClient } from '@/lib/supabase/client'
import { usePreviewMode } from '@/lib/use-preview-mode'
import { daysSince } from '@/lib/utils'
import type { Spider } from '@/types'

const FILTERS = [
  ['all', 'Alle'],
  ['Weibchen', '♀ Weibchen'],
  ['Männchen', '♂ Männchen'],
  ['hungry', 'Hungrig > 10 T.'],
] as const

export default function SpiderGrid({ spiders }: { spiders: Spider[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const { preview } = usePreviewMode()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) =>
      setIsAdmin(!!session)
    )
    return () => subscription.unsubscribe()
  }, [])

  const filtered = spiders.filter(sp => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      sp.name.toLowerCase().includes(q) ||
      sp.species.toLowerCase().includes(q) ||
      (sp.common_name || '').toLowerCase().includes(q)
    const matchFilter =
      filter === 'all' ||
      sp.sex === filter ||
      (filter === 'hungry' && daysSince(sp.last_fed) > 10)
    return matchSearch && matchFilter
  })

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg2)',
    border: '1px solid var(--card-border)',
    color: 'var(--fg)',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    padding: '9px 16px',
    borderRadius: 'var(--radius)',
    outline: 'none',
    width: '240px',
  }

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? 'var(--bg3)' : 'var(--bg2)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--card-border)'}`,
    color: active ? 'var(--accent)' : 'var(--fg2)',
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    padding: '7px 14px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'all 0.2s',
  })

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <input
          style={inputStyle}
          placeholder="Suche nach Name, Art …"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {FILTERS.map(([v, l]) => (
            <button key={v} style={filterBtnStyle(filter === v)} onClick={() => setFilter(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="spider-grid">
        {filtered.map(spider => (
          <SpiderCard key={spider.id} spider={spider} isAdmin={isAdmin && !preview} />
        ))}
        {filtered.length === 0 && (
          <p
            style={{
              color: 'var(--fg3)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              gridColumn: '1 / -1',
            }}
          >
            Keine Spinnen gefunden.
          </p>
        )}
      </div>
    </>
  )
}
