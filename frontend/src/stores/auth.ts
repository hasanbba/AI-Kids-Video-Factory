import { defineStore } from 'pinia'
import * as authApi from '@/services/api/auth'
import type { Credentials, ProfileData, RegistrationData } from '@/services/api/auth'
import type { User } from '@/types/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    initialized: false,
    loading: false,
    unauthorizedListenerInstalled: false,
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
    can: (state) => (permission: string) => state.user?.permissions.includes(permission) ?? false,
    canAny: (state) => (permissions: string[]) => permissions.some((permission) => state.user?.permissions.includes(permission)),
  },
  actions: {
    installUnauthorizedListener() {
      if (this.unauthorizedListenerInstalled || typeof window === 'undefined') return

      window.addEventListener('app:unauthorized', () => {
        this.user = null
        this.initialized = true
      })
      this.unauthorizedListenerInstalled = true
    },
    async initialize() {
      this.installUnauthorizedListener()
      if (this.initialized) return

      try {
        this.user = await authApi.getCurrentUser()
      } catch {
        this.user = null
      } finally {
        this.initialized = true
      }
    },
    async refreshUser() {
      this.user = await authApi.getCurrentUser()
      this.initialized = true
    },
    async login(payload: Credentials) {
      this.loading = true
      try {
        this.user = await authApi.login(payload)
        this.initialized = true
      } finally {
        this.loading = false
      }
    },
    async register(payload: RegistrationData) {
      this.loading = true
      try {
        this.user = await authApi.register(payload)
        this.initialized = true
      } finally {
        this.loading = false
      }
    },
    async logout() {
      this.loading = true
      try {
        await authApi.logout()
      } finally {
        this.user = null
        this.initialized = true
        this.loading = false
      }
    },
    async updateProfile(payload: ProfileData) {
      this.user = await authApi.updateProfile(payload)
    },
    async changePassword(payload: { current_password: string; password: string; password_confirmation: string }) {
      await authApi.changePassword(payload)
    },
    async resendVerification() {
      await authApi.resendVerification()
    },
  },
})
