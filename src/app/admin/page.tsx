import { createClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/AdminDashboard'

export const revalidate = 0

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: spiders } = await supabase
    .from('spiders')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px 80px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: '42px',
          fontWeight: 300,
          color: 'var(--fg)',
          marginBottom: '32px',
        }}
      >
        Admin
      </h1>
      <AdminDashboard spiders={spiders ?? []} />
    </div>
  )
}
