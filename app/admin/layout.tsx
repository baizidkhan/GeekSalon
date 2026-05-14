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
    <div className="admin-root min-h-screen font-admin">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://api.fontshare.com/v2/css?f[]=general-sans@200,300,400,500,600,700&display=swap" rel="stylesheet" />
      <AuthGuard initialUser={initialUser}>
        <BiometricProvider>
          {children}
        </BiometricProvider>
      </AuthGuard>
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </div>
  )
}
