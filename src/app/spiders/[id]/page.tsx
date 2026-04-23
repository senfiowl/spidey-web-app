import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SpiderDetail from '@/components/SpiderDetail'

export default async function SpiderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: spider } = await supabase
    .from('spiders')
    .select('*')
    .eq('id', id)
    .single()

  if (!spider) notFound()

  return <SpiderDetail spider={spider} />
}
