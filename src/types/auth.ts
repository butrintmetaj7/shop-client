export interface User {
  id: number
  name: string
  email: string
  role: 'customer' | 'admin'
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
  role?: 'customer' | 'admin'
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export interface AuthError {
  message: string
  errors?: Record<string, string[]>
}
