'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function WebIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      width="40"
      height="40"
      style={{ margin: '0 auto 20px', display: 'block' }}
    >
      <circle cx="20" cy="20" r="7" fill="var(--accent)" opacity="0.9" />
      {[0, 1, 2, 3].map(i => (
        <line
          key={i}
          x1="20"
          y1="20"
          x2={20 + 17 * Math.cos((i * Math.PI) / 4)}
          y2={20 + 17 * Math.sin((i * Math.PI) / 4)}
          stroke="var(--accent)"
          strokeOpacity="0.4"
          strokeWidth="1"
        />
      ))}
      {[9, 14].map(r => (
        <circle
          key={r}
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
      ))}
    </svg>
  )
}

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@spidey.local'

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password,
    })

    if (authError) {
      setError('Falsches Passwort.')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--fg)',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    outline: 'none',
    marginBottom: '6px',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 60px)',
        padding: '40px',
      }}
    >
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--card-radius)',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '360px',
          textAlign: 'center',
        }}
      >
        <WebIcon />
        <h2
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: '28px',
            fontWeight: 400,
            color: 'var(--fg)',
            marginBottom: '6px',
          }}
        >
          Admin Login
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--fg3)',
            marginBottom: '28px',
            letterSpacing: '0.06em',
          }}
        >
          Nur für autorisierte Halter
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--fg3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            Passwort
          </label>
          <input
            type="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="••••••••"
            style={inputStyle}
          />
          {error && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--danger)',
                fontFamily: 'var(--font-body)',
                marginTop: '4px',
              }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '12px',
              background: 'var(--accent)',
              color: 'var(--bg)',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '11px',
              borderRadius: '11px',
              cursor: loading ? 'default' : 'pointer',
              letterSpacing: '0.08em',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Prüfe …' : 'Einloggen'}
          </button>
        </form>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--fg3)',
            marginTop: '24px',
          }}
        >
          Anmeldung via Supabase Auth
        </p>
      </div>
    </div>
  )
}
