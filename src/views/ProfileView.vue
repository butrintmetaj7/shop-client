<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/products')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="bg-black px-6 py-8">
          <h1 class="text-3xl font-bold text-white">Profile</h1>
          <p class="mt-2 text-gray-300">Manage your account information</p>
        </div>

        <div v-if="authStore.user" class="px-6 py-8">
          <div class="space-y-6">
            <div class="border-b border-gray-200 pb-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
              
              <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Full name</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ authStore.user.name }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Email address</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ authStore.user.email }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Role</dt>
                  <dd class="mt-1">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                          :class="authStore.user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-900'">
                      {{ authStore.user.role }}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Email verified</dt>
                  <dd class="mt-1">
                    <span v-if="authStore.user.email_verified_at" class="inline-flex items-center text-sm text-gray-900">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      Verified
                    </span>
                    <span v-else class="inline-flex items-center text-sm text-gray-500">
                      Not verified
                    </span>
                  </dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Member since</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(authStore.user.created_at) }}</dd>
                </div>

                <div>
                  <dt class="text-sm font-medium text-gray-500">Last updated</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(authStore.user.updated_at) }}</dd>
                </div>
              </dl>
            </div>

            <div class="flex justify-between items-center">
              <router-link
                to="/products"
                class="text-gray-900 hover:text-black font-medium"
              >
                ← Back to Products
              </router-link>

              <button
                @click="handleLogout"
                :disabled="authStore.loading"
                class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="authStore.loading">Logging out...</span>
                <span v-else>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="px-6 py-8 text-center text-gray-500">
          Loading profile...
        </div>
      </div>
    </div>
  </div>
</template>

