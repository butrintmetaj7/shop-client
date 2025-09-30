<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="products-container">
    <Card class="products-card">
      <template #title>Products</template>
      <template #subtitle>Welcome, {{ authStore.user?.name }}!</template>
      <template #content>
        <div class="products-content">
          <p>Products will be displayed here.</p>
          
          <Button
            label="Logout"
            icon="pi pi-sign-out"
            severity="danger"
            @click="handleLogout"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.products-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
}

.products-card {
  width: 100%;
  max-width: 800px;
}

.products-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}
</style>

