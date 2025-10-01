export interface CartEntry {
  productId: number
  quantity: number
}

export interface CartItemDisplay {
  id: number
  image: string
  title: string
  quantity: number
  cost: number
}

export interface ShoppingCart {
  contents: Record<string, CartEntry>
}

