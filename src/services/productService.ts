import apiClient from './api'

import type { Product, ProductsApiResponse } from '@/types/product'

const DEFAULT_PAGE = 1

export const productService = {
  getProducts: async (page: number = DEFAULT_PAGE): Promise<ProductsApiResponse> => {
    const response = await apiClient.get<ProductsApiResponse>('shop/products', {
      params: { page }
    })
    return response.data
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`shop/products/${id}`)
    return response.data.data
  }
}

