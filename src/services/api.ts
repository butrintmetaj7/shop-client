import axios, { type AxiosInstance } from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
const TOKEN_STORAGE_KEY = 'auth_token'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Request interceptor - attach Bearer token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 errors (unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      
      // Clear auth store to keep state consistent
      const authStore = useAuthStore()
      authStore.clearAuth()
      
      // Redirect to products page if on a protected route
      const currentPath = router.currentRoute.value.path
      const protectedRoutes = ['/cart', '/profile']
      if (protectedRoutes.includes(currentPath)) {
        router.push('/products')
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
