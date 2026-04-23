import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Spidey – Spinnen Manager',
  description: 'Persönliche Vogelspinnen-Sammlung',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
