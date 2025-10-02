import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProductsStore } from './products'
import type { CartEntry, CartItemDisplay } from '@/types/cart'

const CART_STORAGE_KEY = 'shopping_cart'
const MIN_VALID_PRODUCT_ID = 1
const QUANTITY_INCREMENT = 1
const QUANTITY_DECREMENT = 1
const INITIAL_QUANTITY = 1
const EMPTY_QUANTITY = 0

export const useCartStore = defineStore('cart', () => {
  const contents = ref<Record<string, CartEntry>>({})

  const count = computed(() => {
    return Object.keys(contents.value).reduce((acc, id) => {
      const entry = contents.value[id]
      return acc + (entry?.quantity || 0)
    }, 0)
  })

  const total = computed(() => {
    const productsStore = useProductsStore()
    return Object.keys(contents.value).reduce((acc, id) => {
      const numId = Number(id)
      const product = productsStore.items[numId]
      const entry = contents.value[id]
      if (!product || !entry) return acc
      return acc + product.price * entry.quantity
    }, 0)
  })

  const formattedCart = computed((): CartItemDisplay[] => {
    const productsStore = useProductsStore()

    if (!productsStore.loaded) return []

    return Object.keys(contents.value)
      .map((productId) => {
        const cartEntry = contents.value[productId]
        if (!cartEntry) return null

        const product = productsStore.items[cartEntry.productId]
        if (!product) return null

        return {
          id: cartEntry.productId,
          image: product.image,
          title: product.title,
          quantity: cartEntry.quantity,
          cost: cartEntry.quantity * product.price
        }
      })
      .filter((item): item is CartItemDisplay => item !== null)
  })

  const add = (productId: number) => {
    if (!productId || productId < MIN_VALID_PRODUCT_ID) {
      console.warn(`Invalid product ID: ${productId}`)
      return
    }
    
    if (contents.value[productId]) {
      contents.value[productId].quantity += QUANTITY_INCREMENT
    } else {
      contents.value[productId] = {
        productId,
        quantity: INITIAL_QUANTITY
      }
    }
    saveToStorage()
  }

  const remove = (productId: number) => {
    if (!productId || productId < MIN_VALID_PRODUCT_ID) {
      console.warn(`Invalid product ID: ${productId}`)
      return
    }
    
    if (!contents.value[productId]) return

    contents.value[productId].quantity -= QUANTITY_DECREMENT

    if (contents.value[productId].quantity === EMPTY_QUANTITY) {
      delete contents.value[productId]
    }
    saveToStorage()
  }

  const clearCart = () => {
    contents.value = {}
    saveToStorage()
  }

  const saveToStorage = () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(contents.value))
  }

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored && stored !== 'undefined') {
        contents.value = JSON.parse(stored)
      } else {
        contents.value = {}
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error)
      contents.value = {}
    }
  }

  loadFromStorage()

  return {
    contents,
    count,
    total,
    formattedCart,
    add,
    remove,
    clearCart
  }
})

