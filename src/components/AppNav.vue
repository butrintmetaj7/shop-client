<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const cartCount = computed(() => cartStore.count)
</script>

<template>
  <nav class="sticky top-0 z-50 shadow-lg bg-black text-white">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="text-xl font-bold">Shop</span>
          
          <div class="hidden md:flex items-center space-x-2">
            <router-link to="/" class="px-3 py-2 rounded hover:bg-gray-700 transition">
              Products
            </router-link>
            <router-link to="/cart" class="px-3 py-2 rounded hover:bg-gray-700 transition flex items-center gap-2">
              Cart
              <span v-if="cartCount > 0" class="bg-gray-700 text-white min-w-[1.5rem] h-6 flex items-center justify-center rounded-full text-xs font-semibold">
                {{ cartCount }}
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

