"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getBusinessInfo } from "@/api/settings/settings"

interface BusinessContextValue {
  businessName: string
  refresh: () => Promise<void>
}

const BusinessContext = createContext<BusinessContextValue>({
  businessName: "GeekSalon",
  refresh: async () => {},
})

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [businessName, setBusinessName] = useState("GeekSalon")

  const refresh = useCallback(async () => {
    try {
      const info = await getBusinessInfo()
      if (info?.businessName) setBusinessName(info.businessName)
    } catch {
      // keep existing name on error
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <BusinessContext.Provider value={{ businessName, refresh }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusinessName() {
  return useContext(BusinessContext)
}
