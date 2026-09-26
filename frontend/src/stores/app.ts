import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({ isLoading: false, errorMessage: null as string | null }),
  actions: {
    setLoading(isLoading: boolean) {
      this.isLoading = isLoading
    },
    setError(message: string | null) {
      this.errorMessage = message
    },
  },
})
