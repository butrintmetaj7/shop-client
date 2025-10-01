<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import AppNav from '@/components/AppNav.vue'
import ProductItem from '@/components/ProductItem.vue'
import ProductItemSkeleton from '@/components/ProductItemSkeleton.vue'

const SKELETON_COUNT = 6

const productsStore = useProductsStore()

const products = computed(() => productsStore.list.filter(p => p !== undefined))

onMounted(async () => {
  await productsStore.fetchAllProducts()
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppNav />
    <div class="p-4 max-w-7xl mx-auto">
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <ProductItemSkeleton
          v-for="n in SKELETON_COUNT"
          v-show="productsStore.isLoading && !productsStore.loaded"
          :key="n"
        />
        <ProductItem
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

