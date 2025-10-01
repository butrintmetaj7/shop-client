import apiClient from './api'

import type { Product, ProductsApiResponse } from '@/types/product'

export const productService = {
  async getProducts(page: number = 1): Promise<ProductsApiResponse> {
    const response = await apiClient.get<ProductsApiResponse>('/products', {
      params: { page }
    })
    return response.data
  },

  async getProduct(id: number): Promise<Product> {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`)
    return response.data.data
  }
}

