import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productService } from '@/services/productService'
import type { Product } from '@/types/product'

const DEFAULT_PAGE = 1

export const useProductsStore = defineStore('products', () => {
  const items = ref<Record<number, Product>>({})
  const ids = ref<number[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  const currentPage = ref(1)
  const lastPage = ref(1)
  const perPage = ref(10)
  const total = ref(0)

  const list = computed(() => ids.value.map(id => items.value[id]))
  
  const loaded = computed(() => ids.value.length > 0)

  const fetchProducts = async (page: number = DEFAULT_PAGE) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await productService.getProducts(page)
      
      ids.value = []
      response.data.forEach((product) => {
        items.value[product.id] = product
        ids.value.push(product.id)
      })

      currentPage.value = response.current_page
      lastPage.value = response.last_page
      perPage.value = response.per_page
      total.value = response.total

      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch products'
      throw err
    } finally {
      isLoading.value = false
    }
  }

 const fetchAllProducts = async () => {
    if (loaded.value) return

    await fetchProducts(DEFAULT_PAGE)
  }

  const getProductById = (id: number): Product | undefined => {
    return items.value[id]
  }

  return {
    items,
    ids,
    isLoading,
    error,
    currentPage,
    lastPage,
    perPage,
    total,
    list,
    loaded,
    fetchProducts,
    fetchAllProducts,
    getProductById
  }
})

