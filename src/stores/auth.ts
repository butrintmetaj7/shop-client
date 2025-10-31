import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import type { User, LoginCredentials, RegisterCredentials } from '@/types/auth'
import apiClient from '@/services/api'

const TOKEN_STORAGE_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const setAuth = (userData: User, authToken: string) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem(TOKEN_STORAGE_KEY, authToken)
    apiClient.defaults.headers.common.Authorization = `Bearer ${authToken}`
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    delete apiClient.defaults.headers.common.Authorization
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true
      error.value = null
      const response = await authService.login(credentials)
      setAuth(response.data.user, response.data.token)
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      loading.value = true
      error.value = null
      const response = await authService.register(credentials)
      setAuth(response.data.user, response.data.token)
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      await authService.logout()
    } catch (err: any) {
      console.error('Logout error:', err)
    } finally {
      clearAuth()
      loading.value = false
    }
  }

  const fetchUser = async () => {
    try {
      loading.value = true
      error.value = null
      const userData = await authService.getCurrentUser()
      user.value = userData
      return userData
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch user'
      clearAuth()
      throw err
    } finally {
      loading.value = false
    }
  }

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!storedToken) {
      return
    }

    token.value = storedToken

    try {
      await fetchUser()
    } catch (err) {
      console.error('Failed to restore session:', err)
      clearAuth()
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    setAuth,
    clearAuth,
    login,
    register,
    logout,
    fetchUser,
    initializeAuth
  }
})

