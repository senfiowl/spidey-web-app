'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import SpiderPlaceholder from './SpiderPlaceholder'
import { addSpider, deleteSpider } from '@/app/admin/actions'
import { getSpiderColor } from '@/lib/utils'
import type { Spider } from '@/types'

type SpiderImport = {
  name?: string
  species?: string
  commonName?: string
  sex?: string
  age?: string
  origin?: string
  habitat?: string
  bodySize?: string
  span?: string
  toxicity?: string
  tempMin?: string | number
  tempMax?: string | number
  humMin?: string | number
  humMax?: string | number
  lastFed?: string
  notes?: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--card-border)',
  color: 'var(--fg)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  padding: '9px 12px',
  borderRadius: 'var(--radius)',
  outline: 'none',
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
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
        {required && (
          <span style={{ color: 'var(--accent)', marginLeft: '3px' }}>*</span>
        )}
      </label>
      {children}
    </div>
  )
}

function FormSection({
  title,
  children,
  last,
}: {
  title: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      style={{
        marginBottom: '24px',
        paddingBottom: '24px',
        borderBottom: last ? 'none' : '1px solid var(--card-border)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-head)',
          fontSize: '16px',
          fontWeight: 400,
          color: 'var(--accent)',
          marginBottom: '14px',
          letterSpacing: '0.04em',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function AdminDashboard({ spiders: initial }: { spiders: Spider[] }) {
  const [spiders, setSpiders] = useState<Spider[]>(initial)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [formSex, setFormSex] = useState('Weibchen')
  const [formKey, setFormKey] = useState(0)
  const [importedValues, setImportedValues] = useState<SpiderImport>({})
  const formRef = useRef<HTMLFormElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)

  const iv = (key: keyof SpiderImport): string => String(importedValues[key] ?? '')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingImage(true)
    const supabase = createClient()
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `spiders/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('spider-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('spider-images').getPublicUrl(path)
        setImageUrls(prev => [...prev, data.publicUrl])
      }
    }
    setUploadingImage(false)
  }

  const handleRemoveImage = (url: string) => {
    setImageUrls(prev => prev.filter(u => u !== url))
  }

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data: SpiderImport = JSON.parse(ev.target?.result as string)
        setImportedValues(data)
        setFormSex(data.sex ?? 'Weibchen')
        setFormKey(k => k + 1)
      } catch {
        alert('Ungültiges JSON-Format')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    fd.set('imageUrls', JSON.stringify(imageUrls))
    try {
      await addSpider(fd)
      setSaved(true)
      setImageUrls([])
      setFormSex('Weibchen')
      setImportedValues({})
      setFormKey(k => k + 1)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Spinne wirklich aus der Sammlung löschen?')) return
    setSpiders(prev => prev.filter(s => s.id !== id))
    try {
      await deleteSpider(id)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="admin-layout">
      {/* Add form */}
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--card-radius)',
          padding: '32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: '22px',
              fontWeight: 400,
              color: 'var(--fg)',
            }}
          >
            Neue Spinne hinzufügen
          </h2>
          <div>
            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              onChange={handleJsonImport}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              style={{
                background: 'none',
                border: '1px solid var(--card-border)',
                color: 'var(--fg3)',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '0.06em',
                padding: '6px 12px',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
              }}
            >
              JSON importieren
            </button>
          </div>
        </div>

        <form key={formKey} ref={formRef} onSubmit={handleSubmit}>
          {/* Grunddaten */}
          <FormSection title="Grunddaten">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Name" required>
                <input
                  name="name"
                  required
                  style={inputStyle}
                  placeholder="z.B. Helene"
                  defaultValue={iv('name')}
                />
              </Field>
              <Field label="Wissenschaftl. Name" required>
                <input
                  name="species"
                  required
                  style={inputStyle}
                  placeholder="z.B. Theraphosa blondi"
                  defaultValue={iv('species')}
                />
              </Field>
            </div>
            <Field label="Gemeiner Name">
              <input
                name="commonName"
                style={inputStyle}
                placeholder="z.B. Goliath Bird Eater"
                defaultValue={iv('commonName')}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Geschlecht">
                <select
                  name="sex"
                  style={inputStyle}
                  value={formSex}
                  onChange={e => setFormSex(e.target.value)}
                >
                  <option value="Weibchen">Weibchen</option>
                  <option value="Männchen">Männchen</option>
                  <option value="Unbestimmt">Unbestimmt</option>
                </select>
              </Field>
              <Field label="Alter">
                <input
                  name="age"
                  style={inputStyle}
                  placeholder="z.B. 3 Jahre"
                  defaultValue={iv('age')}
                />
              </Field>
            </div>
          </FormSection>

          {/* Herkunft */}
          <FormSection title="Herkunft">
            <Field label="Herkunftsland / -region">
              <input
                name="origin"
                style={inputStyle}
                placeholder="z.B. Venezuela, Brasilien"
                defaultValue={iv('origin')}
              />
            </Field>
            <Field label="Habitat">
              <input
                name="habitat"
                style={inputStyle}
                placeholder="z.B. Tropischer Regenwald"
                defaultValue={iv('habitat')}
              />
            </Field>
          </FormSection>

          {/* Maße & Giftigkeit */}
          <FormSection title="Maße & Giftigkeit">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Körperlänge">
                <input
                  name="bodySize"
                  style={inputStyle}
                  placeholder="z.B. 8 cm"
                  defaultValue={iv('bodySize')}
                />
              </Field>
              <Field label="Spannweite">
                <input
                  name="span"
                  style={inputStyle}
                  placeholder="z.B. 18 cm"
                  defaultValue={iv('span')}
                />
              </Field>
            </div>
            <Field label="Giftigkeit">
              <select
                name="toxicity"
                style={inputStyle}
                defaultValue={iv('toxicity') || 'sehr mild'}
              >
                <option value="sehr mild">Sehr mild</option>
                <option value="mild">Mild</option>
                <option value="mittel">Mittel</option>
                <option value="stark">Stark</option>
              </select>
            </Field>
          </FormSection>

          {/* Haltungsbedingungen */}
          <FormSection title="Haltungsbedingungen">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Temp. Min (°C)">
                <input
                  name="tempMin"
                  type="number"
                  style={inputStyle}
                  placeholder="24"
                  defaultValue={iv('tempMin')}
                />
              </Field>
              <Field label="Temp. Max (°C)">
                <input
                  name="tempMax"
                  type="number"
                  style={inputStyle}
                  placeholder="28"
                  defaultValue={iv('tempMax')}
                />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Luftf. Min (%)">
                <input
                  name="humMin"
                  type="number"
                  style={inputStyle}
                  placeholder="70"
                  defaultValue={iv('humMin')}
                />
              </Field>
              <Field label="Luftf. Max (%)">
                <input
                  name="humMax"
                  type="number"
                  style={inputStyle}
                  placeholder="80"
                  defaultValue={iv('humMax')}
                />
              </Field>
            </div>
            <Field label="Letzte Fütterung">
              <input
                name="lastFed"
                type="date"
                style={inputStyle}
                defaultValue={iv('lastFed')}
              />
            </Field>
          </FormSection>

          {/* Fotos & Notizen */}
          <FormSection title="Fotos & Notizen" last>
            <Field label="Fotos">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ ...inputStyle, padding: '7px 12px', cursor: 'pointer' }}
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
              {imageUrls.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginTop: '10px',
                  }}
                >
                  {imageUrls.map((url, i) => (
                    <div key={url} style={{ position: 'relative', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          position: 'relative',
                          border: '1px solid var(--card-border)',
                        }}
                      >
                        <Image src={url} alt="Vorschau" fill style={{ objectFit: 'cover' }} />
                        {i === 0 && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'var(--accent)',
                              fontSize: '8px',
                              textAlign: 'center',
                              color: 'var(--bg)',
                              fontFamily: 'var(--font-body)',
                              padding: '1px 0',
                              letterSpacing: '0.04em',
                            }}
                          >
                            PROFIL
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          background: 'var(--danger)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '17px',
                          height: '17px',
                          fontSize: '9px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
            <Field label="Persönliche Notizen">
              <textarea
                name="notes"
                style={{ ...inputStyle, height: '90px', resize: 'vertical' }}
                placeholder="Beobachtungen, Besonderheiten …"
                defaultValue={iv('notes')}
              />
            </Field>
          </FormSection>

          {saved && (
            <div
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius)',
                padding: '10px 14px',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--accent)',
                marginBottom: '12px',
              }}
            >
              ✓ Spinne erfolgreich hinzugefügt!
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              marginTop: '8px',
              background: 'var(--accent)',
              color: 'var(--bg)',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              padding: '12px',
              borderRadius: 'var(--radius)',
              cursor: saving ? 'default' : 'pointer',
              letterSpacing: '0.08em',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Wird gespeichert …' : 'Spinne hinzufügen'}
          </button>
        </form>
      </div>

      {/* Sidebar: existing spiders */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: '22px',
            fontWeight: 400,
            color: 'var(--fg)',
            marginBottom: '16px',
          }}
        >
          Bestand ({spiders.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {spiders.map(sp => (
            <div
              key={sp.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg2)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--card-radius)',
                padding: '10px 14px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {sp.image_url ? (
                  <Image
                    src={sp.image_url}
                    alt={sp.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <SpiderPlaceholder color={getSpiderColor(sp.sex)} name={sp.name + 'a'} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-head)',
                    fontSize: '16px',
                    color: 'var(--fg)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {sp.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'var(--fg3)',
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {sp.species}
                </div>
              </div>
              <button
                onClick={() => handleDelete(sp.id)}
                style={{
                  background: 'none',
                  border: '1px solid var(--card-border)',
                  color: 'var(--fg3)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '2px',
                  flexShrink: 0,
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {spiders.length === 0 && (
            <p
              style={{
                color: 'var(--fg3)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
              }}
            >
              Noch keine Spinnen vorhanden.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
