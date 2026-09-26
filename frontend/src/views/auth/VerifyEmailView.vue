<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AuthPanel from '@/components/ui/AuthPanel.vue'
import { getApiError } from '@/services/api/errors'
import { verifyEmail } from '@/services/api/auth'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const status = ref<'verifying' | 'verified' | 'error'>('verifying')
const message = ref('Checking your verification link…')
const resendMessage = ref('')
const resendError = ref('')
const resending = ref(false)

onMounted(async () => {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string') query.set(key, value)
  }

  try {
    await verifyEmail(String(route.params.id), String(route.params.hash), query)
    await auth.refreshUser()
    status.value = 'verified'
    message.value = 'Your email address is verified.'
  } catch (error) {
    status.value = 'error'
    message.value = getApiError(error).message || 'This link is invalid or expired. Request a new verification email.'
  }
})

async function resend() {
  resending.value = true
  resendMessage.value = ''
  resendError.value = ''
  try {
    await auth.resendVerification()
    resendMessage.value = 'If verification is required, a new link has been sent.'
  } catch (error) {
    resendError.value = getApiError(error).message
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <AuthPanel title="Verify your email" description="Confirm your address to secure your account and receive important updates.">
    <AppAlert v-if="status === 'error'" tone="error">{{ message }}</AppAlert>
    <AppAlert v-else>{{ message }}</AppAlert>
    <div class="mt-5 space-y-3" v-if="status !== 'verified'">
      <AppAlert v-if="resendMessage">{{ resendMessage }}</AppAlert>
      <AppAlert v-if="resendError" tone="error">{{ resendError }}</AppAlert>
      <AppButton :disabled="resending" @click="resend">{{ resending ? 'Sending…' : 'Send a new verification link' }}</AppButton>
    </div>
    <div class="mt-5"><RouterLink class="text-sm font-semibold text-indigo-700 hover:text-indigo-900" :to="{ name: 'profile' }">Return to your profile</RouterLink></div>
  </AuthPanel>
</template>
