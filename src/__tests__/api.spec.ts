import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import axios from 'axios'
import apiClient from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// Mock router
vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
    currentRoute: {
      value: {
        path: '/products'
      }
    }
  }
}))

describe('API Client', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
    // Clear axios defaults
    delete apiClient.defaults.headers.common.Authorization
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Request Interceptor', () => {
    it('should attach token from auth store to requests', async () => {
      const authStore = useAuthStore()
      authStore.token = 'test-token'

      const config = await apiClient.interceptors.request.handlers[0].fulfilled({
        headers: {}
      } as any)

      expect(config.headers.Authorization).toBe('Bearer test-token')
    })

    it('should fall back to localStorage if store token is null', async () => {
      const authStore = useAuthStore()
      authStore.token = null
      localStorage.setItem('auth_token', 'storage-token')

      const config = await apiClient.interceptors.request.handlers[0].fulfilled({
        headers: {}
      } as any)

      expect(config.headers.Authorization).toBe('Bearer storage-token')
    })

    it('should not add Authorization header if no token available', async () => {
      const authStore = useAuthStore()
      authStore.token = null

      const config = await apiClient.interceptors.request.handlers[0].fulfilled({
        headers: {}
      } as any)

      expect(config.headers.Authorization).toBeUndefined()
    })

    it('should preserve existing headers', async () => {
      const authStore = useAuthStore()
      authStore.token = 'test-token'

      const config = await apiClient.interceptors.request.handlers[0].fulfilled({
        headers: {
          'X-Custom-Header': 'custom-value'
        }
      } as any)

      expect(config.headers.Authorization).toBe('Bearer test-token')
      expect(config.headers['X-Custom-Header']).toBe('custom-value')
    })

    it('should handle undefined headers object', async () => {
      const authStore = useAuthStore()
      authStore.token = 'test-token'

      const config = await apiClient.interceptors.request.handlers[0].fulfilled({
        headers: undefined
      } as any)

      expect(config.headers).toBeDefined()
      expect(config.headers.Authorization).toBe('Bearer test-token')
    })

    it('should prefer store token over localStorage when both exist', async () => {
      const authStore = useAuthStore()
      authStore.token = 'store-token'
      localStorage.setItem('auth_token', 'storage-token')

      const config = await apiClient.interceptors.request.handlers[0].fulfilled({
        headers: {}
      } as any)

      expect(config.headers.Authorization).toBe('Bearer store-token')
    })

    it('should handle empty string token gracefully', async () => {
      const authStore = useAuthStore()
      authStore.token = ''
      localStorage.setItem('auth_token', '')

      const config = await apiClient.interceptors.request.handlers[0].fulfilled({
        headers: {}
      } as any)

      expect(config.headers.Authorization).toBeUndefined()
    })

    it('should handle request interceptor error', async () => {
      const error = new Error('Request failed')

      await expect(
        apiClient.interceptors.request.handlers[0].rejected(error)
      ).rejects.toEqual(error)
    })
  })

  describe('Response Interceptor - 401 Handling', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-token')
      apiClient.defaults.headers.common.Authorization = 'Bearer test-token'
    })

    it('should clear localStorage on 401 error', async () => {
      const error = {
        response: { status: 401 }
      }

      try {
        await apiClient.interceptors.response.handlers[0].rejected(error)
      } catch (e) {
        // Expected to reject
      }

      expect(localStorage.getItem('auth_token')).toBeNull()
    })

    it('should clear axios default Authorization header on 401', async () => {
      const error = {
        response: { status: 401 }
      }

      try {
        await apiClient.interceptors.response.handlers[0].rejected(error)
      } catch (e) {
        // Expected to reject
      }

      expect(apiClient.defaults.headers.common.Authorization).toBeUndefined()
    })

    it('should redirect to /products from protected routes on 401', async () => {
      const mockRouter = vi.mocked(router)
      mockRouter.currentRoute.value.path = '/cart'

      const error = {
        response: { status: 401 }
      }

      try {
        await apiClient.interceptors.response.handlers[0].rejected(error)
      } catch (e) {
        // Expected to reject
      }

      expect(mockRouter.push).toHaveBeenCalledWith('/products')
    })

    it('should redirect from /profile on 401', async () => {
      const mockRouter = vi.mocked(router)
      mockRouter.currentRoute.value.path = '/profile'

      const error = {
        response: { status: 401 }
      }

      try {
        await apiClient.interceptors.response.handlers[0].rejected(error)
      } catch (e) {
        // Expected to reject
      }

      expect(mockRouter.push).toHaveBeenCalledWith('/products')
    })

    it('should not redirect from public routes on 401', async () => {
      const mockRouter = vi.mocked(router)
      mockRouter.currentRoute.value.path = '/products'

      const error = {
        response: { status: 401 }
      }

      try {
        await apiClient.interceptors.response.handlers[0].rejected(error)
      } catch (e) {
        // Expected to reject
      }

      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should not interfere with non-401 errors', async () => {
      const error = {
        response: { status: 500, data: { message: 'Server error' } }
      }

      await expect(
        apiClient.interceptors.response.handlers[0].rejected(error)
      ).rejects.toEqual(error)

      // Should not clear auth data
      expect(localStorage.getItem('auth_token')).toBe('test-token')
      expect(apiClient.defaults.headers.common.Authorization).toBe('Bearer test-token')
    })

    it('should handle errors without response object', async () => {
      const error = new Error('Network error')

      await expect(
        apiClient.interceptors.response.handlers[0].rejected(error)
      ).rejects.toEqual(error)
    })

    it('should still reject the promise after handling 401', async () => {
      const error = {
        response: { status: 401, data: { message: 'Unauthorized' } }
      }

      await expect(
        apiClient.interceptors.response.handlers[0].rejected(error)
      ).rejects.toEqual(error)
    })

    it('should handle 401 when Authorization header does not exist', async () => {
      localStorage.setItem('auth_token', 'test-token')
      // Don't set axios defaults header

      const error = {
        response: { status: 401 }
      }

      try {
        await apiClient.interceptors.response.handlers[0].rejected(error)
      } catch (e) {
        // Expected to reject
      }

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(apiClient.defaults.headers.common.Authorization).toBeUndefined()
    })

    it('should handle multiple 401 errors sequentially', async () => {
      const mockRouter = vi.mocked(router)
      mockRouter.currentRoute.value.path = '/cart'
      localStorage.setItem('auth_token', 'test-token')

      const error = {
        response: { status: 401 }
      }

      // First 401
      try {
        await apiClient.interceptors.response.handlers[0].rejected(error)
      } catch (e) {
        // Expected
      }

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(mockRouter.push).toHaveBeenCalledTimes(1)

      // Second 401 (should not crash even though already cleared)
      try {
        await apiClient.interceptors.response.handlers[0].rejected(error)
      } catch (e) {
        // Expected
      }

      // Should not cause issues
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('Response Interceptor - Success', () => {
    it('should pass through successful responses unchanged', async () => {
      const response = {
        data: { message: 'Success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      }

      const result = await apiClient.interceptors.response.handlers[0].fulfilled(response as any)

      expect(result).toEqual(response)
    })
  })

  describe('Base Configuration', () => {
    it('should have correct base URL', () => {
      const expectedUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
      expect(apiClient.defaults.baseURL).toBe(expectedUrl)
    })

    it('should have correct default headers', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
      expect(apiClient.defaults.headers['Accept']).toBe('application/json')
    })
  })
})

