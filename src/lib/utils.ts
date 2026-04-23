export function daysSince(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / 86400000)
}

export function toxBadgeColor(tox: string): string {
  if (tox.includes('sehr mild')) return 'oklch(0.62 0.16 145)'
  if (tox.includes('mild')) return 'oklch(0.65 0.14 95)'
  if (tox.includes('mittel')) return 'oklch(0.65 0.15 55)'
  return 'oklch(0.60 0.18 25)'
}

export function randomOklchColor(): string {
  const hue = Math.floor(Math.random() * 360)
  return `oklch(0.50 0.15 ${hue})`
}

export function getSpiderColor(sex: string): string {
  if (sex === 'Männchen') return 'oklch(0.62 0.18 225)' // slate-blue
  return 'oklch(0.68 0.15 345)'                         // rose (Weibchen + Unbekannt)
}
