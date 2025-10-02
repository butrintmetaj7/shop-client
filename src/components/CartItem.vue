<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import type { CartItemDisplay } from '@/types/cart'
import Button from 'primevue/button'
import { formatCurrency } from '@/utils/currency'

const props = defineProps<{
  cartProduct: CartItemDisplay
}>()

const router = useRouter()
const cartStore = useCartStore()

const viewProduct = () => {
  router.push({ name: 'product-detail', params: { id: props.cartProduct.id } })
}

const handleAddClick = (event: Event) => {
  event.stopPropagation()
  cartStore.add(props.cartProduct.id)
}

const handleRemoveClick = (event: Event) => {
  event.stopPropagation()
  cartStore.remove(props.cartProduct.id)
}
</script>

<template>
  <div 
    class="border rounded-lg shadow-md bg-white flex flex-col md:flex-row cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-xl"
    @click="viewProduct"
  >
    <figure class="p-8 md:w-64">
      <img
        :src="cartProduct.image"
        :alt="cartProduct.title"
        class="object-contain w-full h-48"
      >
    </figure>
    <div class="p-6 flex-1 flex flex-col justify-between">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600">
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
          @click="handleRemoveClick"
        />
        <span class="px-4 py-2 bg-gray-500 rounded font-semibold min-w-[3rem] text-center">
          {{ cartProduct.quantity }}
        </span>
        <Button
          icon="pi pi-plus"
          severity="secondary"
          size="small"
          @click="handleAddClick"
        />
      </div>
    </div>
  </div>
</template>
