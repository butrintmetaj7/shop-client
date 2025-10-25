import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '@/stores/products'

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
    // Suppress expected console warnings/errors during tests
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('add()', () => {
    it('should add a new product to the cart', () => {
      const cart = useCartStore()
      
      cart.add(1)
      
      expect(cart.contents['1']).toEqual({ productId: 1, quantity: 1 })
      expect(cart.count).toBe(1)
    })

    it('should increment quantity when adding existing product', () => {
      const cart = useCartStore()
      
      cart.add(1)
      cart.add(1)
      
      expect(cart.contents['1']!.quantity).toBe(2)
      expect(cart.count).toBe(2)
    })

    it('should handle multiple different products', () => {
      const cart = useCartStore()
      
      cart.add(1)
      cart.add(2)
      cart.add(1)
      
      expect(cart.contents['1']!.quantity).toBe(2)
      expect(cart.contents['2']!.quantity).toBe(1)
      expect(cart.count).toBe(3)
    })

    it('should reject zero as productId', () => {
      const cart = useCartStore()
      
      cart.add(0)
      
      expect(cart.contents['0']).toBeUndefined()
      expect(cart.count).toBe(0)
    })

    it('should reject negative numbers as productId', () => {
      const cart = useCartStore()
      
      cart.add(-1)
      
      expect(cart.contents['-1']).toBeUndefined()
      expect(cart.count).toBe(0)
    })
  })

  describe('remove()', () => {
    it('should decrement quantity when removing a product', () => {
      const cart = useCartStore()
      
      cart.add(1)
      cart.add(1)
      cart.remove(1)
      
      expect(cart.contents['1']!.quantity).toBe(1)
      expect(cart.count).toBe(1)
    })

    it('should delete product when quantity reaches 0', () => {
      const cart = useCartStore()
      
      cart.add(1)
      cart.remove(1)
      
      expect(cart.contents['1']).toBeUndefined()
      expect(cart.count).toBe(0)
    })

    it('should do nothing when removing non-existent product', () => {
      const cart = useCartStore()
      
      cart.remove(999)
      
      expect(cart.count).toBe(0)
    })
  })

  describe('count', () => {
    it('should return 0 for empty cart', () => {
      const cart = useCartStore()
      
      expect(cart.count).toBe(0)
    })

    it('should calculate total item count correctly', () => {
      const cart = useCartStore()
      
      cart.add(1)
      cart.add(1)
      cart.add(2)
      
      expect(cart.count).toBe(3)
    })
  })

  describe('total', () => {
    it('should return 0 for empty cart', () => {
      const cart = useCartStore()
      
      expect(cart.total).toBe(0)
    })

    it('should calculate total price correctly', () => {
      const cart = useCartStore()
      const products = useProductsStore()
      
      products.items = {
        1: { id: 1, title: 'Product 1', price: 10.50, description: '', category: '', image: '' },
        2: { id: 2, title: 'Product 2', price: 20.00, description: '', category: '', image: '' }
      }
      
      cart.add(1)
      cart.add(1)
      cart.add(2)
      
      expect(cart.total).toBe(41.00)
    })
  })

  describe('clearCart()', () => {
    it('should empty the cart', () => {
      const cart = useCartStore()
      
      cart.add(1)
      cart.add(2)
      cart.clearCart()
      
      expect(cart.count).toBe(0)
      expect(Object.keys(cart.contents).length).toBe(0)
    })
  })

  describe('formattedCart', () => {
    it('should return empty array when products not loaded', () => {
      const cart = useCartStore()
      const products = useProductsStore()
      
      cart.add(1)
      
      expect(cart.formattedCart).toEqual([])
    })

    it('should format cart items correctly', () => {
      const cart = useCartStore()
      const products = useProductsStore()
      
      // Mock products as loaded
      products.items = {
        1: { id: 1, title: 'Product 1', price: 10.00, description: '', category: '', image: 'img1.jpg' }
      }
      products.ids = [1]
      
      cart.add(1)
      cart.add(1)
      
      const formatted = cart.formattedCart
      
      expect(formatted).toHaveLength(1)
      expect(formatted[0]).toEqual({
        id: 1,
        image: 'img1.jpg',
        title: 'Product 1',
        quantity: 2,
        cost: 20.00
      })
    })
  })

  describe('localStorage persistence', () => {
    it('should persist cart to localStorage', () => {
      const cart = useCartStore()
      
      cart.add(1)
      cart.add(2)
      
      const stored = localStorage.getItem('shopping_cart')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed['1']).toEqual({ productId: 1, quantity: 1 })
      expect(parsed['2']).toEqual({ productId: 2, quantity: 1 })
    })

    it('should load cart from localStorage on init', () => {
      localStorage.setItem('shopping_cart', JSON.stringify({
        '1': { productId: 1, quantity: 3 }
      }))
      
      setActivePinia(createPinia())
      const cart = useCartStore()
      
      expect(cart.count).toBe(3)
      expect(cart.contents['1']!.quantity).toBe(3)
    })

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('shopping_cart', 'invalid json')
      
      setActivePinia(createPinia())
      const cart = useCartStore()
      
      expect(cart.count).toBe(0)
      expect(cart.contents).toEqual({})
    })
  })
})

