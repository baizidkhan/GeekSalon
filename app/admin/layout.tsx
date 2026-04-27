import { Toaster } from 'sonner'
import { AuthGuard } from '@admin/components/auth-guard'
import { cookies } from 'next/headers'
import { getUserFromToken } from '@admin/lib/auth-utils'
import { Analytics } from '@vercel/analytics/next'
import { BiometricProvider } from '@/components/biometric/biometric-provider'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value || cookieStore.get('token')?.value
  const initialUser = token ? getUserFromToken(token) : null

  return (
    <>
      <AuthGuard initialUser={initialUser}>
        <BiometricProvider>
          {children}
        </BiometricProvider>
      </AuthGuard>
      <Toaster position="top-right" richColors />
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </>
  )
}
