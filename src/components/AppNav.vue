<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import LoginModal from './LoginModal.vue'
import RegisterModal from './RegisterModal.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const cartCount = computed(() => cartStore.count)

const showLoginModal = ref(false)
const showRegisterModal = ref(false)

const openLoginModal = () => {
  showRegisterModal.value = false
  showLoginModal.value = true
}

const openRegisterModal = () => {
  showLoginModal.value = false
  showRegisterModal.value = true
}

const closeModals = () => {
  showLoginModal.value = false
  showRegisterModal.value = false
}

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<template>
  <nav class="sticky top-0 z-40 shadow-lg bg-black text-white">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="text-xl font-bold">Shop</span>
          
          <div class="hidden md:flex items-center space-x-2">
            <router-link to="/" class="px-3 py-2 rounded hover:bg-gray-700 transition">
              Products
            </router-link>
            <router-link to="/cart" class="px-3 py-2 rounded hover:bg-gray-700 transition flex items-center gap-2">
              Cart
              <span v-if="cartCount > 0" class="bg-gray-700 text-white min-w-[1.5rem] h-6 flex items-center justify-center rounded-full text-xs font-semibold">
                {{ cartCount }}
              </span>
            </router-link>
          </div>
        </div>

        <!-- Authentication UI -->
        <div class="flex items-center space-x-2">
          <template v-if="!authStore.isAuthenticated">
            <button
              @click="openLoginModal"
              class="px-3 py-2 rounded hover:bg-gray-700 transition text-sm"
            >
              Login
            </button>
            <button
              @click="openRegisterModal"
              class="px-4 py-2 rounded bg-white text-black hover:bg-gray-200 transition text-sm font-medium"
            >
              Sign Up
            </button>
          </template>
          
          <template v-else>
            <router-link
              to="/profile"
              class="px-3 py-2 rounded hover:bg-gray-700 transition text-sm flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
              <span class="hidden lg:inline">{{ authStore.user?.name }}</span>
            </router-link>
            <button
              @click="handleLogout"
              :disabled="authStore.loading"
              class="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Logout
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <!-- Modals -->
  <LoginModal
    :is-open="showLoginModal"
    @close="closeModals"
    @switch-to-register="openRegisterModal"
  />
  <RegisterModal
    :is-open="showRegisterModal"
    @close="closeModals"
    @switch-to-login="openLoginModal"
  />
</template>

