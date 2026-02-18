import axios from 'axios'

// Use Vite env first (VITE_API_BASE_URL), otherwise fall back to mock API on 3001.
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default api
