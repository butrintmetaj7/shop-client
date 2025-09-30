import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  console.log('Router guard:', {
    to: to.name,
    from: from.name,
    isAuthenticated,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest
  })

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirecting to login - auth required')
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    console.log('Redirecting to home - already authenticated')
    next({ name: 'home' })
  } else {
    console.log('Allowing navigation')
    next()
  }
})

export default router
