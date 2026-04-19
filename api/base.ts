import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear the session and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('token')
        // Only redirect if not already on login page to avoid loops
        if (window.location.pathname !== '/login') {
          window.location.replace('/login')
        }
      }
      try { await api.post('/auth/logout') } catch {}
    }
    return Promise.reject(error)
  }
)

export default api
