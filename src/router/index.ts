import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/products'
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue')
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('@/views/ProductDetailView.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // Consider token presence during initial load to avoid premature redirects
  const hasToken = !!localStorage.getItem('auth_token')
  const isAuthed = authStore.isAuthenticated || hasToken

  if (requiresAuth && !isAuthed) {
    if (!localStorage.getItem('intended_route')) {
      localStorage.setItem('intended_route', to.fullPath)
    }
    if (to.path !== '/products') {
      return next('/products')
    }
  }
  return next()
})

export default router
