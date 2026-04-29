import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: 'SalonBOS - Business OS',
  description: 'Salon Business Management System',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

import { BookingProvider } from '@/context/BookingContext'
import { BusinessProvider } from '@/context/BusinessContext'
import { BookingModal } from '@/components/booking-modal'
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={playfair.variable}>
      <body className="font-sans antialiased">
        <BusinessProvider>
          <BookingProvider>
            {children}
            <BookingModal />
            <Toaster position="top-center" theme="dark" richColors />
          </BookingProvider>
        </BusinessProvider>
      </body>
    </html>
  )
}
