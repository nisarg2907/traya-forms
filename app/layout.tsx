import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Traya Dx Hair Diagnosis',
  description:
    'Traya combines dermatology, Ayurveda, and nutrition to build customised hair loss plans that target the root cause delivering assured results.',
  generator: 'v0.app',
  metadataBase: new URL('https://traya.health'),
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    siteName: 'Traya',
    url: 'https://traya.health/pages/result4',
    title: 'Hair Test Result',
    type: 'website',
    description:
      'Traya combines dermatology, Ayurveda, and nutrition to build customised hair loss plans that target the root cause delivering assured results.',
    images: [
      {
        url: 'https://traya.health/cdn/shop/files/Traya_Logo_f6bd592d-1eed-4a4f-8933-63838602ede6.jpg?v=1611833411',
        width: 603,
        height: 189,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hair Test Result',
    description:
      'Traya combines dermatology, Ayurveda, and nutrition to build customised hair loss plans that target the root cause delivering assured results.',
    images: [
      'https://traya.health/cdn/shop/files/Traya_Logo_f6bd592d-1eed-4a4f-8933-63838602ede6.jpg?v=1611833411',
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
