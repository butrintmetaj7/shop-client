import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import type { User, LoginCredentials, RegisterCredentials } from '@/types/auth'

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function clearAuthState() {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  }

  async function login(credentials: LoginCredentials) {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.login(credentials)
      console.log('Auth store received:', response)
      
      user.value = response.user
      token.value = response.token

      localStorage.setItem(AUTH_TOKEN_KEY, response.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user))

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(credentials: RegisterCredentials) {
    try {
      isLoading.value = true
      error.value = null

      const response = await authService.register(credentials)
      console.log('Auth store received:', response)
      
      user.value = response.user
      token.value = response.token

      localStorage.setItem(AUTH_TOKEN_KEY, response.token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user))

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout API call failed:', err)
    } finally {
      clearAuthState()
    }
  }

  function initAuth() {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
      const storedUser = localStorage.getItem(AUTH_USER_KEY)

      if (storedToken && storedUser && storedUser !== 'undefined') {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error)
      clearAuthState()
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    initAuth
  }
})
