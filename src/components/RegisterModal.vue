<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  switchToLogin: []
}>()

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const errors = ref<Record<string, string[]>>({})
const generalError = ref('')

const nameInput = ref<HTMLInputElement | null>(null)

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Reset form when modal opens
    errors.value = {}
    generalError.value = ''
    // Focus name input after modal renders
    setTimeout(() => nameInput.value?.focus(), 100)
  }
})

const passwordsMatch = computed(() => {
  if (!password.value || !passwordConfirmation.value) return true
  return password.value === passwordConfirmation.value
})

const handleSubmit = async () => {
  errors.value = {}
  generalError.value = ''

  // Client-side validation
  if (!passwordsMatch.value) {
    errors.value.password_confirmation = ['Passwords do not match']
    return
  }

  if (password.value.length < 8) {
    errors.value.password = ['Password must be at least 8 characters']
    return
  }

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    })
    
    // Close modal on success
    emit('close')
    
    // Reset form
    name.value = ''
    email.value = ''
    password.value = ''
    passwordConfirmation.value = ''
    
    // Redirect to intended route if it exists
    const intendedRoute = localStorage.getItem('intended_route')
    if (intendedRoute) {
      localStorage.removeItem('intended_route')
      router.push(intendedRoute)
    }
  } catch (error: any) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {}
    } else {
      generalError.value = 'Unable to connect to server. Please try again.'
    }
  }
}

const handleClose = () => {
  if (!authStore.loading) {
    emit('close')
  }
}

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click="handleBackdropClick"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900">Create Account</h2>
              <button
                @click="handleClose"
                :disabled="authStore.loading"
                class="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div v-if="generalError" class="rounded-md bg-red-50 border border-red-300 p-3">
                <p class="text-sm text-red-800">{{ generalError }}</p>
              </div>

              <div>
                <label for="name" class="block text-sm font-medium text-gray-900 mb-1">
                  Full name
                </label>
                <input
                  id="name"
                  ref="nameInput"
                  v-model="name"
                  type="text"
                  autocomplete="name"
                  required
                  class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  :class="{ 'border-red-500': errors.name }"
                  placeholder="Enter your full name"
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">
                  {{ errors.name[0] }}
                </p>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-900 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  :class="{ 'border-red-500': errors.email }"
                  placeholder="Enter your email"
                />
                <p v-if="errors.email" class="mt-1 text-sm text-red-600">
                  {{ errors.email[0] }}
                </p>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-900 mb-1">
                  Password
                </label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    required
                    class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent pr-16"
                    :class="{ 'border-red-500': errors.password }"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    :aria-pressed="showPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-900"
                  >
                    <span v-if="showPassword">Hide</span>
                    <span v-else>Show</span>
                  </button>
                </div>
                <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                  {{ errors.password[0] }}
                </p>
              </div>

              <div>
                <label for="password-confirmation" class="block text-sm font-medium text-gray-900 mb-1">
                  Confirm password
                </label>
                <div class="relative">
                  <input
                    id="password-confirmation"
                    v-model="passwordConfirmation"
                    :type="showPasswordConfirmation ? 'text' : 'password'"
                    autocomplete="new-password"
                    required
                    class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent pr-16"
                    :class="{ 'border-red-500': errors.password_confirmation || !passwordsMatch }"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    @click="showPasswordConfirmation = !showPasswordConfirmation"
                    :aria-label="showPasswordConfirmation ? 'Hide password confirmation' : 'Show password confirmation'"
                    :aria-pressed="showPasswordConfirmation"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500 hover:text-gray-900"
                  >
                    <span v-if="showPasswordConfirmation">Hide</span>
                    <span v-else>Show</span>
                  </button>
                </div>
                <p v-if="errors.password_confirmation" class="mt-1 text-sm text-red-600">
                  {{ errors.password_confirmation[0] }}
                </p>
                <p v-else-if="!passwordsMatch && passwordConfirmation" class="mt-1 text-sm text-red-600">
                  Passwords do not match
                </p>
              </div>

              <button
                type="submit"
                :disabled="authStore.loading || !passwordsMatch"
                class="w-full py-2.5 px-4 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="authStore.loading">Creating account...</span>
                <span v-else>Create Account</span>
              </button>

              <div class="text-center text-sm text-gray-600">
                Already have an account?
                <button
                  type="button"
                  @click="emit('switchToLogin')"
                  class="font-medium text-gray-900 hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>

