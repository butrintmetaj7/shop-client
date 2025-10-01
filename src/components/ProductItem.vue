<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/product'
import Button from 'primevue/button'
import { formatCurrency } from '@/utils/currency'

defineProps<{
  product: Product
}>()

const cartStore = useCartStore()
</script>

<template>
  <div class="border rounded-lg shadow-md bg-white overflow-hidden flex flex-col h-full">
    <figure class="px-8 pt-10">
      <img
        :src="product.image"
        :alt="product.title"
        class="object-contain w-full h-64"
      >
    </figure>
    <div class="p-6 flex flex-col flex-1">
      <div class="h-16 mb-2">
        <h2 class="text-lg font-semibold line-clamp-2 text-gray-900">
          {{ product.title }}
        </h2>
      </div>
      <p class="text-xl font-bold text-primary-500 mb-4">
        {{ formatCurrency(product.price) }}
      </p>
      <div class="mt-auto">
        <Button
          label="Add to Cart"
          icon="pi pi-shopping-cart"
          @click="cartStore.add(product.id)"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

