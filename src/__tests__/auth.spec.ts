import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'
import apiClient from '@/services/api'
import type { User } from '@/types/auth'

// Mock the authService
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn()
  }
}))

describe('Auth Store', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    localStorage.clear()
    vi.clearAllMocks()
    // Clear axios defaults
    delete apiClient.defaults.headers.common.Authorization
    // Suppress expected console errors during tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with null user and token', () => {
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()
    })
  })

  describe('setAuth()', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    }
    const mockToken = 'mock-jwt-token'

    it('should set user and token in store', () => {
      authStore.setAuth(mockUser, mockToken)

      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should persist token to localStorage', () => {
      authStore.setAuth(mockUser, mockToken)

      const storedToken = localStorage.getItem('auth_token')
      expect(storedToken).toBe(mockToken)
    })

    it('should sync token to axios defaults', () => {
      authStore.setAuth(mockUser, mockToken)

      expect(apiClient.defaults.headers.common.Authorization).toBe(`Bearer ${mockToken}`)
    })

    it('should update auth when called multiple times', () => {
      const firstUser: User = { id: 1, email: 'first@example.com', username: 'first' }
      const secondUser: User = { id: 2, email: 'second@example.com', username: 'second' }
      
      authStore.setAuth(firstUser, 'first-token')
      expect(authStore.token).toBe('first-token')
      expect(authStore.user).toEqual(firstUser)

      // Update with new user/token
      authStore.setAuth(secondUser, 'second-token')
      expect(authStore.token).toBe('second-token')
      expect(authStore.user).toEqual(secondUser)
      expect(localStorage.getItem('auth_token')).toBe('second-token')
      expect(apiClient.defaults.headers.common.Authorization).toBe('Bearer second-token')
    })

    it('should handle empty string token', () => {
      authStore.setAuth(mockUser, '')

      expect(authStore.token).toBe('')
      expect(localStorage.getItem('auth_token')).toBe('')
      expect(apiClient.defaults.headers.common.Authorization).toBe('Bearer ')
    })
  })

  describe('clearAuth()', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    }
    const mockToken = 'mock-jwt-token'

    beforeEach(() => {
      authStore.setAuth(mockUser, mockToken)
    })

    it('should clear user and token from store', () => {
      authStore.clearAuth()

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should remove token from localStorage', () => {
      authStore.clearAuth()

      const storedToken = localStorage.getItem('auth_token')
      expect(storedToken).toBeNull()
    })

    it('should remove Authorization header from axios defaults', () => {
      authStore.clearAuth()

      expect(apiClient.defaults.headers.common.Authorization).toBeUndefined()
    })

    it('should be safe to call multiple times', () => {
      authStore.clearAuth()
      expect(authStore.token).toBeNull()

      // Call again - should not cause errors
      authStore.clearAuth()
      expect(authStore.token).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('should work even when Authorization header was never set', () => {
      // Clear without setting first
      delete apiClient.defaults.headers.common.Authorization
      
      authStore.clearAuth()

      expect(apiClient.defaults.headers.common.Authorization).toBeUndefined()
      expect(authStore.token).toBeNull()
    })
  })

  describe('login()', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123'
    }
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    }
    const mockToken = 'mock-jwt-token'

    it('should successfully login and set auth state', async () => {
      vi.mocked(authService.login).mockResolvedValue({
        data: { user: mockUser, token: mockToken }
      } as any)

      await authStore.login(mockCredentials)

      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.error).toBeNull()
    })

    it('should set loading state during login', async () => {
      vi.mocked(authService.login).mockImplementation(() => {
        expect(authStore.loading).toBe(true)
        return Promise.resolve({
          data: { user: mockUser, token: mockToken }
        } as any)
      })

      await authStore.login(mockCredentials)

      expect(authStore.loading).toBe(false)
    })

    it('should handle login errors', async () => {
      const errorMessage = 'Invalid credentials'
      vi.mocked(authService.login).mockRejectedValue({
        response: { data: { message: errorMessage } }
      })

      await expect(authStore.login(mockCredentials)).rejects.toThrow()

      expect(authStore.error).toBe(errorMessage)
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
    })

    it('should handle login errors without error message', async () => {
      vi.mocked(authService.login).mockRejectedValue({
        response: { data: {} }
      })

      await expect(authStore.login(mockCredentials)).rejects.toThrow()

      expect(authStore.error).toBe('Login failed')
    })

    it('should handle network errors during login', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Network error'))

      await expect(authStore.login(mockCredentials)).rejects.toThrow()

      expect(authStore.error).toBe('Login failed')
    })
  })

  describe('register()', () => {
    const mockCredentials = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      password_confirmation: 'password123'
    }
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    }
    const mockToken = 'mock-jwt-token'

    it('should successfully register and set auth state', async () => {
      vi.mocked(authService.register).mockResolvedValue({
        data: { user: mockUser, token: mockToken }
      } as any)

      await authStore.register(mockCredentials)

      expect(authStore.user).toEqual(mockUser)
      expect(authStore.token).toBe(mockToken)
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should handle registration errors', async () => {
      const errorMessage = 'Email already exists'
      vi.mocked(authService.register).mockRejectedValue({
        response: { data: { message: errorMessage } }
      })

      await expect(authStore.register(mockCredentials)).rejects.toThrow()

      expect(authStore.error).toBe(errorMessage)
      expect(authStore.user).toBeNull()
    })
  })

  describe('logout()', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    }
    const mockToken = 'mock-jwt-token'

    beforeEach(() => {
      authStore.setAuth(mockUser, mockToken)
    })

    it('should successfully logout and clear auth state', async () => {
      vi.mocked(authService.logout).mockResolvedValue(undefined)

      await authStore.logout()

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should clear auth state even if logout API fails', async () => {
      vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'))

      await authStore.logout()

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('fetchUser()', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    }

    it('should fetch and set user data', async () => {
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      await authStore.fetchUser()

      expect(authStore.user).toEqual(mockUser)
      expect(authStore.error).toBeNull()
    })

    it('should clear auth on fetch error', async () => {
      authStore.token = 'some-token'
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Unauthorized'))

      await expect(authStore.fetchUser()).rejects.toThrow()

      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
    })
  })

  describe('initializeAuth()', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser'
    }

    it('should do nothing if no token in localStorage', async () => {
      await authStore.initializeAuth()

      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
    })

    it('should restore session from localStorage', async () => {
      const mockToken = 'stored-jwt-token'
      localStorage.setItem('auth_token', mockToken)
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      await authStore.initializeAuth()

      expect(authStore.token).toBe(mockToken)
      expect(authStore.user).toEqual(mockUser)
    })

    it('should clear auth if session restoration fails', async () => {
      const mockToken = 'expired-token'
      localStorage.setItem('auth_token', mockToken)
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Token expired'))

      await authStore.initializeAuth()

      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('isAuthenticated computed', () => {
    it('should return false when no user or token', () => {
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should return false when only user is set', () => {
      authStore.user = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      }

      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should return false when only token is set', () => {
      authStore.token = 'some-token'

      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should return true when both user and token are set', () => {
      authStore.user = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      }
      authStore.token = 'some-token'

      expect(authStore.isAuthenticated).toBe(true)
    })
  })
})

