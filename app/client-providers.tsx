'use client'

import dynamic from 'next/dynamic'
import { BookingProvider } from '@/context/BookingContext'
import { BusinessProvider } from '@/context/BusinessContext'

const BookingModal = dynamic(
  () => import('@/components/booking-modal').then(m => ({ default: m.BookingModal })),
  { ssr: false }
)
const Toaster = dynamic(
  () => import('sonner').then(m => ({ default: m.Toaster })),
  { ssr: false }
)

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      <BookingProvider>
        {children}
        <BookingModal />
        <Toaster position="top-center" theme="dark" richColors />
      </BookingProvider>
    </BusinessProvider>
  )
}
