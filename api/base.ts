import axios from 'axios'
import { setupCache, buildMemoryStorage, buildStorage } from 'axios-cache-interceptor'

const isServerSide = typeof window === 'undefined'

const apiBaseURL = isServerSide
  ? process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://server:4000'
  : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
})

// Persist cache in localStorage on the client so navigating back to a page
// renders instantly from disk instead of waiting for a network round-trip.
const storage = isServerSide
  ? buildMemoryStorage()
  : buildStorage({
      find(key) {
        try {
          const raw = localStorage.getItem(`aci:${key}`)
          return raw ? JSON.parse(raw) : undefined
        } catch {
          return undefined
        }
      },
      set(key, value) {
        try {
          localStorage.setItem(`aci:${key}`, JSON.stringify(value))
        } catch {
          // Ignore QuotaExceededError — graceful degradation to in-memory only
        }
      },
      remove(key) {
        try { localStorage.removeItem(`aci:${key}`) } catch { }
      },
    })

const api = setupCache(axiosInstance, {
  storage,
  ttl: 5 * 60 * 1000,    // 5 min default — overridden per endpoint below
  methods: ['get'],
  interpretHeader: false,  // never let server Cache-Control shorten our TTL
  staleIfError: 2 * 60 * 1000, // serve stale data for 2 extra minutes on server errors
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try { await axiosInstance.post(`${apiBaseURL}/auth/logout`) } catch { }
      if (!isServerSide) window.location.replace('/login')
    }
    return Promise.reject(error)
  }
)

export default api
