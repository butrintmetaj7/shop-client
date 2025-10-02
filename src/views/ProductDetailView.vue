<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'
import { productService } from '@/services/productService'
import type { Product } from '@/types/product'
import { formatCurrency } from '@/utils/currency'
import AppNav from '@/components/AppNav.vue'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const productsStore = useProductsStore()

const product = ref<Product | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const productId = computed(() => Number(route.params.id))

const loadProduct = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const cachedProduct = productsStore.getProductById(productId.value)
    if (cachedProduct) {
      product.value = cachedProduct
      isLoading.value = false
      return
    }
    
    product.value = await productService.getProduct(productId.value)
  } catch (err: any) {
    console.error('Failed to load product:', err)
    error.value = err.response?.data?.message || 'Failed to load product'
  } finally {
    isLoading.value = false
  }
}

const addToCart = () => {
  if (product.value) {
    cartStore.add(product.value.id)
  }
}

const goBack = () => {
  router.push({ name: 'products' })
}

onMounted(() => {
  loadProduct()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppNav />
    
    <div class="p-4 max-w-6xl mx-auto">
      <Button
        icon="pi pi-arrow-left"
        label="Back to Products"
        text
        @click="goBack"
        class="mb-4"
      />

      <div v-if="isLoading" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="grid md:grid-cols-2 gap-8 p-8">
          <div class="flex items-center justify-center">
            <Skeleton width="100%" height="400px" />
          </div>
          <div class="space-y-4">
            <Skeleton width="80%" height="2rem" />
            <Skeleton width="60%" height="1.5rem" />
            <Skeleton width="100%" height="6rem" />
            <Skeleton width="40%" height="2rem" />
            <Skeleton width="100%" height="3rem" />
          </div>
        </div>
      </div>

      <div v-else-if="error" class="bg-white rounded-lg shadow-lg p-8">
        <div class="text-center">
          <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <Button
            label="Go to Products"
            icon="pi pi-arrow-left"
            @click="goBack"
          />
        </div>
      </div>

      <div v-else-if="product" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="grid md:grid-cols-2 gap-8 p-8">
          <div class="flex items-center justify-center bg-gray-50 rounded-lg p-8">
            <img
              :src="product.image"
              :alt="product.title"
              class="object-contain w-full max-h-96"
            >
          </div>

          <div class="flex flex-col">
            <div class="flex-1">
              <div class="mb-3">
                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold uppercase">
                  {{ product.category }}
                </span>
              </div>

              <h1 class="text-3xl font-bold text-gray-900 mb-4">
                {{ product.title }}
              </h1>

              <div class="mb-6">
                <p class="text-4xl font-bold text-primary-600">
                  {{ formatCurrency(product.price) }}
                </p>
              </div>

              <div class="mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p class="text-gray-700 leading-relaxed">
                  {{ product.description }}
                </p>
              </div>
            </div>

            <div class="border-t pt-6">
              <Button
                label="Add to Cart"
                icon="pi pi-shopping-cart"
                @click="addToCart"
                size="large"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
