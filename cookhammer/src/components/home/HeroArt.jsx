// Leuchtende Hero-Grafik: Neon-Shopping-Bag + TikTok-Note + Sparkles + Trend-Pfeil.
export function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="ha-pink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5c7e" />
          <stop offset="1" stopColor="#fe2c55" />
        </linearGradient>
        <filter id="ha-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ha-glow-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Trend-Pfeil (Umsatz steigt) */}
      <g filter="url(#ha-glow-soft)" stroke="#25f4ee" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M34 150 L60 124 L78 138 L112 100" />
        <path d="M96 96 L114 96 L114 114" />
      </g>

      {/* Shopping-Bag */}
      <g filter="url(#ha-glow)">
        <path d="M78 78 H150 L143 142 a13 13 0 0 1 -13 11 H98 a13 13 0 0 1 -13 -11 Z"
          fill="rgba(254,44,85,0.10)" stroke="url(#ha-pink)" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M96 78 v-6 a18 18 0 0 1 36 0 v6"
          fill="none" stroke="url(#ha-pink)" strokeWidth="4.5" strokeLinecap="round" />
      </g>

      {/* TikTok-Note in der Bag */}
      <g filter="url(#ha-glow-soft)">
        <path d="M120 96 v30 a11 11 0 1 1 -8 -10.6 V100 c5 5 10 6 15 6 v-7 c-4 0 -7 -1.5 -7 -6 Z" fill="#25f4ee" />
        <path d="M117 94 v30 a11 11 0 1 1 -8 -10.6 V98 c5 5 10 6 15 6 v-7 c-4 0 -7 -1.5 -7 -6 Z" fill="#ffffff" />
      </g>

      {/* Sparkles */}
      <g fill="#ffffff" filter="url(#ha-glow-soft)">
        <path d="M158 60 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z" fill="#25f4ee" />
        <path d="M168 110 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
        <path d="M62 64 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#fe2c55" />
      </g>
    </svg>
  )
}
