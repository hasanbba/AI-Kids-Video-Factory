import { apiClient } from './client'
import type { ApiResource, User } from '@/types/auth'

export interface Credentials {
  email: string
  password: string
}

export interface RegistrationData extends Credentials {
  name: string
  password_confirmation: string
}

export interface ResetPasswordData extends Credentials {
  token: string
  password_confirmation: string
}

export interface ProfileData {
  name: string
  email: string
  avatar: string | null
}

export async function getCsrfCookie(): Promise<void> {
  const apiOrigin = new URL(apiClient.defaults.baseURL ?? 'http://localhost:8000/api/v1').origin
  await apiClient.get(`${apiOrigin}/sanctum/csrf-cookie`)
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<ApiResource<User>>('/user')
  return data.data
}

export async function login(payload: Credentials): Promise<User> {
  await getCsrfCookie()
  const { data } = await apiClient.post<ApiResource<User>>('/auth/login', payload)
  return data.data
}

export async function register(payload: RegistrationData): Promise<User> {
  await getCsrfCookie()
  const { data } = await apiClient.post<ApiResource<User>>('/auth/register', payload)
  return data.data
}

export async function logout(): Promise<void> {
  await getCsrfCookie()
  await apiClient.post('/auth/logout')
}

export async function requestPasswordReset(email: string): Promise<void> {
  await getCsrfCookie()
  await apiClient.post('/auth/forgot-password', { email })
}

export async function resetPassword(payload: ResetPasswordData): Promise<void> {
  await getCsrfCookie()
  await apiClient.post('/auth/reset-password', payload)
}

export async function updateProfile(payload: ProfileData): Promise<User> {
  await getCsrfCookie()
  const { data } = await apiClient.patch<ApiResource<User>>('/user', payload)
  return data.data
}

export async function changePassword(payload: {
  current_password: string
  password: string
  password_confirmation: string
}): Promise<void> {
  await getCsrfCookie()
  await apiClient.put('/user/password', payload)
}

export async function resendVerification(): Promise<void> {
  await getCsrfCookie()
  await apiClient.post('/auth/email/verification-notification')
}

export async function verifyEmail(id: string, hash: string, query: URLSearchParams): Promise<void> {
  await apiClient.get(`/auth/email/verify/${encodeURIComponent(id)}/${encodeURIComponent(hash)}?${query.toString()}`)
}
