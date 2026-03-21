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
      window.location.href = '/elearning'
    }
    return Promise.reject(err)
  }
)

export default api

// Helper: convert any image path (old /storage/... or new /api/files/...) to a full URL served through the API
const API_ORIGIN = new URL(BASE).origin
export function imgUrl(path) {
  if (!path) return ''
  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // Convert old /storage/X to /api/files/X
  if (path.startsWith('/storage/')) path = '/api/files/' + path.slice('/storage/'.length)
  // Ensure it goes through the API origin
  if (path.startsWith('/api/')) return API_ORIGIN + path
  return API_ORIGIN + '/api/files/' + path
}
