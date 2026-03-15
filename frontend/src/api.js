import axios from 'axios'

// Use Vite env first (VITE_API_BASE_URL), otherwise fall back to Laravel backend on 8000.
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
