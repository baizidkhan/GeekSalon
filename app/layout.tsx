import type { Metadata } from 'next'
import { Manrope, Playfair_Display, Inter, Josefin_Sans } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const josefin = Josefin_Sans({ subsets: ["latin"], variable: "--font-josefin", display: "swap" });

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
import { PublicChatWidget } from '@/components/ai/PublicChatWidget'

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${josefin.variable}`}>
      <body className={`${manrope.className} antialiased`}>
        <BusinessProvider>
          <BookingProvider>
            {children}
            <BookingModal />
            <Toaster position="top-center" theme="dark" richColors />
            {/* <PublicChatWidget tenantId={process.env.NEXT_PUBLIC_TENANT_ID ?? 'default'} /> */}
          </BookingProvider>
        </BusinessProvider>
      </body>
    </html>
  )
}
