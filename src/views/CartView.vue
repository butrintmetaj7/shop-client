<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppNav from '@/components/AppNav.vue'
import CartItem from '@/components/CartItem.vue'
import CartItemSkeleton from '@/components/CartItemSkeleton.vue'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'

const cartStore = useCartStore()
const productsStore = useProductsStore()

const formattedCart = computed(() => cartStore.formattedCart)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

onMounted(async () => {
  if (!productsStore.loaded) {
    await productsStore.fetchAllProducts()
  }
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppNav />
    <div class="p-4 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
      
      <div v-if="!productsStore.loaded && cartStore.count > 0" class="space-y-4">
        <CartItemSkeleton v-for="n in cartStore.count" :key="n" />
      </div>
      
      <div v-else-if="!formattedCart.length" class="text-center py-12">
        <i class="pi pi-shopping-cart text-6xl text-gray-300 mb-4"></i>
        <h2 class="text-2xl text-gray-600">Cart is empty.</h2>
        <router-link 
          to="/products" 
          class="inline-block mt-4 text-blue-600 hover:underline font-semibold"
        >
          Continue shopping
        </router-link>
      </div>
      
      <div v-else class="space-y-4">
        <CartItem
          v-for="cartProduct in formattedCart"
          :key="cartProduct.id"
          :cart-product="cartProduct"
        />
        
        <div class="border-t pt-4 mt-6">
          <div class="text-right">
            <p class="text-gray-600 text-lg mb-2">Total</p>
            <p class="text-3xl md:text-4xl font-bold text-gray-900">
              {{ formatPrice(cartStore.total) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

