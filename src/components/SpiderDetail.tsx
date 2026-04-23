'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SpiderPlaceholder from './SpiderPlaceholder'
import { updateSpider } from '@/app/admin/actions'
import { daysSince, toxBadgeColor, getSpiderColor } from '@/lib/utils'
import type { Spider } from '@/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

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
}: {
  spider: Spider
  isAdmin: boolean
  onEdit: () => void
}) {
  const days = daysSince(spider.last_fed)
  const barWidth = Math.min(100, (days / 14) * 100)
  const barColor = days > 10 ? 'var(--accent2)' : 'var(--accent)'
  const molts: string[] = spider.molts || []

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
      </div>
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
  const [imageUrl, setImageUrl] = useState(spider.image_url ?? '')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [tempMin, tempMax] = parseRange(spider.temp_range)
  const [humMin, humMax] = parseRange(spider.humidity_range)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `spiders/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('spider-images').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('spider-images').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    }
    setUploadingImage(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    fd.set('imageUrl', imageUrl)
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

      {/* Hero: image + basic fields */}
      <div className="detail-hero" style={{ marginBottom: '24px' }}>
        {/* Image */}
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
            {imageUrl ? (
              <Image src={imageUrl} alt={spider.name} fill style={{ objectFit: 'cover' }} />
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
            Foto ändern
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ ...inputStyle, padding: '6px 12px', cursor: 'pointer' }}
          />
          {uploadingImage && (
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

        {/* Basic fields */}
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
              <input
                name="tempMin"
                type="number"
                defaultValue={tempMin}
                style={inputStyle}
              />
            </Field>
            <Field label="Temp. Max (°C)">
              <input
                name="tempMax"
                type="number"
                defaultValue={tempMax}
                style={inputStyle}
              />
            </Field>
          </div>
          <div style={twoCol}>
            <Field label="Luftf. Min (%)">
              <input
                name="humMin"
                type="number"
                defaultValue={humMin}
                style={inputStyle}
              />
            </Field>
            <Field label="Luftf. Max (%)">
              <input
                name="humMax"
                type="number"
                defaultValue={humMax}
                style={inputStyle}
              />
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

      </div>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SpiderDetail({ spider }: { spider: Spider }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setIsAdmin(!!session))
    return () => subscription.unsubscribe()
  }, [])

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
    <ViewMode spider={spider} isAdmin={isAdmin} onEdit={() => setIsEditing(true)} />
  )
}
