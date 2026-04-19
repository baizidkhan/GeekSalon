"use client"

import { useState, useEffect } from "react"
import { User, getAccessToken, getUserFromToken } from "@/lib/auth-utils"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      const decoded = getUserFromToken(token)
      setUser(decoded)
    }
    setLoading(false)
  }, [])

  return { user, loading }
}
