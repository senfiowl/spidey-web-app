'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import SpiderPlaceholder from './SpiderPlaceholder'
import { updateLastFed, addMolt } from '@/app/admin/actions'
import { daysSince, toxBadgeColor, getSpiderColor } from '@/lib/utils'
import type { Spider } from '@/types'

interface Props {
  spider: Spider
  isAdmin?: boolean
}

type ActionState = 'idle' | 'loading' | 'done'

export default function SpiderCard({ spider, isAdmin }: Props) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [fedState, setFedState] = useState<ActionState>('idle')
  const [moltState, setMoltState] = useState<ActionState>('idle')
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const days = daysSince(spider.last_fed)
  const color = getSpiderColor(spider.sex)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleUpdateFed = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setFedState('loading')
    await updateLastFed(spider.id)
    setFedState('done')
    router.refresh()
    setTimeout(() => setFedState('idle'), 2000)
  }

  const handleAddMolt = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setMoltState('loading')
    await addMolt(spider.id)
    setMoltState('done')
    router.refresh()
    setTimeout(() => setMoltState('idle'), 2000)
  }

  const menuItemStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    color: 'var(--fg)',
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    padding: '9px 14px',
    cursor: 'pointer',
    letterSpacing: '0.03em',
    transition: 'background 0.15s',
  }

  return (
    <div
      onClick={() => router.push(`/spiders/${spider.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--card-bg)',
        border: `1px solid ${hovered ? color : 'var(--card-border)'}`,
        borderRadius: 'var(--card-radius)',
        cursor: 'pointer',
        transition: 'border-color 0.25s, transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${color}22`
          : '0 2px 8px rgba(0,0,0,0.3)',
        position: 'relative',
      }}
    >
      {/* Image area — overflow:hidden here so the menu can escape the card */}
      <div
        style={{
          aspectRatio: '1/1',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 'var(--card-radius) var(--card-radius) 0 0',
        }}
      >
        {spider.image_url ? (
          <Image
            src={spider.image_url}
            alt={spider.name}
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <SpiderPlaceholder color={color} name={spider.name} />
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(transparent, var(--card-bg))',
          }}
        />
        {/* Sex badge */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: `${color}28`,
            border: `1px solid ${color}90`,
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '11px',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            color: color,
            letterSpacing: '0.07em',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span style={{ fontSize: '13px' }}>
            {spider.sex === 'Weibchen' ? '♀' : spider.sex === 'Männchen' ? '♂' : '?'}
          </span>
          {spider.sex === 'Weibchen' ? 'Weibchen' : spider.sex === 'Männchen' ? 'Männchen' : 'Unbestimmt'}
        </div>
      </div>

      {/* Info block */}
      <div style={{ padding: '14px 16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '4px',
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
            {spider.name}
          </h2>
          <span
            style={{
              fontSize: '10px',
              color: days > 10 ? 'var(--accent2)' : 'var(--fg3)',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
              marginTop: '4px',
            }}
          >
            {days}T. seit Fütterung
          </span>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--fg2)',
            marginBottom: '3px',
            letterSpacing: '0.03em',
            fontStyle: 'italic',
          }}
        >
          {spider.species}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--fg3)',
            marginBottom: '12px',
            letterSpacing: '0.04em',
          }}
        >
          {spider.common_name}
        </p>

        {/* Tags row + admin menu */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                background: 'var(--bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '2px',
                color: 'var(--fg2)',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-body)',
              }}
            >
              ⧖ {spider.age}
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 8px',
                background: 'var(--bg)',
                border: '1px solid',
                borderColor: toxBadgeColor(spider.toxicity),
                borderRadius: '2px',
                color: toxBadgeColor(spider.toxicity),
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-body)',
              }}
            >
              ◈ {spider.toxicity}
            </span>
          </div>

          {/* 3-dot admin menu */}
          {isAdmin && (
            <div
              ref={menuRef}
              style={{ position: 'relative', flexShrink: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setMenuOpen(v => !v)}
                title="Aktionen"
                style={{
                  background: menuOpen ? 'var(--bg3)' : 'none',
                  border: '1px solid transparent',
                  color: 'var(--fg3)',
                  cursor: 'pointer',
                  fontSize: '15px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  lineHeight: 1,
                  letterSpacing: '0.05em',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                ···
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 6px)',
                    right: 0,
                    background: 'var(--bg2)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--card-radius)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                    zIndex: 50,
                    minWidth: '210px',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    style={menuItemStyle}
                    onMouseEnter={e =>
                      ((e.target as HTMLElement).style.background = 'var(--bg3)')
                    }
                    onMouseLeave={e =>
                      ((e.target as HTMLElement).style.background = 'none')
                    }
                    onClick={handleUpdateFed}
                    disabled={fedState === 'loading'}
                  >
                    {fedState === 'done'
                      ? '✓ Fütterung aktualisiert'
                      : fedState === 'loading'
                        ? '…'
                        : '🍽 Letzte Fütterung aktualisieren'}
                  </button>
                  <div
                    style={{ height: '1px', background: 'var(--card-border)', margin: '0 14px' }}
                  />
                  <button
                    style={menuItemStyle}
                    onMouseEnter={e =>
                      ((e.target as HTMLElement).style.background = 'var(--bg3)')
                    }
                    onMouseLeave={e =>
                      ((e.target as HTMLElement).style.background = 'none')
                    }
                    onClick={handleAddMolt}
                    disabled={moltState === 'loading'}
                  >
                    {moltState === 'done'
                      ? '✓ Häutung hinzugefügt'
                      : moltState === 'loading'
                        ? '…'
                        : '🔄 Häutung heute hinzufügen'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
