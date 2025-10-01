import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProductsStore } from './products'
import type { CartEntry, CartItemDisplay } from '@/types/cart'

const CART_STORAGE_KEY = 'shopping_cart'

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

  function add(productId: number) {
    if (contents.value[productId]) {
      contents.value[productId].quantity += 1
    } else {
      contents.value[productId] = {
        productId,
        quantity: 1
      }
    }
    saveToStorage()
  }

  function remove(productId: number) {
    if (!contents.value[productId]) return

    contents.value[productId].quantity -= 1

    if (contents.value[productId].quantity === 0) {
      delete contents.value[productId]
    }
    saveToStorage()
  }

  function clearCart() {
    contents.value = {}
    saveToStorage()
  }

  function saveToStorage() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(contents.value))
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored && stored !== 'undefined') {
        contents.value = JSON.parse(stored)
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

