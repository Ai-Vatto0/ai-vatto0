// Rendert die PWA-PNG-Icons aus public/icon.svg.
// Aufruf:  node scripts/gen-icons.mjs
// Nutzt @resvg/resvg-js (vorkompilierte Binaries, kein node-gyp/Windows-Build).
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public', 'icon.svg'), 'utf8')

// [Dateiname, Größe] — 180 = apple-touch-icon, 192/512 = manifest
const targets = [
  ['icon-180.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]

for (const [name, size] of targets) {
  const r = new Resvg(svg, {
    background: '#000000',                 // deckend schwarz, iOS-sicher (keine transparenten Ecken)
    fitTo: { mode: 'width', value: size },
  })
  writeFileSync(join(root, 'public', name), r.render().asPng())
  console.log('✓', name, `${size}x${size}`)
}
console.log('Fertig — 3 Icons in public/ erzeugt.')
