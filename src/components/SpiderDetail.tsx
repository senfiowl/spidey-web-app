'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SpiderPlaceholder from './SpiderPlaceholder'
import { updateSpider, setProfileImage, removeGalleryImage } from '@/app/admin/actions'
import { usePreviewMode } from '@/lib/use-preview-mode'
import { daysSince, toxBadgeColor, getSpiderColor } from '@/lib/utils'
import type { Spider } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseRange(range: string | null): [string, string] {
  if (!range) return ['', '']
  const clean = range.replace(/°C|%/g, '').trim()
  const [a, b] = clean.split('–')
  return [a?.trim() ?? '', b?.trim() ?? '']
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--card-border)',
  color: 'var(--fg)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  padding: '8px 12px',
  borderRadius: 'var(--radius)',
  outline: 'none',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label
        style={{
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'var(--fg3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '5px',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function EditSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--card-radius)',
        padding: '20px 22px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: '16px',
          fontWeight: 400,
          color: 'var(--accent)',
          marginBottom: '14px',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

// ── View-mode helpers ─────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: '24px',
          fontWeight: 300,
          color: 'var(--fg)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          color: 'var(--fg3)',
          letterSpacing: '0.08em',
          marginTop: '4px',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function InfoCard({
  title,
  children,
  wide,
}: {
  title: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--card-radius)',
        padding: '20px 22px',
        gridColumn: wide ? '1 / -1' : undefined,
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: '16px',
          fontWeight: 400,
          color: 'var(--accent)',
          marginBottom: '14px',
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        gap: '16px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--fg3)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--fg)',
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  )
}

// ── View mode ─────────────────────────────────────────────────────────────────

function ViewMode({
  spider,
  isAdmin,
  onEdit,
  onRefresh,
}: {
  spider: Spider
  isAdmin: boolean
  onEdit: () => void
  onRefresh: () => void
}) {
  const days = daysSince(spider.last_fed)
  const barWidth = Math.min(100, (days / 14) * 100)
  const barColor = days > 10 ? 'var(--accent2)' : 'var(--accent)'
  const molts: string[] = spider.molts || []
  const gallery: string[] = spider.image_urls ?? []

  const [pendingProfile, setPendingProfile] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex(i => ((i ?? 0) + 1) % gallery.length)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => ((i ?? 0) - 1 + gallery.length) % gallery.length)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, gallery.length])

  const handleSetProfile = async (url: string) => {
    setPendingProfile(url)
    await setProfileImage(spider.id, url)
    onRefresh()
    setPendingProfile(null)
  }

  const handleRemove = async (url: string) => {
    if (!confirm('Bild aus der Galerie entfernen?')) return
    setPendingRemove(url)
    await removeGalleryImage(spider.id, url)
    onRefresh()
    setPendingRemove(null)
  }

  const thumbStyle: React.CSSProperties = {
    position: 'relative',
    aspectRatio: '1/1',
    borderRadius: 'var(--card-radius)',
    overflow: 'hidden',
    border: '1px solid var(--card-border)',
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 32px 80px' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
        }}
      >
        <Link
          href="/"
          style={{
            color: 'var(--fg3)',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            letterSpacing: '0.06em',
            textDecoration: 'none',
          }}
        >
          ← Zurück zur Übersicht
        </Link>
        {isAdmin && (
          <button
            onClick={onEdit}
            style={{
              background: 'var(--bg2)',
              border: '1px solid var(--card-border)',
              color: 'var(--fg2)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              letterSpacing: '0.06em',
              padding: '7px 16px',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--fg2)'
            }}
          >
            Bearbeiten
          </button>
        )}
      </div>

      {/* Hero */}
      <div className="detail-hero">
        <div
          style={{
            borderRadius: 'var(--card-radius)',
            overflow: 'hidden',
            aspectRatio: '1/1',
            position: 'relative',
            border: '1px solid var(--card-border)',
          }}
        >
          {spider.image_url ? (
            <Image src={spider.image_url} alt={spider.name} fill style={{ objectFit: 'cover' }} />
          ) : (
            <SpiderPlaceholder color={getSpiderColor(spider.sex)} name={spider.name + 'd'} />
          )}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(transparent, var(--bg))',
            }}
          />
        </div>

        <div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}
          >
            <span
              style={{
                fontSize: '11px',
                color: 'var(--fg3)',
                letterSpacing: '0.12em',
                fontFamily: 'var(--font-body)',
                textTransform: 'uppercase',
              }}
            >
              {spider.sex === 'Weibchen' ? '♀ Weibchen' : '♂ Männchen'}
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 10px',
                border: '1px solid',
                borderColor: toxBadgeColor(spider.toxicity),
                borderRadius: '2px',
                color: toxBadgeColor(spider.toxicity),
                fontFamily: 'var(--font-body)',
              }}
            >
              {spider.toxicity}
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: '56px',
              fontWeight: 300,
              color: 'var(--fg)',
              lineHeight: 1,
              marginBottom: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            {spider.name}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--fg2)',
              fontStyle: 'italic',
              marginBottom: '4px',
            }}
          >
            {spider.species}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--fg3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '28px',
            }}
          >
            {spider.common_name}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '32px',
              paddingTop: '24px',
              borderTop: '1px solid var(--card-border)',
            }}
          >
            <Stat label="Alter" value={spider.age || '–'} />
            <Stat label="Körperlänge" value={spider.body_size || '–'} />
            <Stat label="Spannweite" value={spider.span || '–'} />
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="detail-grid">
        <InfoCard title="Herkunft & Habitat">
          <InfoRow label="Herkunft" value={spider.origin || '–'} />
          <InfoRow label="Habitat" value={spider.habitat || '–'} />
        </InfoCard>
        <InfoCard title="Haltungsbedingungen">
          <InfoRow label="Temperatur" value={spider.temp_range || '–'} />
          <InfoRow label="Luftfeuchtigkeit" value={spider.humidity_range || '–'} />
        </InfoCard>
        <InfoCard title="Fütterung">
          <InfoRow label="Letzte Fütterung" value={spider.last_fed || '–'} />
          <InfoRow label="Tage zurück" value={`${days} Tage`} />
          <div
            style={{
              marginTop: '10px',
              height: '6px',
              borderRadius: '3px',
              background: 'var(--bg3)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${barWidth}%`,
                background: barColor,
                borderRadius: '3px',
              }}
            />
          </div>
          <p
            style={{
              fontSize: '10px',
              color: 'var(--fg3)',
              marginTop: '5px',
              fontFamily: 'var(--font-body)',
            }}
          >
            Empfehlung: alle 10–14 Tage
          </p>
        </InfoCard>
        <InfoCard title="Häutungsprotokoll">
          {molts.length === 0 ? (
            <p style={{ color: 'var(--fg3)', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
              Keine Einträge
            </p>
          ) : (
            molts.map((m, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    flexShrink: 0,
                    opacity: Math.min(1, 0.6 + i * 0.1),
                  }}
                />
                <span
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--fg)' }}
                >
                  {m}
                </span>
                {i === molts.length - 1 && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--accent)',
                      marginLeft: 'auto',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    LETZTE
                  </span>
                )}
              </div>
            ))
          )}
        </InfoCard>
        <InfoCard title="Notizen" wide>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--fg2)',
              lineHeight: '1.7',
            }}
          >
            {spider.notes || 'Keine Notizen vorhanden.'}
          </p>
        </InfoCard>

        {/* Gallery */}
        {gallery.length > 0 && (
          <InfoCard title="Galerie" wide>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '10px',
              }}
            >
              {gallery.map((url, i) => (
                <div key={i} style={{ ...thumbStyle, cursor: 'pointer' }} onClick={() => setLightboxIndex(i)}>
                  <Image src={url} alt="" fill style={{ objectFit: 'cover' }} />
                  {url === spider.image_url && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        background: 'var(--accent)',
                        color: 'var(--bg)',
                        fontSize: '9px',
                        fontFamily: 'var(--font-body)',
                        letterSpacing: '0.06em',
                        padding: '2px 6px',
                        borderRadius: '2px',
                      }}
                    >
                      PROFIL
                    </div>
                  )}
                  {isAdmin && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '6px 8px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                      }}
                    >
                      {url !== spider.image_url ? (
                        <button
                          onClick={() => handleSetProfile(url)}
                          disabled={pendingProfile === url}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            fontFamily: 'var(--font-body)',
                            fontSize: '10px',
                            letterSpacing: '0.05em',
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'underline',
                          }}
                        >
                          {pendingProfile === url ? '…' : 'Als Profilbild'}
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.4)',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          Profilbild
                        </span>
                      )}
                      <button
                        onClick={() => handleRemove(url)}
                        disabled={pendingRemove === url}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        {pendingRemove === url ? '…' : '✕'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </InfoCard>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.93)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Prev */}
          {gallery.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => ((i ?? 0) - 1 + gallery.length) % gallery.length) }}
              style={{
                position: 'absolute',
                left: 20,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '20px',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ←
            </button>
          )}

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[lightboxIndex]}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 'var(--card-radius)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}
          />

          {/* Next */}
          {gallery.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIndex(i => ((i ?? 0) + 1) % gallery.length) }}
              style={{
                position: 'absolute',
                right: 20,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '20px',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              →
            </button>
          )}

          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>

          {/* Counter */}
          {gallery.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.08em',
              }}
            >
              {lightboxIndex + 1} / {gallery.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Edit mode ─────────────────────────────────────────────────────────────────

function EditMode({
  spider,
  onCancel,
  onSaved,
}: {
  spider: Spider
  onCancel: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [profileUrl, setProfileUrl] = useState(spider.image_url ?? '')
  const [galleryUrls, setGalleryUrls] = useState<string[]>(() => {
    const urls = spider.image_urls ?? []
    if (urls.length === 0 && spider.image_url) return [spider.image_url]
    return urls
  })
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  const [tempMin, tempMax] = parseRange(spider.temp_range)
  const [humMin, humMax] = parseRange(spider.humidity_range)

  const uploadFile = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `spiders/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('spider-images').upload(path, file)
    if (error) return null
    const { data } = supabase.storage.from('spider-images').getPublicUrl(path)
    return data.publicUrl
  }

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingProfile(true)
    const url = await uploadFile(file)
    if (url) {
      setGalleryUrls(prev => (prev.includes(url) ? prev : [...prev, url]))
      setProfileUrl(url)
    }
    setUploadingProfile(false)
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingGallery(true)
    for (const file of files) {
      const url = await uploadFile(file)
      if (url) setGalleryUrls(prev => (prev.includes(url) ? prev : [...prev, url]))
    }
    setUploadingGallery(false)
  }

  const handleRemoveFromGallery = (url: string) => {
    setGalleryUrls(prev => {
      const next = prev.filter(u => u !== url)
      if (profileUrl === url) setProfileUrl(next[0] ?? '')
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    fd.set('imageUrl', profileUrl)
    fd.set('imageUrls', JSON.stringify(galleryUrls))
    try {
      await updateSpider(spider.id, fd)
      onSaved()
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  const twoCol: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  }

  const galleryThumb: React.CSSProperties = {
    position: 'relative',
    aspectRatio: '1/1',
    borderRadius: 'var(--card-radius)',
    overflow: 'hidden',
    border: '1px solid var(--card-border)',
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 32px 80px' }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <Link
          href="/"
          style={{
            color: 'var(--fg3)',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            letterSpacing: '0.06em',
            textDecoration: 'none',
          }}
        >
          ← Zurück zur Übersicht
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: '1px solid var(--card-border)',
              color: 'var(--fg2)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              letterSpacing: '0.06em',
              padding: '7px 16px',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
            }}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'var(--accent)',
              border: 'none',
              color: 'var(--bg)',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              padding: '7px 20px',
              borderRadius: 'var(--radius)',
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Speichern …' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="detail-hero" style={{ marginBottom: '24px' }}>
        <div>
          <div
            style={{
              borderRadius: 'var(--card-radius)',
              overflow: 'hidden',
              aspectRatio: '1/1',
              position: 'relative',
              border: '1px solid var(--card-border)',
            }}
          >
            {profileUrl ? (
              <Image src={profileUrl} alt={spider.name} fill style={{ objectFit: 'cover' }} />
            ) : (
              <SpiderPlaceholder color={getSpiderColor(spider.sex)} name={spider.name + 'd'} />
            )}
          </div>
          <label
            style={{
              display: 'block',
              marginTop: '10px',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--fg3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '5px',
            }}
          >
            Profilbild ändern
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileUpload}
            style={{ ...inputStyle, padding: '6px 12px', cursor: 'pointer' }}
          />
          {uploadingProfile && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--fg3)',
                marginTop: '6px',
                fontFamily: 'var(--font-body)',
              }}
            >
              Wird hochgeladen …
            </p>
          )}
        </div>

        <div>
          <Field label="Name *">
            <input
              name="name"
              required
              defaultValue={spider.name}
              style={{
                ...inputStyle,
                fontFamily: 'var(--font-head)',
                fontSize: '28px',
                fontWeight: 300,
                padding: '10px 14px',
              }}
            />
          </Field>
          <Field label="Wissenschaftl. Name *">
            <input
              name="species"
              required
              defaultValue={spider.species}
              style={{ ...inputStyle, fontStyle: 'italic' }}
            />
          </Field>
          <Field label="Gemeiner Name">
            <input name="commonName" defaultValue={spider.common_name} style={inputStyle} />
          </Field>
          <div style={twoCol}>
            <Field label="Geschlecht">
              <select name="sex" defaultValue={spider.sex} style={inputStyle}>
                <option value="Weibchen">Weibchen</option>
                <option value="Männchen">Männchen</option>
                <option value="Unbekannt">Unbekannt</option>
              </select>
            </Field>
            <Field label="Alter">
              <input name="age" defaultValue={spider.age} style={inputStyle} />
            </Field>
          </div>
        </div>
      </div>

      {/* Info sections */}
      <div className="detail-grid">
        <EditSection title="Herkunft & Habitat">
          <Field label="Herkunft">
            <input name="origin" defaultValue={spider.origin} style={inputStyle} />
          </Field>
          <Field label="Habitat">
            <input name="habitat" defaultValue={spider.habitat} style={inputStyle} />
          </Field>
        </EditSection>

        <EditSection title="Maße & Giftigkeit">
          <div style={twoCol}>
            <Field label="Körperlänge">
              <input name="bodySize" defaultValue={spider.body_size} style={inputStyle} />
            </Field>
            <Field label="Spannweite">
              <input name="span" defaultValue={spider.span} style={inputStyle} />
            </Field>
          </div>
          <Field label="Giftigkeit">
            <select name="toxicity" defaultValue={spider.toxicity} style={inputStyle}>
              <option value="sehr mild">Sehr mild</option>
              <option value="mild">Mild</option>
              <option value="mittel">Mittel</option>
              <option value="stark">Stark</option>
            </select>
          </Field>
        </EditSection>

        <EditSection title="Haltungsbedingungen">
          <div style={twoCol}>
            <Field label="Temp. Min (°C)">
              <input name="tempMin" type="number" defaultValue={tempMin} style={inputStyle} />
            </Field>
            <Field label="Temp. Max (°C)">
              <input name="tempMax" type="number" defaultValue={tempMax} style={inputStyle} />
            </Field>
          </div>
          <div style={twoCol}>
            <Field label="Luftf. Min (%)">
              <input name="humMin" type="number" defaultValue={humMin} style={inputStyle} />
            </Field>
            <Field label="Luftf. Max (%)">
              <input name="humMax" type="number" defaultValue={humMax} style={inputStyle} />
            </Field>
          </div>
        </EditSection>

        <EditSection title="Fütterung & Häutungen">
          <Field label="Letzte Fütterung">
            <input
              name="lastFed"
              type="date"
              defaultValue={spider.last_fed}
              style={inputStyle}
            />
          </Field>
          <Field label="Häutungsprotokoll (ein Eintrag pro Zeile, Format: JJJJ-MM)">
            <textarea
              name="molts"
              defaultValue={(spider.molts || []).join('\n')}
              style={{ ...inputStyle, height: '110px', resize: 'vertical' }}
              placeholder="2024-03&#10;2025-01"
            />
          </Field>
        </EditSection>

        <EditSection title="Notizen">
          <Field label="Persönliche Notizen">
            <textarea
              name="notes"
              defaultValue={spider.notes}
              style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
            />
          </Field>
        </EditSection>

        {/* Gallery management */}
        <EditSection title="Galerie">
          {galleryUrls.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              {galleryUrls.map((url, i) => (
                <div key={i} style={galleryThumb}>
                  <Image src={url} alt="" fill style={{ objectFit: 'cover' }} />
                  {url === profileUrl && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        background: 'var(--accent)',
                        color: 'var(--bg)',
                        fontSize: '8px',
                        fontFamily: 'var(--font-body)',
                        letterSpacing: '0.06em',
                        padding: '2px 5px',
                        borderRadius: '2px',
                      }}
                    >
                      PROFIL
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '4px 6px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {url !== profileUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileUrl(url)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          fontSize: '9px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        Profil
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromGallery(url)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Field label="Bilder hinzufügen">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              style={{ ...inputStyle, padding: '6px 12px', cursor: 'pointer' }}
            />
            {uploadingGallery && (
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--fg3)',
                  marginTop: '6px',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Wird hochgeladen …
              </p>
            )}
          </Field>
        </EditSection>
      </div>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SpiderDetail({ spider }: { spider: Spider }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { preview } = usePreviewMode()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setIsAdmin(!!session))
    return () => subscription.unsubscribe()
  }, [])

  const effectiveAdmin = isAdmin && !preview

  if (isEditing) {
    return (
      <EditMode
        spider={spider}
        onCancel={() => setIsEditing(false)}
        onSaved={() => {
          setIsEditing(false)
          router.refresh()
        }}
      />
    )
  }

  return (
    <ViewMode
      spider={spider}
      isAdmin={effectiveAdmin}
      onEdit={() => setIsEditing(true)}
      onRefresh={() => router.refresh()}
    />
  )
}
