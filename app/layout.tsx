import type { Metadata } from 'next'
import { Manrope, Playfair_Display, Inter, Josefin_Sans } from 'next/font/google'
import { ClientProviders } from './client-providers'
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${josefin.variable}`}>
      <body className={`${manrope.className} antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
