import axios from 'axios'
import { auth } from '../config/firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: false
})

// Attach Firebase ID token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    // Force refresh in case the token is expired to avoid 401s
    const token = await user.getIdToken(true)
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
