'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomOklchColor } from '@/lib/utils'

export async function addSpider(formData: FormData) {
  const supabase = await createClient()

  const tempMin = formData.get('tempMin') as string
  const tempMax = formData.get('tempMax') as string
  const humMin = formData.get('humMin') as string
  const humMax = formData.get('humMax') as string

  const imageUrlsRaw = formData.get('imageUrls') as string
  const imageUrls: string[] = imageUrlsRaw ? JSON.parse(imageUrlsRaw) : []
  const profileUrl = imageUrls[0] ?? null

  const { error } = await supabase.from('spiders').insert({
    name: formData.get('name') as string,
    species: formData.get('species') as string,
    common_name: (formData.get('commonName') as string) || null,
    origin: (formData.get('origin') as string) || null,
    habitat: (formData.get('habitat') as string) || null,
    body_size: (formData.get('bodySize') as string) || null,
    span: (formData.get('span') as string) || null,
    toxicity: (formData.get('toxicity') as string) || 'mild',
    sex: (formData.get('sex') as string) || 'Unbekannt',
    age: (formData.get('age') as string) || null,
    temp_range: tempMin && tempMax ? `${tempMin}–${tempMax} °C` : null,
    humidity_range: humMin && humMax ? `${humMin}–${humMax} %` : null,
    last_fed:
      (formData.get('lastFed') as string) || new Date().toISOString().slice(0, 10),
    molts: [],
    notes: (formData.get('notes') as string) || null,
    image_url: profileUrl,
    image_urls: imageUrls,
    color: (formData.get('color') as string) || randomOklchColor(),
  })

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function deleteSpider(id: string) {
  const supabase = await createClient()

  const { data: spider } = await supabase
    .from('spiders')
    .select('image_url, image_urls')
    .eq('id', id)
    .single()

  const allUrls = new Set<string>([
    ...(spider?.image_urls ?? []),
    ...(spider?.image_url ? [spider.image_url] : []),
  ])
  const paths = Array.from(allUrls)
    .map(url => url.split('/spider-images/')[1])
    .filter(Boolean)
  if (paths.length) await supabase.storage.from('spider-images').remove(paths)

  const { error } = await supabase.from('spiders').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function updateSpider(id: string, formData: FormData) {
  const supabase = await createClient()

  const tempMin = formData.get('tempMin') as string
  const tempMax = formData.get('tempMax') as string
  const humMin = formData.get('humMin') as string
  const humMax = formData.get('humMax') as string

  const moltsRaw = formData.get('molts') as string
  const molts = moltsRaw
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  const imageUrlsRaw = formData.get('imageUrls') as string
  const imageUrls: string[] = imageUrlsRaw ? JSON.parse(imageUrlsRaw) : []
  const profileUrl = (formData.get('imageUrl') as string) || null

  const { error } = await supabase
    .from('spiders')
    .update({
      name: formData.get('name'),
      species: formData.get('species'),
      common_name: (formData.get('commonName') as string) || null,
      origin: (formData.get('origin') as string) || null,
      habitat: (formData.get('habitat') as string) || null,
      body_size: (formData.get('bodySize') as string) || null,
      span: (formData.get('span') as string) || null,
      toxicity: formData.get('toxicity'),
      sex: formData.get('sex'),
      age: (formData.get('age') as string) || null,
      temp_range: tempMin && tempMax ? `${tempMin}–${tempMax} °C` : null,
      humidity_range: humMin && humMax ? `${humMin}–${humMax} %` : null,
      last_fed: (formData.get('lastFed') as string) || null,
      molts,
      notes: (formData.get('notes') as string) || null,
      image_url: profileUrl,
      image_urls: imageUrls,
      color: (formData.get('color') as string) || null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/spiders/${id}`)
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function setProfileImage(id: string, url: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('spiders').update({ image_url: url }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/spiders/${id}`)
  revalidatePath('/')
}

export async function removeGalleryImage(id: string, url: string) {
  const supabase = await createClient()

  const { data: spider } = await supabase
    .from('spiders')
    .select('image_url, image_urls')
    .eq('id', id)
    .single()

  const newUrls = (spider?.image_urls ?? []).filter((u: string) => u !== url)
  const newProfile = spider?.image_url === url ? (newUrls[0] ?? null) : spider?.image_url

  const path = url.split('/spider-images/')[1]
  if (path) await supabase.storage.from('spider-images').remove([path])

  const { error } = await supabase
    .from('spiders')
    .update({ image_urls: newUrls, image_url: newProfile })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath(`/spiders/${id}`)
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function updateLastFed(id: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const { error } = await supabase
    .from('spiders')
    .update({ last_fed: today })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function addMolt(id: string) {
  const supabase = await createClient()
  const yearMonth = new Date().toISOString().slice(0, 7)
  const { data } = await supabase.from('spiders').select('molts').eq('id', id).single()
  const { error } = await supabase
    .from('spiders')
    .update({ molts: [...(data?.molts ?? []), yearMonth] })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath(`/spiders/${id}`)
}
