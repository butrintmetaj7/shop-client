export interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
}

export interface ProductsApiResponse {
  success: boolean
  data: Product[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

