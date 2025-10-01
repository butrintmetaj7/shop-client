<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import type { CartItemDisplay } from '@/types/cart'
import Button from 'primevue/button'
import { formatCurrency } from '@/utils/currency'

defineProps<{
  cartProduct: CartItemDisplay
}>()

const cartStore = useCartStore()
</script>

<template>
  <div class="border rounded-lg shadow-md bg-white flex flex-col md:flex-row">
    <figure class="p-8 md:w-64">
      <img
        :src="cartProduct.image"
        :alt="cartProduct.title"
        class="object-contain w-full h-48"
      >
    </figure>
    <div class="p-6 flex-1 flex flex-col justify-between">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          {{ cartProduct.title }}
        </h2>
        <p class="text-lg font-bold text-primary-500 mb-4">
          {{ formatCurrency(cartProduct.cost) }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          icon="pi pi-minus"
          severity="secondary"
          size="small"
          @click="cartStore.remove(cartProduct.id)"
        />
        <span class="px-4 py-2 bg-gray-500 rounded font-semibold min-w-[3rem] text-center">
          {{ cartProduct.quantity }}
        </span>
        <Button
          icon="pi pi-plus"
          severity="secondary"
          size="small"
          @click="cartStore.add(cartProduct.id)"
        />
      </div>
    </div>
  </div>
</template>

