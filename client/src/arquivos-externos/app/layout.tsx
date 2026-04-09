import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Home',
  description: 'Plataforma de doação e troca de livros entre leitores',
  generator: 'next.js',
  icons: {
    icon: [
      {
        url: '/images.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/images.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/images.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/images.jpg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
