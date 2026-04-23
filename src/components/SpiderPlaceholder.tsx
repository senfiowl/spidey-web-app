interface Props {
  color: string
  name: string
}

const r2 = (n: number) => Math.round(n * 100) / 100

export default function SpiderPlaceholder({ color, name }: Props) {
  const id = `g${name.replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <radialGradient id={id} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="oklch(0.07 0.02 148)" />
      {[0, 1, 2, 3].map(i => (
        <line
          key={i}
          x1="100"
          y1="100"
          x2={r2(100 + 90 * Math.cos((i * Math.PI) / 4))}
          y2={r2(100 + 90 * Math.sin((i * Math.PI) / 4))}
          stroke={color}
          strokeOpacity="0.15"
          strokeWidth="0.5"
        />
      ))}
      {[30, 55, 80].map(r => (
        <circle
          key={r}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={color}
          strokeOpacity="0.10"
          strokeWidth="0.5"
        />
      ))}
      <ellipse cx="100" cy="108" rx="22" ry="18" fill={color} fillOpacity="0.85" />
      <ellipse cx="100" cy="85" rx="14" ry="12" fill={color} fillOpacity="0.75" />
      {[-1, 1].flatMap(s =>
        [1, 2, 3, 4].map(l => {
          const angle = (s * (35 + l * 18) * Math.PI) / 180
          const startX = 100 + s * 20
          const startY = 100 + (l - 2) * 6
          return (
            <line
              key={`${s}${l}`}
              x1={startX}
              y1={startY}
              x2={r2(startX + s * 50 * Math.cos(angle))}
              y2={r2(startY + 50 * Math.abs(Math.sin(angle)) + 10)}
              stroke={color}
              strokeOpacity="0.7"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )
        })
      )}
      {[-5, -2, 2, 5].map(x => (
        <circle
          key={x}
          cx={100 + x}
          cy={80}
          r="1.8"
          fill="oklch(0.9 0.02 80)"
          fillOpacity="0.9"
        />
      ))}
      <rect width="200" height="200" fill={`url(#${id})`} />
    </svg>
  )
}
