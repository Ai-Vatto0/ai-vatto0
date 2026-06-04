import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// host: true  → vom iPhone im selben WLAN erreichbar (http://<PC-IP>:3000)
// port 3000   → fester Port, damit die Adresse stabil bleibt
export default defineConfig({
  root: import.meta.dirname,                        // fester Root (unabhängig vom CWD)
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },      // verhindert doppelte React-Kopie
  server: { host: true, port: 3000 },
  preview: { host: true, port: 3000 },
})
