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

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const errorMessage = ref('')
const fieldErrors = ref<Record<string, string>>({})

const clearErrors = () => {
  errorMessage.value = ''
  fieldErrors.value = {}
}

const handleRegister = async () => {
  clearErrors()
  
  if (!name.value || !email.value || !password.value || !passwordConfirmation.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters'
    return
  }

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    })
    console.log('Registration successful, redirecting...', authStore.isAuthenticated)
    await router.push({ name: 'products' })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      Object.keys(errors).forEach(field => {
        fieldErrors.value[field] = errors[field][0]
      })
      errorMessage.value = error.response.data.message || 'Please fix the errors below'
    } else {
      errorMessage.value = error.response?.data?.message || 'Registration failed. Please try again.'
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-8">
    <Card class="w-full max-w-md">
      <template #title>
        <h1 class="text-2xl font-bold">Register</h1>
      </template>
      <template #content>
        <form @submit.prevent="handleRegister" class="flex flex-col gap-6">
          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <div class="flex flex-col gap-2">
            <label for="name" class="font-semibold">Name</label>
            <InputText
              id="name"
              v-model="name"
              type="text"
              placeholder="Enter your name"
              :disabled="authStore.isLoading"
              :class="{ 'p-invalid': fieldErrors.name }"
              fluid
            />
            <small v-if="fieldErrors.name" class="p-error">{{ fieldErrors.name }}</small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="email" class="font-semibold ">Email</label>
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
              toggleMask
              fluid
            />
            <small v-if="fieldErrors.password" class="p-error">{{ fieldErrors.password }}</small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="password_confirmation" class="font-semibold ">Confirm Password</label>
            <Password
              id="password_confirmation"
              v-model="passwordConfirmation"
              placeholder="Confirm your password"
              :disabled="authStore.isLoading"
              :class="{ 'p-invalid': fieldErrors.password_confirmation }"
              :feedback="false"
              toggleMask
              fluid
            />
            <small v-if="fieldErrors.password_confirmation" class="p-error">{{ fieldErrors.password_confirmation }}</small>
          </div>

          <Button
            type="submit"
            label="Register"
            :loading="authStore.isLoading"
            icon="pi pi-user-plus"
            fluid
          />

          <div class="text-center mt-2">
            <span class="">Already have an account? </span>
            <router-link :to="{ name: 'login' }" class="text-blue-600 font-semibold hover:underline">
              Login here
            </router-link>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

