import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Snova Admin',
  description: 'Snova Studio Admin Panel',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: '#08061A', color: 'white', fontFamily: 'Outfit, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
