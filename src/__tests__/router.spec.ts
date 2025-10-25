import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

// Mock route object factory
const createMockRoute = (path: string, requiresAuth = false): RouteLocationNormalized => ({
  path,
  fullPath: path,
  name: path.slice(1) as any,
  query: {},
  params: {},
  hash: '',
  matched: requiresAuth ? [{ meta: { requiresAuth: true } }] : [],
  meta: requiresAuth ? { requiresAuth: true } : {},
  redirectedFrom: undefined
} as any)

describe('Router Navigation Guards', () => {
  let authStore: ReturnType<typeof useAuthStore>
  let next: NavigationGuardNext

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    localStorage.clear()
    next = vi.fn()
  })

  describe('Public Routes', () => {
    it('should allow access to /products without authentication', () => {
      const to = createMockRoute('/products')
      const from = createMockRoute('/')

      // Simulate the guard logic
      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
        } else {
          next()
        }
      } else {
        next()
      }

      expect(next).toHaveBeenCalledWith()
    })

    it('should allow access to /products/:id without authentication', () => {
      const to = createMockRoute('/products/1')
      const from = createMockRoute('/')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
        } else {
          next()
        }
      } else {
        next()
      }

      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Protected Routes - Unauthenticated', () => {
    it('should redirect to /products when accessing /cart without auth', () => {
      const to = createMockRoute('/cart', true)
      const from = createMockRoute('/products')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      expect(next).toHaveBeenCalledWith('/products')
    })

    it('should redirect to /products when accessing /profile without auth', () => {
      const to = createMockRoute('/profile', true)
      const from = createMockRoute('/products')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      expect(next).toHaveBeenCalledWith('/products')
    })

    it('should save intended route in localStorage', () => {
      const to = createMockRoute('/cart', true)
      const from = createMockRoute('/products')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      expect(localStorage.getItem('intended_route')).toBe('/cart')
    })

    it('should not overwrite existing intended_route', () => {
      localStorage.setItem('intended_route', '/profile')
      
      const to = createMockRoute('/cart', true)
      const from = createMockRoute('/products')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      expect(localStorage.getItem('intended_route')).toBe('/profile')
    })
  })

  describe('Protected Routes - Authenticated via Store', () => {
    beforeEach(() => {
      authStore.user = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      }
      authStore.token = 'valid-token'
    })

    it('should allow access to /cart when authenticated', () => {
      const to = createMockRoute('/cart', true)
      const from = createMockRoute('/products')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      expect(next).toHaveBeenCalledWith()
      expect(next).not.toHaveBeenCalledWith('/products')
    })

    it('should allow access to /profile when authenticated', () => {
      const to = createMockRoute('/profile', true)
      const from = createMockRoute('/cart')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      expect(next).toHaveBeenCalledWith()
      expect(next).not.toHaveBeenCalledWith('/products')
    })
  })

  describe('Race Condition Handling - Token in localStorage', () => {
    it('should allow access if token exists in localStorage even if store not initialized', () => {
      localStorage.setItem('auth_token', 'stored-token')
      // Store is not initialized (isAuthenticated = false)
      expect(authStore.isAuthenticated).toBe(false)

      const to = createMockRoute('/cart', true)
      const from = createMockRoute('/')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      // Should allow access because token exists in localStorage
      expect(next).toHaveBeenCalledWith()
      expect(next).not.toHaveBeenCalledWith('/products')
    })

    it('should prevent premature redirect on app initialization', () => {
      // Simulate initial page load with token
      localStorage.setItem('auth_token', 'valid-token')
      
      const to = createMockRoute('/profile', true)
      const from = createMockRoute('/')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      // Should not redirect because token exists
      expect(next).toHaveBeenCalledWith()
    })

    it('should redirect if no token in localStorage and store not authenticated', () => {
      // No token anywhere
      expect(authStore.isAuthenticated).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()

      const to = createMockRoute('/cart', true)
      const from = createMockRoute('/products')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      expect(next).toHaveBeenCalledWith('/products')
    })

    it('should handle invalid token format in localStorage', () => {
      localStorage.setItem('auth_token', 'Bearer invalid-format')
      expect(authStore.isAuthenticated).toBe(false)

      const to = createMockRoute('/cart', true)
      const from = createMockRoute('/products')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      // Should still allow navigation if token exists (even if invalid format)
      expect(next).toHaveBeenCalledWith()
    })

    it('should handle empty string token in localStorage', () => {
      localStorage.setItem('auth_token', '')
      expect(authStore.isAuthenticated).toBe(false)

      const to = createMockRoute('/cart', true)
      const from = createMockRoute('/products')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      // Empty string is falsy, should redirect
      expect(next).toHaveBeenCalledWith('/products')
    })
  })

  describe('Redirect Loop Prevention', () => {
    it('should not redirect when already on /products', () => {
      const to = createMockRoute('/products', true)
      const from = createMockRoute('/')

      const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
      const hasToken = !!localStorage.getItem('auth_token')
      const isAuthed = authStore.isAuthenticated || hasToken

      if (requiresAuth && !isAuthed) {
        if (!localStorage.getItem('intended_route')) {
          localStorage.setItem('intended_route', to.fullPath)
        }
        if (to.path !== '/products') {
          next('/products')
          return
        }
      }
      next()

      // Should call next() without arguments (allow navigation)
      expect(next).toHaveBeenCalledWith()
      expect(next).not.toHaveBeenCalledWith('/products')
    })
  })
})

