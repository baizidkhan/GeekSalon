import { DashboardLayout } from "@admin/components/dashboard-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className="font-admin contents">
        {children}
      </div>
    </DashboardLayout>
  )
}
