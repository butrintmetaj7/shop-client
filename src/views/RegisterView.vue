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
  <div class="register-container">
    <Card class="register-card">
      <template #title>Register</template>
      <template #content>
        <form @submit.prevent="handleRegister" class="register-form">
          <Message v-if="errorMessage" severity="error" :closable="false">
            {{ errorMessage }}
          </Message>

          <div class="form-field">
            <label for="name">Name</label>
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

          <div class="form-field">
            <label for="email">Email</label>
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

          <div class="form-field">
            <label for="password">Password</label>
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

          <div class="form-field">
            <label for="password_confirmation">Confirm Password</label>
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

          <div class="login-link">
            <span>Already have an account? </span>
            <router-link :to="{ name: 'login' }">Login here</router-link>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.register-card {
  width: 100%;
  max-width: 450px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 600;
}

.login-link {
  text-align: center;
  margin-top: 0.5rem;
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>

