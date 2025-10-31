import apiClient from './api'
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth'

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/register', credentials)
    return response.data
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/login', credentials)
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/logout')
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>('/user')
    return response.data.data
  }
}

