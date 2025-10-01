<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import AppNav from '@/components/AppNav.vue'
import ProductItem from '@/components/ProductItem.vue'
import ProductItemSkeleton from '@/components/ProductItemSkeleton.vue'
import Paginator from 'primevue/paginator'

const SKELETON_COUNT = 6

const productsStore = useProductsStore()

const products = computed(() => productsStore.list.filter(p => p !== undefined))

const onPageChange = async (event: any) => {
  await productsStore.fetchProducts(event.page + 1)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  await productsStore.fetchProducts(1)
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppNav />
    <div class="p-4 max-w-7xl mx-auto">
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <ProductItemSkeleton
          v-for="n in SKELETON_COUNT"
          v-show="productsStore.isLoading"
          :key="n"
        />
        <ProductItem
          v-for="product in products"
          v-show="!productsStore.isLoading"
          :key="product.id"
          :product="product"
        />
      </div>
      
      <div v-if="productsStore.total > 0" class="mt-8 flex justify-center">
        <Paginator
          :rows="productsStore.perPage"
          :totalRecords="productsStore.total"
          @page="onPageChange"
          :first="(productsStore.currentPage - 1) * productsStore.perPage"
        />
      </div>
    </div>
  </div>
</template>

