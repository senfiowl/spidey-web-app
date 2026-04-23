import { createClient } from '@/lib/supabase/server'
import SpiderGrid from '@/components/SpiderGrid'
import type { Spider } from '@/types'

export const revalidate = 0

export default async function HomePage() {
  const supabase = await createClient()
  const { data: spiders } = await supabase
    .from('spiders')
    .select('*')
    .order('created_at', { ascending: true })

  const list: Spider[] = spiders ?? []
  const femaleCount = list.filter(s => s.sex === 'Weibchen').length
  const maleCount = list.filter(s => s.sex === 'Männchen').length

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: '42px',
            fontWeight: 300,
            color: 'var(--fg)',
            letterSpacing: '-0.01em',
            marginBottom: '6px',
          }}
        >
          Meine Sammlung
        </h1>
        <p
          style={{
            color: 'var(--fg3)',
            fontSize: '13px',
            letterSpacing: '0.08em',
            fontFamily: 'var(--font-body)',
          }}
        >
          {list.length} Spinnen · {femaleCount} Weibchen · {maleCount} Männchen
        </p>
      </div>
      <SpiderGrid spiders={list} />
    </div>
  )
}
