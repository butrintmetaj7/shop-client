<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const fieldErrors = ref<Record<string, string>>({})

const clearErrors = () => {
  errorMessage.value = ''
  fieldErrors.value = {}
}

const handleLogin = async () => {
  clearErrors()
  
  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
    await router.push({ name: 'products' })
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      Object.keys(errors).forEach(field => {
        fieldErrors.value[field] = errors[field][0]
      })
      errorMessage.value = error.response.data.message || 'Please fix the errors below'
    } else {
      errorMessage.value = error.response?.data?.message || 'Login failed. Please try again.'
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <Card class="w-full max-w-md">
      <template #title>
        <h1 class="text-2xl font-bold">Login</h1>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <div class="flex flex-col gap-2">
            <label for="email" class="font-semibold">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              :disabled="authStore.isLoading"
              :class="{ 'p-invalid': fieldErrors.email }"
              fluid
            />
            <small v-if="fieldErrors.email" class="p-error">{{ fieldErrors.email }}</small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="font-semibold">Password</label>
            <Password
              id="password"
              v-model="password"
              placeholder="Enter your password"
              :disabled="authStore.isLoading"
              :class="{ 'p-invalid': fieldErrors.password }"
              :feedback="false"
              toggleMask
              fluid
            />
            <small v-if="fieldErrors.password" class="p-error">{{ fieldErrors.password }}</small>
          </div>

          <Button
            type="submit"
            label="Login"
            :loading="authStore.isLoading"
            icon="pi pi-sign-in"
            fluid
          />

          <div class="text-center mt-2">
            <span >Don't have an account? </span>
            <router-link :to="{ name: 'register' }" class="text-blue-600 font-semibold hover:underline">
              Register here
            </router-link>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

