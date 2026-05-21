import type { Metadata } from 'next'
import { Manrope, Playfair_Display, Inter, Josefin_Sans } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'

const manrope = Manrope({ subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const josefin = Josefin_Sans({ subsets: ["latin"], variable: "--font-josefin", display: "swap" });

export const metadata: Metadata = {
  title: 'SalonBOS - Business OS',
  description: 'Salon Business Management System',
  generator: 'v0.app',
  icons: {
    icon: '/icon.svg',
  },
}

import { BookingProvider } from '@/context/BookingContext'
import { BusinessProvider } from '@/context/BusinessContext'

// Heavy components loaded only when needed — not in the initial JS bundle
const BookingModal = dynamic(
  () => import('@/components/booking-modal').then(m => ({ default: m.BookingModal })),
  { ssr: false }
)
const Toaster = dynamic(
  () => import('sonner').then(m => ({ default: m.Toaster })),
  { ssr: false }
)

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
          </BookingProvider>
        </BusinessProvider>
      </body>
    </html>
  )
}
