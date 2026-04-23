'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function WebIcon() {
  return (
    <svg viewBox="0 0 28 28" width="22" height="22">
      <circle cx="14" cy="14" r="5" fill="var(--accent)" opacity="0.9" />
      {[0, 1, 2, 3].map(i => (
        <line
          key={i}
          x1="14"
          y1="14"
          x2={14 + 12 * Math.cos((i * Math.PI) / 4)}
          y2={14 + 12 * Math.sin((i * Math.PI) / 4)}
          stroke="var(--accent)"
          strokeOpacity="0.5"
          strokeWidth="1"
        />
      ))}
      {[6, 10].map(r => (
        <circle
          key={r}
          cx="14"
          cy="14"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.3"
          strokeWidth="0.8"
        />
      ))}
    </svg>
  )
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      style={{
        background: active ? 'var(--bg2)' : 'none',
        border: 'none',
        color: active ? 'var(--accent)' : 'var(--fg2)',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        letterSpacing: '0.06em',
        padding: '6px 14px',
        cursor: 'pointer',
        borderRadius: 'var(--radius)',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'color 0.2s',
      }}
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isAdminActive =
    pathname === '/admin' || (pathname.startsWith('/admin') && pathname !== '/admin/login')

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: '60px',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--card-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          gap: '8px',
        }}
      >
        <WebIcon />
        <span
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '0.18em',
            color: 'var(--fg)',
          }}
        >
          SPIDEY
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <NavLink href="/" active={pathname === '/'}>
          Übersicht
        </NavLink>
        {isAdmin && (
          <NavLink href="/admin" active={isAdminActive}>
            Admin
          </NavLink>
        )}
        {!isAdmin && (
          <NavLink href="/admin/login" active={pathname === '/admin/login'}>
            Admin Login
          </NavLink>
        )}
        {isAdmin && (
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--fg3)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              letterSpacing: '0.06em',
              padding: '6px 14px',
              cursor: 'pointer',
              borderRadius: 'var(--radius)',
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}
