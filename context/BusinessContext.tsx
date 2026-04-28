"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getBusinessInfo, BusinessInfo } from "@admin/api/settings/settings"

interface BusinessContextValue {
  businessInfo: BusinessInfo | null
  businessName: string
  refresh: () => Promise<void>
}

const BusinessContext = createContext<BusinessContextValue>({
  businessInfo: null,
  businessName: "GeekSalon",
  refresh: async () => {},
})

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [businessName, setBusinessName] = useState("GeekSalon")

  const refresh = useCallback(async () => {
    try {
      const info = await getBusinessInfo()
      if (info) {
        setBusinessInfo(info)
        if (info.businessName) {
          setBusinessName(info.businessName)
        }
      }
    } catch (error) {
      console.error("Failed to fetch business info:", error)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <BusinessContext.Provider value={{ businessInfo, businessName, refresh }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  return useContext(BusinessContext)
}
