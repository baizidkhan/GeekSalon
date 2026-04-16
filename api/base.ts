import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear the cookie server-side before redirecting, so proxy doesn't loop
      try { await api.post('/auth/logout') } catch {}
      window.location.replace('/login')
    }
    return Promise.reject(error)
  }
)

export default api
